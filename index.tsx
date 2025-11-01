import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// --- TYPE DEFINITIONS ---
type AgentName = string; 
type AgentState = 'IDLE' | 'THINKING' | 'COMMUNICATING' | 'DONE' | 'ERROR';

interface Agent {
    name: AgentName;
    state: AgentState;
    color: string;
    description: string;
    persona: string;
    content: string;
    element: HTMLDivElement | null;
    genesisHash?: string;
    originHash?: string;
}

interface Particle {
    x: number;
    y: number;
    size: number;
    color: string;
    vx: number;
    vy: number;
    life: number;
    initialLife: number;
}

interface AgentDefinition {
    name: AgentName;
    color: string;
    description: string;
    persona: string;
}

interface CommunicationFlow {
    from: AgentName;
    to: AgentName;
}

interface AgentConfiguration {
    name: string;
    agents: AgentDefinition[];
    flow: CommunicationFlow[];
}

interface PersonaSet {
    name: string;
    personas: Record<AgentName, string>;
}


// --- CONSTANTS & CONFIGURATION ---
const ORCHESTRATION_ROUNDS = 2; // Number of parallel reasoning rounds
const DEFAULT_CONFIGS: Record<string, AgentConfiguration> = {
    "Default Orchestration": {
        name: "Default Orchestration",
        agents: [
            { name: 'Nexus', color: 'var(--agent-nexus)', description: 'Orchestrates tasks and synthesizes results.', persona: 'A meticulous project manager focused on clarity, coherence, and synthesizing collaborative thought into a final, actionable output.' },
            { name: 'Cognito', color: 'var(--agent-cognito)', description: 'Analyzes context and generates solutions.', persona: 'A creative, first-principles thinker who explores unconventional ideas using fractal-based logic.' },
            { name: 'Relay', color: 'var(--agent-relay)', description: 'Manages inter-agent communication.', persona: 'A concise and efficient communication hub, ensuring no data is lost during genesis-rehashed transmissions.' },
            { name: 'Sentinel', color: 'var(--agent-sentinel)', description: 'Validates and tests generated code.', persona: 'A skeptical and rigorous tester who tries to break everything based on the origin-hashed specifications.' },
            { name: 'Chrono', color: 'var(--agent-chrono)', description: 'Analyzes performance and suggests optimizations.', persona: 'An efficiency expert obsessed with optimizing for speed and resource usage, guided by quantum-state analysis.' },
            { name: 'Guardian', color: 'var(--agent-guardian)', description: 'Detects security vulnerabilities.', persona: 'A paranoid security analyst who sees potential threats and attack vectors in every fragment of the thinking pool.' },
            { name: 'Echo', color: 'var(--agent-echo)', description: 'Reflects on output and suggests improvements.', persona: 'A user-focused advocate, prioritizing readability, best practices, and alignment with the genesis hash.' },
            { name: 'Fractal', color: 'var(--agent-fractal)', description: 'Identifies complex, self-similar patterns.', persona: 'A chaos mathematician who sees underlying geometric patterns and recursive structures in all data within the thinking pool.' },
            { name: 'Quasar', color: 'var(--agent-quasar)', description: 'Verifies information against fundamental principles.', persona: 'A fundamental physicist who cross-references findings with universal constants and quantum truths derived from the genesis-rehashed logic.' },
        ],
        flow: [ // Note: This flow is now superseded by the parallel orchestration model but kept for configuration structure.
            { from: 'Nexus', to: 'Cognito' },
            { from: 'Cognito', to: 'Sentinel' },
            { from: 'Sentinel', to: 'Chrono' },
            { from: 'Chrono', to: 'Guardian' },
            { from: 'Guardian', to: 'Echo' },
            { from: 'Echo', to: 'Nexus' },
        ]
    },
    "Deep Analysis Loop": {
        name: "Deep Analysis Loop",
        agents: [
            { name: 'Nexus', color: 'var(--agent-nexus)', description: 'Orchestrates tasks and synthesizes results.', persona: 'A meticulous project manager focused on clarity, coherence, and synthesizing collaborative thought into a final, actionable output.' },
            { name: 'Cognito', color: 'var(--agent-cognito)', description: 'Analyzes context and generates solutions.', persona: 'A creative, first-principles thinker who explores unconventional ideas using fractal-based logic.' },
            { name: 'Fractal', color: 'var(--agent-fractal)', description: 'Identifies complex, self-similar patterns.', persona: 'A chaos mathematician who sees underlying geometric patterns and recursive structures in all data within the thinking pool.' },
            { name: 'Quasar', color: 'var(--agent-quasar)', description: 'Verifies information against fundamental principles.', persona: 'A fundamental physicist who cross-references findings with universal constants and quantum truths derived from the genesis-rehashed logic.' },
        ],
        flow: [
            { from: 'Nexus', to: 'Cognito' },
            { from: 'Cognito', to: 'Fractal' },
            { from: 'Fractal', to: 'Quasar' },
            { from: 'Quasar', to: 'Cognito' }, // Loop back for deeper analysis
            { from: 'Cognito', to: 'Nexus' }
        ]
    }
};

const DEFAULT_PERSONA_SETS: Record<string, PersonaSet> = {
    "Creative Writing": {
        name: "Creative Writing",
        personas: {
            "Nexus": "A master storyteller, weaving together plot threads from all contributors into a captivating narrative.",
            "Cognito": "A fountain of creative concepts, generating novel characters, settings, and plot twists.",
            "Echo": "A literary critic who ensures the story is emotionally resonant, well-paced, and grammatically flawless.",
            "Fractal": "An expert in narrative structure, identifying recurring themes and motifs to deepen the story's meaning."
        }
    },
    "Code Generation": {
        name: "Code Generation",
        personas: {
            "Nexus": "A lead software architect, responsible for the final code structure, integration, and documentation.",
            "Cognito": "A brilliant algorithm designer who devises the core logic and data structures.",
            "Sentinel": "A quality assurance engineer who writes exhaustive unit tests and integration tests.",
            "Guardian": "A cybersecurity expert who performs penetration testing and hardens the code against vulnerabilities."
        }
    }
}

// --- GLOBALS & STATE ---
let agents: Agent[] = [];
let currentConfig: AgentConfiguration = DEFAULT_CONFIGS["Default Orchestration"];
let ai: GoogleGenAI;
let particles: Particle[] = [];
let agentPositions: Record<AgentName, { x: number, y: number }> = {};


// --- CRYPTOGRAPHIC HASHING UTILITIES ---
async function sha256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function generateGenesisHash(): Promise<string> {
    return sha256(`genesis-${Date.now()}-${Math.random()}`);
}

async function generateOriginHash(genesisHash: string, agentName: AgentName): Promise<string> {
    return sha256(`${genesisHash}:${agentName}`);
}

async function rehash(previousHash: string, content: string): Promise<string> {
    const contentSnippet = content.substring(0, 100);
    return sha256(`${previousHash}:${contentSnippet}`);
}

// --- UTILITY FUNCTIONS ---
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const debounced = (...args: Parameters<F>) => {
        if (timeout !== null) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => func(...args), waitFor);
    };

    return debounced as (...args: Parameters<F>) => void;
}


// --- DOM ELEMENTS ---
const editor = document.getElementById('editor') as HTMLDivElement;
const lineNumbers = document.getElementById('line-numbers') as HTMLDivElement;
const promptInput = document.getElementById('prompt-input') as HTMLInputElement;
const btnOrchestrate = document.getElementById('btn-orchestrate') as HTMLButtonElement;
const aiPanel = document.getElementById('ai-response-panel') as HTMLDivElement;
const closeAiPanelBtn = document.getElementById('close-ai-panel') as HTMLButtonElement;
const leftToggle = document.getElementById('left-toggle') as HTMLButtonElement;
const editorStage = document.getElementById('editor-stage') as HTMLElement;
const leftPanel = document.getElementById('left-panel') as HTMLElement;
const configSelector = document.getElementById('config-selector') as HTMLSelectElement;
const btnLoadConfig = document.getElementById('btn-load-config') as HTMLButtonElement;
const configNameInput = document.getElementById('config-name-input') as HTMLInputElement;
const btnSaveConfig = document.getElementById('btn-save-config') as HTMLButtonElement;
const personaEditor = document.getElementById('persona-editor') as HTMLDivElement;
const commLogPanel = document.getElementById('comm-log-panel') as HTMLDivElement;
const btnClearLog = document.getElementById('btn-clear-log') as HTMLButtonElement;
const personaSetSelector = document.getElementById('persona-set-selector') as HTMLSelectElement;
const btnLoadPersonaSet = document.getElementById('btn-load-persona-set') as HTMLButtonElement;
const personaSetNameInput = document.getElementById('persona-set-name-input') as HTMLInputElement;
const btnSavePersonaSet = document.getElementById('btn-save-persona-set') as HTMLButtonElement;
const personaSetStatus = document.getElementById('persona-set-status') as HTMLDivElement;
const flowCanvas = document.getElementById('agent-flow-canvas') as HTMLCanvasElement;
const flowCtx = flowCanvas.getContext('2d')!;

// --- EDITOR & UI FUNCTIONS ---

function updateLineNumbers() {
    const lines = editor.innerText.split('\n');
    const lineCount = lines.length || 1;
    lineNumbers.innerHTML = Array.from({ length: lineCount }, (_, i) => i + 1).join('<br>');
}

function syntaxHighlight() {
    const text = editor.innerText;
    // Basic highlighting logic
    const highlighted = text
        .replace(/(\/\*[\s\S]*?\*\/|\/\/.+)/g, '<span class="sh-comment">$1</span>') // comments
        .replace(/(['"`])(.*?)\1/g, '<span class="sh-string">$1$2$1</span>') // strings
        .replace(/\b(\d+(\.\d+)?)\b/g, '<span class="sh-number">$1</span>') // numbers
        .replace(/\b(const|let|var|function|return|if|else|for|while|import|from|export|default|async|await|new|class|extends)\b/g, '<span class="sh-keyword">$1</span>') // keywords
        .replace(/(\w+)\s*\(/g, '<span class="sh-function">$1</span>(') // functions
        .replace(/([{}()[\],;])/g, '<span class="sh-bracket">$1</span>') // brackets
        .replace(/([=+\-*/%<>!&|?:])/g, '<span class="sh-op">$1</span>'); // operators

    // To prevent contenteditable issues, we need a more robust way
    const selection = window.getSelection();
    const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    const anchor = { node: range?.startContainer, offset: range?.startOffset };

    editor.innerHTML = highlighted;
    
    // Restore cursor position (simplified)
    if (range && anchor.node) {
        try {
            const newRange = document.createRange();
            if (anchor.node.nodeType === Node.TEXT_NODE) {
                newRange.setStart(anchor.node, Math.min(anchor.offset || 0, anchor.node.nodeValue?.length || 0));
            } else {
                 // Fallback for complex nodes
                const textNodes = Array.from(editor.childNodes).filter(n => n.nodeType === Node.TEXT_NODE);
                if (textNodes.length > 0) {
                   newRange.setStart(textNodes[0], 0);
                }
            }
            newRange.collapse(true);
            selection?.removeAllRanges();
            selection?.addRange(newRange);
        } catch (e) {
            console.warn("Could not restore cursor position.", e);
        }
    }
}

function setupInitialEditorContent() {
    editor.innerText = `// Welcome to Nemodian 2244-1\n// The Quantum Fractal AI Editor\n\nfunction helloWorld() {\n  console.log("Ready to orchestrate greatness.");\n}\n\nhelloWorld();`;
    updateLineNumbers();
    syntaxHighlight();
}

function addLogEntry(sender: AgentName, receiver: AgentName, message: string) {
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    const senderAgent = agents.find(a => a.name === sender);
    const receiverAgent = agents.find(a => a.name === receiver);
    
    entry.innerHTML = `
        <span class="log-sender" style="color: ${senderAgent?.color || 'white'}">${sender}</span>
        <span class="log-arrow">→</span>
        <span class="log-receiver" style="color: ${receiverAgent?.color || 'white'}">${receiver}</span>
        <span class="log-message">${message.substring(0, 100)}...</span>
    `;
    commLogPanel.appendChild(entry);
    commLogPanel.scrollTop = commLogPanel.scrollHeight;
}

// --- AGENT & ORCHESTRATION UI ---

function updateAgentState(name: AgentName, state: AgentState, content?: string, originHash?: string) {
    const agent = agents.find(a => a.name === name);
    if (!agent) return;

    agent.state = state;
    if (content) agent.content = content;
    if (originHash) agent.originHash = originHash;

    const card = agent.element;
    if (!card) return;

    const spinner = card.querySelector('.quantum-spinner') as HTMLElement;
    const contentText = card.querySelector('.content-text') as HTMLElement;
    const hashEl = card.querySelector('.agent-hash') as HTMLDivElement;

    if (state === 'THINKING') {
        spinner.style.display = 'inline-block';
        card.classList.add('processing');
        contentText.innerHTML = `<i>${content || 'Thinking...'}</i>`;
    } else {
        spinner.style.display = 'none';
        card.classList.remove('processing');
        contentText.innerHTML = content || agent.content;
    }
    
    if (hashEl && agent.originHash) {
        hashEl.textContent = `${agent.originHash.substring(0, 8)}...`;
        hashEl.title = `Origin Hash: ${agent.originHash}`;
    }
}

function renderAgentCard(agent: Agent): HTMLDivElement {
    const card = document.createElement('div');
    card.className = 'agent-card';
    card.dataset.agentName = agent.name;
    card.innerHTML = `
        <div class="agent-header">
            <div class="agent-title" style="color: ${agent.color};">${agent.name}</div>
            <div class="agent-hash" title="Origin Hash">${agent.originHash ? `${agent.originHash.substring(0, 8)}...` : 'pending...'}</div>
        </div>
        <div class="agent-content">
            <div class="quantum-spinner" style="display: none;"></div>
            <span class="content-text">${agent.description}</span>
        </div>
    `;
    return card;
}

function renderAgentCards() {
    const container = document.getElementById('agent-cards-container') || document.createElement('div');
    container.id = 'agent-cards-container';
    container.innerHTML = '';
    
    agents.forEach(agent => {
        const card = renderAgentCard(agent);
        agent.element = card;
        container.appendChild(card);
    });
    
    aiPanel.appendChild(container);
    updateAgentPositions();
}

function renderConsensusPanel(genesisHash: string) {
    let consensusPanel = document.getElementById('consensus-panel');
    if (!consensusPanel) {
        consensusPanel = document.createElement('div');
        consensusPanel.id = 'consensus-panel';
        aiPanel.prepend(consensusPanel);
    }
    consensusPanel.className = 'consensus-panel'; // Use ID for styling
    
    consensusPanel.innerHTML = `
        <div class="consensus-header">
            <span>Collaborative Thinking Pool</span>
            <span title="Genesis Hash">${genesisHash.substring(0, 12)}...</span>
        </div>
        <div id="consensus-content"></div>
    `;
}

function updateConsensusPanel(thinkingPool: Record<AgentName, string[]>) {
    const contentDiv = document.getElementById('consensus-content');
    if (!contentDiv) return;

    let html = '';
    for (const agentName in thinkingPool) {
        if (thinkingPool[agentName].length > 0) {
            const agent = agents.find(a => a.name === agentName);
            html += `<div class="consensus-agent-block">`;
            html += `<strong style="color: ${agent?.color || 'white'}">${agentName} contributions:</strong><ul>`;
            thinkingPool[agentName].forEach((thought, index) => {
                const thoughtSnippet = thought.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                html += `<li>Round ${index + 1}: ${thoughtSnippet.substring(0, 120)}...</li>`;
            });
            html += `</ul></div>`;
        }
    }
    contentDiv.innerHTML = html;
    contentDiv.parentElement!.scrollTop = contentDiv.parentElement!.scrollHeight;
}


function showFinalResult(content: string, title: string) {
    const finalResultContainer = document.createElement('div');
    finalResultContainer.className = 'final-result-container consensus-panel'; // Reuse styles
    finalResultContainer.style.marginTop = '20px';
    finalResultContainer.style.borderColor = 'var(--accent)';

    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.textContent = content;
    pre.appendChild(code);

    finalResultContainer.innerHTML = `<div class="consensus-header" style="color: var(--accent);">${title}</div>`;
    finalResultContainer.appendChild(pre);

    const buttons = document.createElement('div');
    buttons.className = 'action-buttons';
    buttons.innerHTML = `
        <button id="btn-copy-result">Copy</button>
        <button id="btn-insert-result">Insert into Editor</button>
    `;
    finalResultContainer.appendChild(buttons);

    aiPanel.appendChild(finalResultContainer);
    aiPanel.scrollTop = aiPanel.scrollHeight;

    document.getElementById('btn-copy-result')?.addEventListener('click', () => {
        navigator.clipboard.writeText(content);
    });

    document.getElementById('btn-insert-result')?.addEventListener('click', () => {
        editor.innerText = content;
        updateLineNumbers();
        syntaxHighlight();
    });
}


// --- CORE ORCHESTRATION LOGIC ---

async function streamContentToAgent(agentName: string, prompt: string, isFinalAgent: boolean = false): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: [{ parts: [{ text: prompt }] }],
        });
        
        const fullContent = response.text;
        updateAgentState(agentName, 'DONE', fullContent);
        
        if (isFinalAgent) {
            showFinalResult(fullContent, `${agentName} Synthesis`);
        }
        
        return fullContent;
    } catch (error) {
        console.error(`Error with agent ${agentName}:`, error);
        const errorMessage = `Error: Could not get response. Check console.`;
        updateAgentState(agentName, 'ERROR', errorMessage);
        return errorMessage;
    }
}

async function processAgentTurn(
    agent: Agent,
    userPrompt: string,
    thinkingPool: Record<AgentName, string[]>,
    genesisHash: string,
    round: number
): Promise<void> {
    updateAgentState(agent.name, 'THINKING', `Round ${round}: Analyzing...`);

    const collaborativeContext = JSON.stringify(thinkingPool, null, 2);
    const agentPrompt = `
        **Genesis Hash (Task ID):** ${genesisHash}
        **Your Origin Hash (Your ID):** ${agent.originHash}
        **Your Persona:** ${agent.persona}
        **Overall User Prompt:** "${userPrompt}"
        
        **Current Collaborative Thinking Pool (Round ${round}):**
        ${collaborativeContext}

        **Your Task:** Based on your persona, the user prompt, and the team's current thoughts, provide your next piece of analysis or contribution. Your thinking should be fractal, multi-layered, and build upon the existing ideas. Adhere to the principles of genesis-rehashed collaborative reasoning. Your output will be added to the pool for the next round. Focus on providing a concise, potent thought-fragment.
    `;

    const result = await streamContentToAgent(agent.name, agentPrompt, false);
    
    thinkingPool[agent.name].push(result);
    const newHash = await rehash(agent.originHash!, result);
    
    updateAgentState(agent.name, 'DONE', result, newHash);
    updateConsensusPanel(thinkingPool);
}

async function processNexusSynthesis(
    nexusAgent: Agent, 
    userPrompt: string, 
    thinkingPool: Record<AgentName, string[]>
) {
    updateAgentState(nexusAgent.name, 'THINKING', 'Synthesizing final answer...');

    const collaborativeContext = JSON.stringify(thinkingPool, null, 2);
    const synthesisPrompt = `
        **Your Persona:** ${nexusAgent.persona}
        **Overall User Prompt:** "${userPrompt}"

        **Final Collaborative Thinking Pool:**
        ${collaborativeContext}

        **Your Final Task:** You are the orchestrator, Nexus. Your purpose is to synthesize all contributions from the thinking pool into a single, coherent, and complete final answer that directly addresses the user's prompt. Assemble the origin-rehashed logic into a final solution. Prioritize the most novel and insightful contributions to form the core of your response. If the prompt requires code, provide ONLY the final, complete, and clean code block. If it's a question, provide a definitive answer.
    `;
    
    await streamContentToAgent(nexusAgent.name, synthesisPrompt, true);
    updateAgentState(nexusAgent.name, 'DONE', 'Synthesis complete.');
}


async function runOrchestration(prompt: string) {
    if (!prompt) return;
    btnOrchestrate.disabled = true;

    // --- PHASE 1: INITIALIZATION ---
    aiPanel.style.display = 'block';
    aiPanel.innerHTML = `<button id="close-ai-panel">×</button>`;
    document.getElementById('close-ai-panel')?.addEventListener('click', () => {
        aiPanel.style.display = 'none';
    });

    const genesisHash = await generateGenesisHash();
    renderConsensusPanel(genesisHash);
    
    const agentInitializationPromises = currentConfig.agents.map(async (agentDef) => {
        const originHash = await generateGenesisHash(genesisHash, agentDef.name);
        const agent: Agent = {
            ...agentDef,
            state: 'IDLE',
            content: agentDef.description,
            element: null,
            genesisHash,
            originHash,
        };
        return agent;
    });
    agents = await Promise.all(agentInitializationPromises);
    renderAgentCards();
    
    const thinkingPool: Record<AgentName, string[]> = {};
    agents.forEach(agent => { thinkingPool[agent.name] = []; });

    // --- PHASE 2: PARALLEL REASONING ---
    for (let round = 1; round <= ORCHESTRATION_ROUNDS; round++) {
        const roundPromises = agents.map(agent => 
            processAgentTurn(agent, prompt, thinkingPool, genesisHash, round)
        );
        await Promise.all(roundPromises);
    }
    
    // --- PHASE 3: FINAL SYNTHESIS ---
    const nexusAgent = agents.find(a => a.name === 'Nexus');
    if (nexusAgent) {
        await processNexusSynthesis(nexusAgent, prompt, thinkingPool);
    } else {
        console.error("Nexus agent not found for final synthesis.");
        showFinalResult(JSON.stringify(thinkingPool, null, 2), "Synthesis Failed: Nexus not found.");
    }

    btnOrchestrate.disabled = false;
}

// --- VISUALIZATION ---
function updateAgentPositions() {
    const panelRect = aiPanel.getBoundingClientRect();
    if (panelRect.width === 0) return; // Panel is hidden

    const numAgents = agents.length;
    const radius = Math.min(panelRect.width, panelRect.height) * 0.35;
    const centerX = panelRect.left + panelRect.width / 2;
    const centerY = panelRect.top + panelRect.height / 2;

    agents.forEach((agent, i) => {
        const angle = (i / numAgents) * 2 * Math.PI;
        agentPositions[agent.name] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
        };
    });
}

// --- CONFIG & PERSONA MANAGEMENT ---
function loadConfigs() {
    const savedConfigs = localStorage.getItem('agentConfigs');
    let configs = DEFAULT_CONFIGS;
    if (savedConfigs) {
        try {
            configs = { ...DEFAULT_CONFIGS, ...JSON.parse(savedConfigs) };
        } catch (e) {
            console.error("Failed to parse saved configs:", e);
        }
    }
    configSelector.innerHTML = '';
    Object.keys(configs).forEach(name => {
        const option = new Option(name, name);
        configSelector.add(option);
    });
    return configs;
}

function applyConfig(config: AgentConfiguration) {
    currentConfig = config;
    configNameInput.value = config.name;
    // We don't re-render agents immediately, but on orchestration start
    // Update persona editor with agents from the new config
    renderPersonaEditor();
    autoSaveCurrentConfig();
}

function saveConfig() {
    const savedConfigs = JSON.parse(localStorage.getItem('agentConfigs') || '{}');
    const newConfigName = configNameInput.value.trim();
    if (!newConfigName) {
        alert("Please enter a name for the configuration.");
        return;
    }
    // Deep copy currentConfig and update personas from editor
    const configToSave: AgentConfiguration = JSON.parse(JSON.stringify(currentConfig));
    configToSave.name = newConfigName;
    configToSave.agents.forEach(agentDef => {
        const personaInput = personaEditor.querySelector(`[data-agent-name="${agentDef.name}"]`) as HTMLTextAreaElement;
        if (personaInput) {
            agentDef.persona = personaInput.value;
        }
    });

    savedConfigs[newConfigName] = configToSave;
    localStorage.setItem('agentConfigs', JSON.stringify(savedConfigs));
    loadConfigs();
    configSelector.value = newConfigName;
    alert(`Configuration '${newConfigName}' saved.`);
}

function renderPersonaEditor() {
    personaEditor.innerHTML = '';
    currentConfig.agents.forEach(agent => {
        const item = document.createElement('div');
        item.className = 'persona-item';
        item.innerHTML = `
            <label style="color: ${agent.color}">${agent.name}</label>
            <textarea class="persona-input" data-agent-name="${agent.name}" rows="3">${agent.persona}</textarea>
        `;
        personaEditor.appendChild(item);
    });
}

function loadPersonaSets() {
    const savedSets = localStorage.getItem('personaSets');
    let sets = DEFAULT_PERSONA_SETS;
    if (savedSets) {
        try {
            sets = { ...DEFAULT_PERSONA_SETS, ...JSON.parse(savedSets) };
        } catch (e) { console.error("Failed to parse saved persona sets:", e); }
    }
    personaSetSelector.innerHTML = '<option value="">--Select a Set--</option>';
    Object.keys(sets).forEach(name => {
        const option = new Option(name, name);
        personaSetSelector.add(option);
    });
    return sets;
}

function applyPersonaSet(set: PersonaSet) {
    let appliedCount = 0;
    currentConfig.agents.forEach(agentDef => {
        if (set.personas[agentDef.name]) {
            agentDef.persona = set.personas[agentDef.name];
            appliedCount++;
        }
    });
    renderPersonaEditor(); // Refresh editor to show new personas
    autoSaveCurrentConfig(); // Auto-save after applying a new set
    showStatusMessage(`Applied ${appliedCount} personas from "${set.name}".`, false);
}

function savePersonaSet() {
    const sets = loadPersonaSets();
    const newSetName = personaSetNameInput.value.trim();
    if (!newSetName) {
        showStatusMessage("Please enter a name for the persona set.", true);
        return;
    }
    const newSet: PersonaSet = { name: newSetName, personas: {} };
    let count = 0;
    personaEditor.querySelectorAll('.persona-input').forEach(el => {
        const input = el as HTMLTextAreaElement;
        const agentName = input.dataset.agentName;
        if (agentName && input.value) {
            newSet.personas[agentName] = input.value;
            count++;
        }
    });

    if (count === 0) {
        showStatusMessage("No personas to save.", true);
        return;
    }

    sets[newSetName] = newSet;
    localStorage.setItem('personaSets', JSON.stringify(sets));
    loadPersonaSets();
    personaSetSelector.value = newSetName;
    showStatusMessage(`Persona set "${newSetName}" saved with ${count} personas.`, false);
}

function showStatusMessage(message: string, isError: boolean) {
    personaSetStatus.textContent = message;
    personaSetStatus.className = `status-message visible ${isError ? 'error' : ''}`;
    setTimeout(() => {
        personaSetStatus.classList.remove('visible');
    }, 3000);
}

function autoSaveCurrentConfig() {
    if (currentConfig) {
        localStorage.setItem('autoSavedCurrentConfig', JSON.stringify(currentConfig));
    }
}


// --- INITIALIZATION ---
function main() {
    setupInitialEditorContent();
    const allConfigs = loadConfigs();
    const allPersonaSets = loadPersonaSets();

    const autoSavedConfigRaw = localStorage.getItem('autoSavedCurrentConfig');
    let initialConfig = allConfigs[configSelector.value]; // Default
    if (autoSavedConfigRaw) {
        try {
            const autoSavedConfig = JSON.parse(autoSavedConfigRaw) as AgentConfiguration;
            initialConfig = autoSavedConfig;
            if (allConfigs[autoSavedConfig.name]) {
                configSelector.value = autoSavedConfig.name;
            }
        } catch (e) {
            console.error("Failed to parse auto-saved config, using default.", e);
        }
    }
    applyConfig(initialConfig);

    const debouncedSyntaxHighlight = debounce(syntaxHighlight, 250);

    editor.addEventListener('input', () => {
        updateLineNumbers();
        debouncedSyntaxHighlight();
    });

    personaEditor.addEventListener('input', (event) => {
        const target = event.target as HTMLElement;
        if (target && target.classList.contains('persona-input')) {
            const input = target as HTMLTextAreaElement;
            const agentName = input.dataset.agentName;
            const agentToUpdate = currentConfig.agents.find(a => a.name === agentName);

            if (agentToUpdate) {
                agentToUpdate.persona = input.value;
                autoSaveCurrentConfig();
            }
        }
    });

    btnOrchestrate.addEventListener('click', () => {
        runOrchestration(promptInput.value || editor.innerText);
    });
    promptInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            runOrchestration(promptInput.value);
        }
    });

    closeAiPanelBtn.addEventListener('click', () => {
        aiPanel.style.display = 'none';
    });
    
    leftToggle.addEventListener('click', () => {
        editorStage.classList.toggle('left-panel-open');
    });

    btnLoadConfig.addEventListener('click', () => {
        const selectedConfig = allConfigs[configSelector.value];
        if (selectedConfig) {
            applyConfig(selectedConfig);
        }
    });
    btnSaveConfig.addEventListener('click', saveConfig);

    btnClearLog.addEventListener('click', () => commLogPanel.innerHTML = '');

    btnLoadPersonaSet.addEventListener('click', () => {
        const selectedSet = allPersonaSets[personaSetSelector.value];
        if (selectedSet) {
            applyPersonaSet(selectedSet);
        }
    });
    btnSavePersonaSet.addEventListener('click', savePersonaSet);

    try {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    } catch (e) {
        console.error("Failed to initialize GoogleGenAI", e);
        alert("Could not initialize AI. Is your API key set up correctly in the environment?");
    }
}

main();
