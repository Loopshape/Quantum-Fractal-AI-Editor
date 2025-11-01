// --- TYPE DEFINITIONS ---
type AgentName = string; // More flexible for custom configs
type AgentState = 'IDLE' | 'THINKING' | 'COMMUNICATING' | 'DONE' | 'ERROR';

interface Agent {
    name: AgentName;
    state: AgentState;
    color: string;
    description: string;
    persona: string;
    content: string;
    element: HTMLDivElement | null;
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
const DEFAULT_CONFIGS: Record<string, AgentConfiguration> = {
    "Default Orchestration": {
        name: "Default Orchestration",
        agents: [
            { name: 'Nexus', color: 'var(--agent-nexus)', description: 'Orchestrates tasks and synthesizes results.', persona: 'A meticulous project manager focused on clarity and coherence.' },
            { name: 'Cognito', color: 'var(--agent-cognito)', description: 'Analyzes context and generates solutions.', persona: 'A creative, first-principles thinker who explores unconventional ideas.' },
            { name: 'Relay', color: 'var(--agent-relay)', description: 'Manages inter-agent communication.', persona: 'A concise and efficient communication hub, ensuring no data is lost.' },
            { name: 'Sentinel', color: 'var(--agent-sentinel)', description: 'Validates and tests generated code.', persona: 'A skeptical and rigorous tester who tries to break everything.' },
            { name: 'Chrono', color: 'var(--agent-chrono)', description: 'Analyzes performance and suggests optimizations.', persona: 'An efficiency expert obsessed with optimizing for speed and resource usage.' },
            { name: 'Guardian', color: 'var(--agent-guardian)', description: 'Detects security vulnerabilities.', persona: 'A paranoid security analyst who sees potential threats everywhere.' },
            { name: 'Echo', color: 'var(--agent-echo)', description: 'Reflects on output and suggests improvements.', persona: 'A user-focused advocate, prioritizing readability and best practices.' },
            { name: 'Fractal', color: 'var(--agent-fractal)', description: 'Identifies complex, self-similar patterns.', persona: 'A chaos mathematician who sees underlying geometric patterns and recursive structures in all data.' },
            { name: 'Quasar', color: 'var(--agent-quasar)', description: 'Verifies information against fundamental principles.', persona: 'A fundamental physicist who cross-references findings with universal constants and quantum truths.' },
        ],
        flow: [
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
            { name: 'Nexus', color: 'var(--agent-nexus)', description: 'Orchestrates the analysis task.', persona: 'A meticulous project manager initiating deep analysis.' },
            { name: 'Cognito', color: 'var(--agent-cognito)', description: 'Generates initial hypotheses and data.', persona: 'A creative, first-principles thinker exploring the problem space.' },
            { name: 'Fractal', color: 'var(--agent-fractal)', description: 'Identifies complex patterns in the data.', persona: 'A chaos mathematician seeking recursive structures.' },
            { name: 'Quasar', color: 'var(--agent-quasar)', description: 'Verifies patterns against core principles.', persona: 'A physicist validating findings with fundamental truths.' },
            { name: 'Echo', color: 'var(--agent-echo)', description: 'Reflects on the verified insights.', persona: 'A senior strategist focusing on the implications of the findings.' },
        ],
        flow: [
            { from: 'Nexus', to: 'Cognito' },
            { from: 'Cognito', to: 'Fractal' },
            { from: 'Fractal', to: 'Quasar' },
            { from: 'Quasar', to: 'Echo' },
            { from: 'Echo', to: 'Nexus' },
        ]
    },
    "Code Review Loop": {
        name: "Code Review Loop",
        agents: [
            { name: 'Cognito', color: 'var(--agent-cognito)', description: 'Proposes initial code implementation.', persona: 'A pragmatic developer who values speed and functionality.' },
            { name: 'Sentinel', color: 'var(--agent-sentinel)', description: 'Performs static analysis and testing.', persona: 'An automated linter and testing framework, strictly enforcing rules.' },
            { name: 'Chrono', color: 'var(--agent-chrono)', description: 'Analyzes performance and suggests optimizations.', persona: 'An efficiency expert obsessed with optimizing for speed and resource usage.' },
            { name: 'Guardian', color: 'var(--agent-guardian)', description: 'Detects security vulnerabilities.', persona: 'A paranoid security analyst who sees potential threats everywhere.' },
            { name: 'Echo', color: 'var(--agent-echo)', description: 'Reviews for style, clarity, and best practices.', persona: 'A senior developer with a focus on long-term maintainability.' },
        ],
        flow: [
            { from: 'Cognito', to: 'Sentinel' },
            { from: 'Sentinel', to: 'Chrono' },
            { from: 'Chrono', to: 'Guardian' },
            { from: 'Guardian', to: 'Echo' },
            { from: 'Echo', to: 'Cognito' },
        ]
    },
    "Simple Loop": {
        name: "Simple Loop",
        agents: [
            { name: 'Nexus', color: 'var(--agent-nexus)', description: 'Orchestrates tasks and synthesizes results.', persona: 'A meticulous project manager focused on clarity and coherence.' },
            { name: 'Cognito', color: 'var(--agent-cognito)', description: 'Analyzes context and generates solutions.', persona: 'A creative, first-principles thinker who explores unconventional ideas.' },
            { name: 'Sentinel', color: 'var(--agent-sentinel)', description: 'Validates and tests generated code.', persona: 'A skeptical and rigorous tester who tries to break everything.' },
        ],
        flow: [
            { from: 'Nexus', to: 'Cognito' },
            { from: 'Cognito', to: 'Sentinel' },
            { from: 'Sentinel', to: 'Nexus' },
        ]
    },
    "Expanded Security Loop": {
        name: "Expanded Security Loop",
        agents: [
            { name: 'Nexus', color: 'var(--agent-nexus)', description: 'Orchestrates tasks and synthesizes results.', persona: 'A meticulous project manager focused on clarity and coherence.' },
            { name: 'Cognito', color: 'var(--agent-cognito)', description: 'Analyzes context and generates solutions.', persona: 'A creative, first-principles thinker who explores unconventional ideas.' },
            { name: 'Sentinel', color: 'var(--agent-sentinel)', description: 'Validates and tests generated code.', persona: 'A skeptical and rigorous tester who tries to break everything.' },
            { name: 'Chrono', color: 'var(--agent-chrono)', description: 'Analyzes performance and suggests optimizations.', persona: 'An efficiency expert obsessed with optimizing for speed and resource usage.' },
            { name: 'Guardian', color: 'var(--agent-guardian)', description: 'Detects security vulnerabilities.', persona: 'A paranoid security analyst who sees potential threats everywhere.' },
        ],
        flow: [
            { from: 'Nexus', to: 'Cognito' },
            { from: 'Cognito', to: 'Sentinel' },
            { from: 'Sentinel', to: 'Chrono' },
            { from: 'Chrono', to: 'Guardian' },
            { from: 'Guardian', to: 'Nexus' },
        ]
    }
};

const PARTICLE_COUNT = 30;
const PARTICLE_SPEED = 1.5;
const PARTICLE_LIFE = 150;

// --- APPLICATION STATE ---
let agents: Record<AgentName, Agent> = {} as any;
let particles: Particle[] = [];
let animationFrameId: number | null = null;
let isSimulating = false;
let communicationLinks: { from: AgentName; to: AgentName }[] = [];
let savedConfigurations: Record<string, AgentConfiguration> = {};
let savedPersonaSets: Record<string, PersonaSet> = {};
let currentConfiguration: AgentConfiguration;

// --- DOM ELEMENT REFERENCES ---
let editor: HTMLDivElement,
    lineNumbers: HTMLDivElement,
    orchestrateButton: HTMLButtonElement,
    aiResponsePanel: HTMLDivElement,
    closeAiPanelButton: HTMLButtonElement,
    leftToggleButton: HTMLButtonElement,
    editorStage: HTMLDivElement,
    flowCanvas: HTMLCanvasElement,
    flowCtx: CanvasRenderingContext2D,
    configSelector: HTMLSelectElement,
    loadConfigButton: HTMLButtonElement,
    saveConfigButton: HTMLButtonElement,
    configNameInput: HTMLInputElement,
    personaEditorContainer: HTMLDivElement,
    personaSetSelector: HTMLSelectElement,
    loadPersonaSetButton: HTMLButtonElement,
    savePersonaSetButton: HTMLButtonElement,
    personaSetNameInput: HTMLInputElement,
    commLogPanel: HTMLDivElement,
    clearLogButton: HTMLButtonElement;


// --- UTILITY FUNCTIONS ---
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- EDITOR LOGIC ---
function updateLineNumbers() {
    if (!editor || !lineNumbers) return;
    const lineCount = editor.innerText.split('\n').length;
    lineNumbers.innerHTML = Array.from({ length: lineCount }, (_, i) => i + 1).join('\n');
}

// --- AGENT & VISUALIZATION LOGIC ---

function initializeAgents() {
    agents = currentConfiguration.agents.reduce((acc, def) => {
        acc[def.name] = {
            ...def,
            state: 'IDLE',
            content: 'Waiting for task...',
            element: null,
        };
        return acc;
    }, {} as Record<AgentName, Agent>);
}

function renderAgentCards() {
    aiResponsePanel.innerHTML = '<button id="close-ai-panel">×</button>'; // Clear previous
    for (const agentName in agents) {
        const agent = agents[agentName as AgentName];
        const card = document.createElement('div');
        card.className = 'agent-card';
        card.dataset.agentName = agent.name;
        let innerHTML = `
            <div class="agent-title" style="color: ${agent.color};">${agent.name}</div>
            <div class="agent-content">
                <div class="quantum-spinner" style="display: none;"></div>
                <span class="agent-status-text">${agent.content}</span>
            </div>
        `;
        
        if (agent.name === 'Nexus') {
            innerHTML += `
                <div class="nexus-task-input-container">
                    <input type="text" id="nexus-task-input" placeholder="Enter initial task for Nexus...">
                    <button id="nexus-start-button">Start</button>
                </div>
            `;
        }
        card.innerHTML = innerHTML;

        aiResponsePanel.appendChild(card);
        agent.element = card;
    }

    // Add event listener for the Nexus start button
    const nexusStartButton = document.getElementById('nexus-start-button');
    if (nexusStartButton) {
        nexusStartButton.addEventListener('click', runMultiAgentConsensus);
    }

    (aiResponsePanel.querySelector('#close-ai-panel') as HTMLButtonElement)?.addEventListener('click', () => {
        aiResponsePanel.style.display = 'none';
        stopVisualization();
    });
}

function updateAgentCardUI(agentName: AgentName, state: AgentState, content: string) {
    const agent = agents[agentName];
    if (!agent || !agent.element) return;
    
    agent.state = state;
    agent.content = content;

    const spinner = agent.element.querySelector('.quantum-spinner') as HTMLDivElement;
    const statusText = agent.element.querySelector('.agent-status-text') as HTMLSpanElement;

    spinner.style.display = state === 'THINKING' || state === 'COMMUNICATING' ? 'inline-block' : 'none';
    statusText.textContent = content;

    if (state === 'THINKING' || state === 'COMMUNICATING') {
        agent.element.classList.add('processing');
    } else {
        agent.element.classList.remove('processing');
    }
}

function getAgentCardCenter(agentName: AgentName): { x: number; y: number } | null {
    const el = agents[agentName]?.element;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
    };
}

function startVisualization() {
    flowCanvas.style.display = 'block';
    const resizeCanvas = () => {
        flowCanvas.width = window.innerWidth;
        flowCanvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationLoop();
}

function stopVisualization() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    isSimulating = false;
    flowCanvas.style.display = 'none';
    communicationLinks = [];
    particles = [];
}

function animationLoop() {
    if (!isSimulating) {
        stopVisualization();
        return;
    }

    flowCtx.clearRect(0, 0, flowCanvas.width, flowCanvas.height);
    drawConnections();
    updateAndDrawParticles();

    animationFrameId = requestAnimationFrame(animationLoop);
}

function drawConnections() {
    communicationLinks.forEach(link => {
        const fromPos = getAgentCardCenter(link.from);
        const toPos = getAgentCardCenter(link.to);
        if (fromPos && toPos) {
            flowCtx.beginPath();
            flowCtx.moveTo(fromPos.x, fromPos.y);
            flowCtx.lineTo(toPos.x, toPos.y);
            flowCtx.strokeStyle = `${agents[link.from].color}80`; // Add alpha
            flowCtx.lineWidth = 1;
            flowCtx.stroke();
        }
    });
}

function updateAndDrawParticles() {
    particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;

        if (p.life <= 0) {
            particles.splice(index, 1);
            return;
        }

        flowCtx.beginPath();
        flowCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2, false);
        flowCtx.fillStyle = p.color;
        flowCtx.globalAlpha = p.life / p.initialLife;
        flowCtx.fill();
        flowCtx.globalAlpha = 1.0;
    });
}

function createParticles(from: AgentName, to: AgentName) {
    const fromPos = getAgentCardCenter(from);
    const toPos = getAgentCardCenter(to);

    if (!fromPos || !toPos) return;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x);
        particles.push({
            x: fromPos.x,
            y: fromPos.y,
            size: Math.random() * 1.5 + 1,
            color: agents[from].color,
            vx: Math.cos(angle) * PARTICLE_SPEED + (Math.random() - 0.5),
            vy: Math.sin(angle) * PARTICLE_SPEED + (Math.random() - 0.5),
            life: Math.random() * PARTICLE_LIFE,
            initialLife: PARTICLE_LIFE,
        });
    }
}

async function setCommunicationLink(from: AgentName, to: AgentName, duration: number) {
    communicationLinks = [{ from, to }];
    const interval = setInterval(() => createParticles(from, to), 100);
    
    updateAgentCardUI(from, 'COMMUNICATING', `Sending data to ${to}...`);
    updateAgentCardUI(to, 'THINKING', `Receiving data from ${from}...`);

    await sleep(duration);

    clearInterval(interval);
    communicationLinks = [];
}

async function simulationSequence(initialTask: string) {
    clearCommLogs();
    addCommLog('System', 'Nexus', `Orchestration initiated. Task: "${initialTask}"`);

    const agentNames = Object.keys(agents) as AgentName[];
    
    // Nexus gets the specific task, others get a generic message
    for (const name of agentNames) {
        if (name === 'Nexus') {
            updateAgentCardUI(name as AgentName, 'THINKING', `Task: ${initialTask}`);
        } else {
            updateAgentCardUI(name as AgentName, 'THINKING', 'Orchestration started...');
        }
    }
    await sleep(1500);

    for (const link of currentConfiguration.flow) {
        if (agents[link.from] && agents[link.to]) {
            await setCommunicationLink(link.from, link.to, 2000);
            addCommLog(link.from, link.to, `Passing control and data context.`);
        }
    }
    
    const lastAgentInFlow = currentConfiguration.flow[currentConfiguration.flow.length - 1]?.to;
    if (lastAgentInFlow && agents[lastAgentInFlow]) {
        const lastAgent = agents[lastAgentInFlow];
        updateAgentCardUI(lastAgentInFlow, 'THINKING', `Synthesizing result with persona: "${lastAgent.persona}"`);
    }
    await sleep(1500);
    
    for (const name of agentNames) {
        updateAgentCardUI(name as AgentName, 'DONE', 'Consensus reached.');
    }
    addCommLog('System', 'All', `Consensus reached. Orchestration complete.`);

}

function showAgentPanel() {
    if (isSimulating) return;
    clearCommLogs();
    initializeAgents();
    renderAgentCards();
    aiResponsePanel.style.display = 'block';
}

async function runMultiAgentConsensus() {
    if (isSimulating) return;

    const nexusTaskInput = document.getElementById('nexus-task-input') as HTMLInputElement;
    const nexusStartButton = document.getElementById('nexus-start-button') as HTMLButtonElement;
    const initialTask = nexusTaskInput?.value.trim();

    if (!initialTask) {
        alert('Please provide a task for Nexus to begin.');
        return;
    }
    
    isSimulating = true;
    if (nexusTaskInput) nexusTaskInput.disabled = true;
    if (nexusStartButton) nexusStartButton.disabled = true;

    await sleep(50); // Ensure UI is updated before getting positions
    
    startVisualization();
    await simulationSequence(initialTask);
    
    isSimulating = false; // The animation loop will see this and stop itself

    // Re-enable for another run
    if (nexusTaskInput) nexusTaskInput.disabled = false;
    if (nexusStartButton) nexusStartButton.disabled = false;
}

// --- COMMUNICATION LOG ---
function addCommLog(from: AgentName, to: AgentName, message: string) {
    if (!commLogPanel) return;

    const fromAgent = agents[from];
    const toAgent = agents[to];

    const entry = document.createElement('div');
    entry.className = 'log-entry';

    const fromColor = fromAgent ? fromAgent.color : 'var(--muted-text)';
    const toColor = toAgent ? toAgent.color : 'var(--muted-text)';

    entry.innerHTML = `
        <div>
            <span class="log-sender" style="color: ${fromColor};">${from}</span>
            <span class="log-arrow">→</span>
            <span class="log-receiver" style="color: ${toColor};">${to}</span>
        </div>
        <span class="log-message">${message}</span>
    `;

    commLogPanel.appendChild(entry);
    commLogPanel.scrollTop = commLogPanel.scrollHeight; // Auto-scroll to bottom
}

function clearCommLogs() {
    if (commLogPanel) {
        commLogPanel.innerHTML = '';
    }
}


// --- CONFIGURATION MANAGEMENT ---
function renderPersonaEditor() {
    if (!personaEditorContainer) return;

    personaEditorContainer.innerHTML = ''; // Clear existing
    if (!currentConfiguration || !currentConfiguration.agents) return;

    currentConfiguration.agents.forEach((agentDef, index) => {
        const item = document.createElement('div');
        item.className = 'persona-item';

        const label = document.createElement('label');
        label.setAttribute('for', `persona-input-${agentDef.name}`);
        label.textContent = `${agentDef.name}:`;
        label.style.color = agentDef.color;

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'persona-input';
        input.id = `persona-input-${agentDef.name}`;
        input.value = agentDef.persona;

        input.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            // Update the persona in the current configuration state directly
            currentConfiguration.agents[index].persona = target.value;
        });

        item.appendChild(label);
        item.appendChild(input);
        personaEditorContainer.appendChild(item);
    });
}

function populateConfigSelector() {
    configSelector.innerHTML = '';
    for (const name in savedConfigurations) {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        if (name === currentConfiguration.name) {
            option.selected = true;
        }
        configSelector.appendChild(option);
    }
}

function saveConfigurationsToStorage() {
    localStorage.setItem('agentConfigs', JSON.stringify(savedConfigurations));
}

function loadConfigurationsFromStorage() {
    const storedConfigs = localStorage.getItem('agentConfigs');
    if (storedConfigs) {
        savedConfigurations = JSON.parse(storedConfigs);
    } else {
        // First time load, use defaults
        savedConfigurations = { ...DEFAULT_CONFIGS };
    }
    // Ensure default configs are always there if they were deleted somehow
    for (const key in DEFAULT_CONFIGS) {
        if (!savedConfigurations[key]) {
            savedConfigurations[key] = DEFAULT_CONFIGS[key];
        }
    }
}

function handleSaveConfig() {
    const name = configNameInput.value.trim();
    if (!name) {
        alert('Please enter a name for the configuration.');
        return;
    }
    if (savedConfigurations[name]) {
        if (!confirm(`Configuration "${name}" already exists. Overwrite?`)) {
            return;
        }
    }
    // The currentConfiguration object has been updated live by the persona inputs
    savedConfigurations[name] = {
        ...currentConfiguration,
        name: name, // Ensure the name inside the object matches
    };
    saveConfigurationsToStorage();
    
    // After saving, the saved config becomes the current one.
    currentConfiguration.name = name; 
    
    populateConfigSelector();
    configSelector.value = name;
    configNameInput.value = name; // Populate the input with the saved name for clarity
    alert(`Configuration "${name}" saved!`);
}

function handleLoadConfig() {
    const selectedName = configSelector.value;
    if (savedConfigurations[selectedName]) {
        // Use deep copy to prevent live edits from modifying the saved state before explicit save
        currentConfiguration = JSON.parse(JSON.stringify(savedConfigurations[selectedName]));
        renderPersonaEditor(); // Render the editor for the newly loaded config
        configNameInput.value = selectedName; // Also update the save input
        alert(`Configuration "${selectedName}" loaded. The next orchestration will use this setup.`);
        populateConfigSelector(); // re-render to show selection
        clearCommLogs();
    } else {
        alert('Error: Could not load configuration.');
    }
}

// --- PERSONA SET MANAGEMENT ---

function populatePersonaSetSelector() {
    if (!personaSetSelector) return;
    personaSetSelector.innerHTML = '<option value="">Select a set...</option>';
    for (const name in savedPersonaSets) {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        personaSetSelector.appendChild(option);
    }
}

function savePersonaSetsToStorage() {
    localStorage.setItem('agentPersonaSets', JSON.stringify(savedPersonaSets));
}

function loadPersonaSetsFromStorage() {
    const storedSets = localStorage.getItem('agentPersonaSets');
    if (storedSets) {
        savedPersonaSets = JSON.parse(storedSets);
    } else {
        savedPersonaSets = {};
    }
}

function handleSavePersonaSet() {
    const name = personaSetNameInput.value.trim();
    if (!name) {
        alert('Please enter a name for the persona set.');
        return;
    }
    if (savedPersonaSets[name]) {
        if (!confirm(`Persona set "${name}" already exists. Overwrite?`)) {
            return;
        }
    }
    
    const currentPersonas: Record<AgentName, string> = {};
    currentConfiguration.agents.forEach(agent => {
        currentPersonas[agent.name] = agent.persona;
    });

    savedPersonaSets[name] = {
        name: name,
        personas: currentPersonas,
    };

    savePersonaSetsToStorage();
    populatePersonaSetSelector();
    personaSetSelector.value = name;
    alert(`Persona set "${name}" saved!`);
}

function handleLoadPersonaSet() {
    const selectedName = personaSetSelector.value;
    if (!selectedName || !savedPersonaSets[selectedName]) {
        if (selectedName) alert('Error: Could not load persona set.');
        return;
    }

    const personaSet = savedPersonaSets[selectedName];

    currentConfiguration.agents.forEach((agent, index) => {
        if (personaSet.personas[agent.name] !== undefined) {
            currentConfiguration.agents[index].persona = personaSet.personas[agent.name];
        }
    });

    renderPersonaEditor();
    alert(`Applied personas from "${selectedName}" to the current configuration.`);
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // DOM Element Query Selectors
    editor = document.getElementById('editor') as HTMLDivElement;
    lineNumbers = document.getElementById('line-numbers') as HTMLDivElement;
    orchestrateButton = document.getElementById('btn-orchestrate') as HTMLButtonElement;
    aiResponsePanel = document.getElementById('ai-response-panel') as HTMLDivElement;
    closeAiPanelButton = document.getElementById('close-ai-panel') as HTMLButtonElement;
    leftToggleButton = document.getElementById('left-toggle') as HTMLButtonElement;
    editorStage = document.getElementById('editor-stage') as HTMLDivElement;
    flowCanvas = document.getElementById('agent-flow-canvas') as HTMLCanvasElement;
    flowCtx = flowCanvas.getContext('2d')!;
    configSelector = document.getElementById('config-selector') as HTMLSelectElement;
    loadConfigButton = document.getElementById('btn-load-config') as HTMLButtonElement;
    saveConfigButton = document.getElementById('btn-save-config') as HTMLButtonElement;
    configNameInput = document.getElementById('config-name-input') as HTMLInputElement;
    personaEditorContainer = document.getElementById('persona-editor') as HTMLDivElement;
    personaSetSelector = document.getElementById('persona-set-selector') as HTMLSelectElement;
    loadPersonaSetButton = document.getElementById('btn-load-persona-set') as HTMLButtonElement;
    savePersonaSetButton = document.getElementById('btn-save-persona-set') as HTMLButtonElement;
    personaSetNameInput = document.getElementById('persona-set-name-input') as HTMLInputElement;
    commLogPanel = document.getElementById('comm-log-panel') as HTMLDivElement;
    clearLogButton = document.getElementById('btn-clear-log') as HTMLButtonElement;

    // Event Listeners
    editor.addEventListener('input', updateLineNumbers);
    orchestrateButton.addEventListener('click', showAgentPanel);
    leftToggleButton.addEventListener('click', () => editorStage.classList.toggle('left-panel-open'));
    saveConfigButton.addEventListener('click', handleSaveConfig);
    loadConfigButton.addEventListener('click', handleLoadConfig);
    savePersonaSetButton.addEventListener('click', handleSavePersonaSet);
    loadPersonaSetButton.addEventListener('click', handleLoadPersonaSet);
    clearLogButton.addEventListener('click', clearCommLogs);


    // Initial Load
    loadConfigurationsFromStorage();
    loadPersonaSetsFromStorage();
    currentConfiguration = JSON.parse(JSON.stringify(savedConfigurations["Default Orchestration"]));
    
    populateConfigSelector();
    populatePersonaSetSelector();
    renderPersonaEditor();
    updateLineNumbers();
});