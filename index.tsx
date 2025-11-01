import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Chart } from "chart.js/auto";

// --- TYPE DEFINITIONS ---
type AgentName = string;
type AgentState = 'IDLE' | 'THINKING' | 'DONE' | 'ERROR';
type MindflowNodeState = 'superposition' | 'high-entropy' | 'high-qbit' | 'collapsed';

interface Agent {
    name: AgentName;
    color: string;
    persona: string;
}

interface MindflowNode {
    id: string;
    agentName: AgentName;
    content: string;
    state: MindflowNodeState;
    metrics?: {
        entropy: number;
        fractalScore: number;
        depRank: number;
        qbitStability: number;
    };
    depth: number;
}

// --- CONFIGURATION ---
const ORCHESTRATION_ROUNDS = 2;
const DEFAULT_CONFIGS: Record<string, { name: string; agents: Agent[] }> = {
    "Default Orchestration": {
        name: "Default Orchestration",
        agents: [
            { name: 'Nexus', color: 'var(--nemodian-purple)', persona: 'A meticulous project manager focused on clarity, coherence, and synthesizing collaborative thought into a final, actionable output.' },
            { name: 'Cognito', color: 'var(--nemodian-cyan)', persona: 'A creative, first-principles thinker who explores unconventional ideas using fractal-based logic.' },
            { name: 'Sentinel', color: 'var(--nemodian-red)', persona: 'A skeptical and rigorous tester who tries to break everything based on the origin-hashed specifications.' },
            { name: 'Chrono', color: 'var(--nemodian-orange)', persona: 'An efficiency expert obsessed with optimizing for speed and resource usage, guided by quantum-state analysis.' },
            { name: 'Echo', color: 'var(--nemodian-green)', persona: 'A user-focused advocate, prioritizing readability, best practices, and alignment with the genesis hash.' },
        ]
    },
};

// --- GLOBALS & STATE ---
let agents: Agent[] = [];
let currentConfig = DEFAULT_CONFIGS["Default Orchestration"];
let ai: GoogleGenAI;
let mindflowNodes: MindflowNode[] = [];
let qbitChart: Chart;

// --- DOM ELEMENTS ---
const cliInput = document.getElementById('cli-input') as HTMLInputElement;
const mindflowPanel = document.getElementById('mindflow-panel') as HTMLDivElement;
const qbitChartCanvas = document.getElementById('qbit-chart') as HTMLCanvasElement;
const topAgentsGrid = document.querySelector('#top-agents-container .top-agents-grid') as HTMLDivElement;
const configSelector = document.getElementById('config-selector') as HTMLSelectElement;
const btnLoadConfig = document.getElementById('btn-load-config') as HTMLButtonElement;
const configNameInput = document.getElementById('config-name-input') as HTMLInputElement;
const btnSaveConfig = document.getElementById('btn-save-config') as HTMLButtonElement;
const personaEditor = document.getElementById('persona-editor') as HTMLDivElement;


// --- UI RENDERING ---

function renderMindflowNode(node: MindflowNode): string {
    const agent = agents.find(a => a.name === node.agentName);
    const metrics = node.metrics;
    const metricsHtml = metrics ? `
        <span>E: ${metrics.entropy.toFixed(1)}</span>
        <span>F: ${metrics.fractalScore.toFixed(1)}</span>
        <span>D: ${metrics.depRank.toFixed(1)}</span>
        <span style="color: var(--nemodian-green);">Qbit: ${metrics.qbitStability.toFixed(2)}</span>
    ` : 'Awaiting measurement...';

    return `
        <div class="mindflow-node node-${node.state}" id="node-${node.id}">
            <div class="node-header">
                <div class="node-title" style="color: ${agent?.color || 'white'}">${node.agentName}</div>
                <div class="node-metrics">${metricsHtml}</div>
            </div>
            <div class="node-content">${node.content}</div>
        </div>
    `;
}

function updateMindflowPanel() {
    mindflowPanel.innerHTML = mindflowNodes.map(renderMindflowNode).join('');
    mindflowPanel.parentElement!.scrollTop = mindflowPanel.parentElement!.scrollHeight;
}

function addNodeToMindflow(node: MindflowNode) {
    mindflowNodes.push(node);
    updateMindflowPanel();
}

function updateNodeInMindflow(nodeId: string, updates: Partial<MindflowNode>) {
    const nodeIndex = mindflowNodes.findIndex(n => n.id === nodeId);
    if (nodeIndex > -1) {
        mindflowNodes[nodeIndex] = { ...mindflowNodes[nodeIndex], ...updates };
        updateMindflowPanel();
    }
}

function setupDashboard() {
    const ctx = qbitChartCanvas.getContext('2d');
    if (!ctx) return;
    qbitChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Qbit Stability',
                data: [],
                borderColor: 'var(--nemodian-cyan)',
                backgroundColor: 'rgba(120, 220, 232, 0.2)',
                fill: true,
                tension: 0.4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { min: 0, max: 10, ticks: { color: 'var(--nemodian-grey)' }, grid: { color: 'var(--nemodian-grey)' } },
                x: { ticks: { color: 'var(--nemodian-grey)' }, grid: { color: 'var(--nemodian-grey)' } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function updateDashboard(newQbitValue: number, round: number) {
    // Update Chart
    qbitChart.data.labels!.push(`R${round}`);
    qbitChart.data.datasets[0].data.push(newQbitValue);
    qbitChart.update('none');

    // Update Top Agents
    const scoredAgents = mindflowNodes
        .filter(n => n.metrics)
        .reduce((acc, node) => {
            acc[node.agentName] = (acc[node.agentName] || 0) + node.metrics!.qbitStability;
            return acc;
        }, {} as Record<string, number>);
    
    const sortedAgents = Object.entries(scoredAgents)
        .sort(([, a], [, b]) => b - a)
        .map(([name, score]) => ({ name, score, agent: agents.find(a => a.name === name) }))
        .filter(item => item.agent);

    topAgentsGrid.innerHTML = sortedAgents.map(item => {
        const barWidth = (item.score / (sortedAgents.length * 10)) * 100 * ORCHESTRATION_ROUNDS;
        return `
            <div style="color: ${item.agent!.color}">${item.agent!.name}</div>
            <div class="agent-bar-container">
                <div class="agent-bar" style="width: ${barWidth}%; background-color: ${item.agent!.color};"></div>
            </div>
        `;
    }).join('');
}

// --- ORCHESTRATION LOGIC ---

async function callGemini(prompt: string, isJson: boolean = false): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: isJson ? { responseMimeType: 'application/json' } : undefined
        });
        return response.text;
    } catch (error) {
        console.error("Gemini API Error:", error);
        return `Error: Could not get response. See console for details.`;
    }
}

async function processAgentTurn(agent: Agent, userPrompt: string, thinkingPool: Record<AgentName, string[]>, round: number): Promise<string> {
    const nodeId = `${agent.name}-${round}`;
    addNodeToMindflow({ id: nodeId, agentName: agent.name, content: 'Thinking...', state: 'superposition', depth: round });

    const collaborativeContext = JSON.stringify(thinkingPool, null, 2);
    const agentPrompt = `
        **Your Persona:** ${agent.persona}
        **Overall User Prompt:** "${userPrompt}"
        **Current Collaborative Thinking Pool (Round ${round}):**
        ${collaborativeContext}
        **Your Task:** Provide your next piece of analysis or contribution. Your thinking should be fractal and build upon existing ideas. Output a concise, potent thought-fragment.
    `;
    
    const result = await callGemini(agentPrompt);
    thinkingPool[agent.name].push(result);
    updateNodeInMindflow(nodeId, { content: result });
    return result;
}

async function processEvaluationPhase(thinkingPool: Record<AgentName, string[]>, round: number) {
    const contributionsToEvaluate: Record<string, string> = {};
    Object.keys(thinkingPool).forEach(name => {
        if (thinkingPool[name][round - 1]) {
            contributionsToEvaluate[name] = thinkingPool[name][round - 1];
        }
    });

    if (Object.keys(contributionsToEvaluate).length === 0) return;

    const evaluationPrompt = `
        You are Nexus, the orchestrator. Evaluate the contributions from your team. For each, provide a JSON object with scores for "entropy" (creativity), "fractalScore" (depth), and "depRank" (connectivity) on a 0.0-10.0 scale.
        Analyze: ${JSON.stringify(contributionsToEvaluate, null, 2)}
        Respond ONLY with the JSON object. Example: { "Cognito": { "entropy": 8.5, "fractalScore": 7.0, "depRank": 5.0 } }
    `;
    
    const scoresText = await callGemini(evaluationPrompt, true);
    let totalQbit = 0;
    let scoredCount = 0;
    try {
        const scores = JSON.parse(scoresText);
        for (const agentName in scores) {
            const nodeId = `${agentName}-${round}`;
            const metrics = scores[agentName];
            const { entropy = 0, fractalScore = 0, depRank = 0 } = metrics;
            const qbitStability = (fractalScore * 0.7) + (entropy * 0.2) + (depRank * 0.1);
            totalQbit += qbitStability;
            scoredCount++;

            let state: MindflowNodeState = 'collapsed';
            if (entropy > 5) state = 'high-entropy';
            else if (qbitStability > 7) state = 'high-qbit';

            updateNodeInMindflow(nodeId, { metrics: { entropy, fractalScore, depRank, qbitStability }, state });
        }
    } catch (e) {
        console.error("Failed to parse evaluation scores:", e, scoresText);
    }
    
    const averageQbit = scoredCount > 0 ? totalQbit / scoredCount : 0;
    updateDashboard(averageQbit, round);
}

async function processNexusSynthesis(userPrompt: string, thinkingPool: Record<AgentName, string[]>) {
    const nodeId = `Nexus-Final`;
    addNodeToMindflow({ id: nodeId, agentName: 'Nexus', content: 'Synthesizing final result...', state: 'superposition', depth: ORCHESTRATION_ROUNDS + 1 });

    const synthesisPrompt = `
        **Your Persona:** A meticulous project manager focused on clarity, coherence, and synthesizing collaborative thought.
        **Overall User Prompt:** "${userPrompt}"
        **Final Collaborative Thinking Pool:** ${JSON.stringify(thinkingPool, null, 2)}
        **Your Final Task:** Synthesize all contributions into a single, coherent, and complete final answer that directly addresses the user's prompt. If the prompt requires code, provide ONLY the final, clean code block.
    `;

    const result = await callGemini(synthesisPrompt);
    updateNodeInMindflow(nodeId, { content: result, state: 'collapsed', metrics: { entropy: 0, fractalScore: 10, depRank: 10, qbitStability: 8 } });
}


// --- COMMAND PROCESSING ---
async function runOrchestration(prompt: string) {
    if (!prompt) return;
    cliInput.disabled = true;

    // Reset State
    mindflowNodes = [];
    qbitChart.data.labels = [];
    qbitChart.data.datasets[0].data = [];
    qbitChart.update();
    topAgentsGrid.innerHTML = '';
    
    addNodeToMindflow({ id: 'prompt-0', agentName: 'USER', content: prompt, state: 'collapsed', depth: 0 });

    const thinkingPool: Record<AgentName, string[]> = {};
    currentConfig.agents.forEach(agent => { thinkingPool[agent.name] = []; });

    for (let round = 1; round <= ORCHESTRATION_ROUNDS; round++) {
        const reasoningAgents = currentConfig.agents.filter(a => a.name !== 'Nexus');
        await Promise.all(
            reasoningAgents.map(agent => processAgentTurn(agent, prompt, thinkingPool, round))
        );
        await processEvaluationPhase(thinkingPool, round);
    }

    await processNexusSynthesis(prompt, thinkingPool);

    cliInput.disabled = false;
    cliInput.focus();
}

function processCommand(command: string) {
    const [cmd, ...args] = command.trim().split(' ');
    const prompt = args.join(' ');
    switch (cmd.toLowerCase()) {
        case 'run':
            runOrchestration(prompt);
            cliInput.value = '';
            break;
        case 'help':
            const helpContent = `Available Commands:
- run <prompt>: Starts the AI orchestration.
- clear: Clears the Mindflow panel.
- help: Shows this help message.`;
            addNodeToMindflow({ id: `help-${Date.now()}`, agentName: 'SYSTEM', content: helpContent, state: 'collapsed', depth: 0 });
            break;
        case 'clear':
            mindflowNodes = [];
            updateMindflowPanel();
            break;
        default:
             addNodeToMindflow({ id: `err-${Date.now()}`, agentName: 'SYSTEM', content: `Unknown command: "${cmd}". Type 'help' for commands.`, state: 'high-entropy', depth: 0 });
    }
}


// --- CONFIG & PERSONA MANAGEMENT ---
function loadConfigs() {
    const savedConfigs = localStorage.getItem('agentConfigs');
    let configs = DEFAULT_CONFIGS;
    if (savedConfigs) {
        try {
            configs = { ...DEFAULT_CONFIGS, ...JSON.parse(savedConfigs) };
        } catch (e) { console.error("Failed to parse saved configs:", e); }
    }
    configSelector.innerHTML = '';
    Object.keys(configs).forEach(name => {
        const option = new Option(name, name);
        configSelector.add(option);
    });
    return configs;
}

function applyConfig(config: { name: string; agents: Agent[] }) {
    currentConfig = config;
    agents = config.agents;
    configNameInput.value = config.name;
    renderPersonaEditor();
}

function saveConfig() {
    const savedConfigs = JSON.parse(localStorage.getItem('agentConfigs') || '{}');
    const newConfigName = configNameInput.value.trim();
    if (!newConfigName) return;

    const configToSave = { name: newConfigName, agents: [] as Agent[] };
    personaEditor.querySelectorAll('.persona-item').forEach(item => {
        const name = (item.querySelector('label') as HTMLLabelElement).textContent || '';
        const persona = (item.querySelector('textarea') as HTMLTextAreaElement).value;
        const color = (item.querySelector('label') as HTMLLabelElement).style.color;
        if (name) {
            configToSave.agents.push({ name, persona, color });
        }
    });

    savedConfigs[newConfigName] = configToSave;
    localStorage.setItem('agentConfigs', JSON.stringify(savedConfigs));
    loadConfigs();
    configSelector.value = newConfigName;
}

function renderPersonaEditor() {
    personaEditor.innerHTML = '<label>Agent Personas</label>';
    currentConfig.agents.forEach(agent => {
        const item = document.createElement('div');
        item.className = 'config-group persona-item';
        item.innerHTML = `
            <label style="color: ${agent.color}">${agent.name}</label>
            <textarea data-agent-name="${agent.name}" rows="4">${agent.persona}</textarea>
        `;
        personaEditor.appendChild(item);
    });
}

// --- INITIALIZATION ---
function main() {
    setupDashboard();
    const allConfigs = loadConfigs();
    applyConfig(allConfigs[configSelector.value] || currentConfig);

    cliInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && cliInput.value) {
            processCommand(cliInput.value);
        }
    });

    btnLoadConfig.addEventListener('click', () => {
        const selectedConfig = allConfigs[configSelector.value];
        if (selectedConfig) applyConfig(selectedConfig);
    });
    btnSaveConfig.addEventListener('click', saveConfig);

    try {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    } catch (e) {
        console.error("Failed to initialize GoogleGenAI", e);
        addNodeToMindflow({ id: `init-err-${Date.now()}`, agentName: 'SYSTEM', content: 'Could not initialize AI. Is API key set correctly?', state: 'high-entropy', depth: 0 });
    }
}

main();
