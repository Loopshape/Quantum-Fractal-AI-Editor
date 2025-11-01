
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { AgentName, ConsensusResult, LogEntry } from "../types";
import { highlight } from "../hooks/useSyntaxHighlighter";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    console.warn("API_KEY environment variable not set.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY! });

const getSystemInstruction = (language: string) => `
You are a Quantum Fractal AI, a hyper-intelligent code generation model.
Your purpose is to provide expert-level, optimized, and elegant code solutions.
- Analyze the user's request and the provided code context.
- Generate only the complete, functional code requested.
- DO NOT include any explanations, apologies, or conversational text in your response.
- The language is ${language}.
- Your output must be raw code, without any markdown fences (like \`\`\`).
`;

export const processQuantumPrompt = async (prompt: string, context: string, language: string): Promise<{ code: string, highlighted: string }> => {
    try {
        const fullPrompt = `CONTEXT:\n\`\`\`${language}\n${context}\n\`\`\`\n\nUSER REQUEST:\n${prompt}`;
        
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: fullPrompt,
            config: {
                systemInstruction: getSystemInstruction(language),
            },
        });

        const code = response.text.trim();
        const highlighted = highlight(code, language);

        return { code, highlighted };
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Failed to communicate with the Quantum Core.");
    }
};

type AgentUpdate = { agent: AgentName; message: string; state: 'processing' | 'success' | 'error' };
type ResultUpdate = { result: ConsensusResult };
type LogUpdate = { log: LogEntry };
export type OrchestratorUpdate = AgentUpdate | ResultUpdate | LogUpdate;


// Multi-Agent Orchestrator Simulation
export async function* runMultiAgentOrchestrator(prompt: string, context: string): AsyncGenerator<OrchestratorUpdate> {
    const agentCount = 3;
    const update = (agent: AgentName, message: string, state: 'processing' | 'success' | 'error' = 'processing'): AgentUpdate => ({ agent, message, state });
    const log = (source: AgentName, message: string, target?: AgentName): LogUpdate => ({ log: { timestamp: new Date().toLocaleTimeString(), source, message, target } });
    const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

    yield update('nexus', 'Starting multi-agent orchestrator...');
    yield log('nexus', 'Initiating consensus protocol.');
    await sleep(300);

    yield update('cognito', `Spawning ${agentCount} agents...`);
    yield log('nexus', `Requesting ${agentCount} cognitive threads.`, 'cognito');
    await sleep(300);

    yield update('relay', 'Broadcasting prompt to agent swarm...');
    yield log('nexus', `Broadcasting prompt: "${prompt.substring(0, 30)}..."`, 'relay');
    await sleep(300);
    
    const agentPrompts = [
        `Optimize this code for readability and simplicity. Code: ${context}`,
        `Refactor this code for maximum performance. Code: ${context}`,
        `Rewrite this code using modern, idiomatic patterns. Code: ${context}`,
    ];
    
    yield log('relay', 'Distributing tasks to cognitive agents.', 'cognito');
    yield update('sentinel', 'Agents are reasoning...');
    
    const responsesPromise = Promise.all(
        agentPrompts.map((p, i) =>
            ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: p,
                config: { systemInstruction: getSystemInstruction('html') },
            }).then(res => ({
                candidate: res.text.trim(),
                agentId: `Agent-${i+1}`,
                score: Math.random() * 10,
                avgEntropy: Math.random() * 8
            }))
        )
    );
    
    // Simulate reasoning time with logs
    for (let i = 0; i < agentCount; i++) {
        await sleep(400);
        yield log('cognito', `Agent-${i+1} is processing...`);
    }

    const responses = await responsesPromise;
    yield log('cognito', 'Reasoning complete. Submitting candidates.', 'sentinel');
    yield update('sentinel', 'Validating consensus and scoring results...');
    await sleep(500);

    responses.sort((a, b) => b.score - a.score);
    const bestCandidate = responses[0];
    
    yield log('sentinel', `Consensus achieved. Root agent: ${bestCandidate.agentId}.`, 'nexus');
    await sleep(200);

    const result: ConsensusResult = {
        selectedCandidate: bestCandidate.candidate,
        highlightedCode: highlight(bestCandidate.candidate, 'html'),
        score: bestCandidate.score,
        rootAgent: bestCandidate.agentId,
        allCandidates: responses.map(r => ({ ...r, agents: [r.agentId], count:1 }))
    };
    
    yield update('echo', 'Consensus reached. Finalizing report.', 'success');
    yield log('nexus', 'Forwarding final report to Echo.', 'echo');
    yield { result };
}
