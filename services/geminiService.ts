import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { AgentName, ConsensusResult } from "../types";
import { useSyntaxHighlighter } from "../hooks/useSyntaxHighlighter";

// This is a bit of a hack, but necessary to use a hook outside a component.
// In a larger app, this highlighting logic would be a non-hook utility.
let highlight: (text: string, lang: string) => string;
const SyntaxHighlighterWrapper = () => {
  highlight = useSyntaxHighlighter();
  return null;
};
// Dummy component to initialize the hook
export { SyntaxHighlighterWrapper };


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


// Multi-Agent Orchestrator Simulation
export async function* runMultiAgentOrchestrator(prompt: string, context: string) {
    const agentCount = 3;
    const update = (agent: AgentName, message: string, state: 'processing' | 'success' | 'error' = 'processing') => ({ agent, message, state });
    const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

    yield update('nexus', 'Starting multi-agent orchestrator...');
    await sleep(500);

    yield update('cognito', `Spawning ${agentCount} agents...`);
    await sleep(500);

    yield update('relay', 'Broadcasting prompt to agent swarm...');
    
    const agentPrompts = [
        `Optimize this code for readability and simplicity. Code: ${context}`,
        `Refactor this code for maximum performance. Code: ${context}`,
        `Rewrite this code using modern, idiomatic patterns. Code: ${context}`,
    ];

    yield update('sentinel', 'Agents are reasoning...');
    const responses = await Promise.all(
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

    yield update('sentinel', 'Validating consensus and scoring results...');
    await sleep(1000);

    responses.sort((a, b) => b.score - a.score);
    const bestCandidate = responses[0];

    const result: ConsensusResult = {
        selectedCandidate: bestCandidate.candidate,
        highlightedCode: highlight(bestCandidate.candidate, 'html'),
        score: bestCandidate.score,
        rootAgent: bestCandidate.agentId,
        allCandidates: responses.map(r => ({ ...r, agents: [r.agentId], count:1 }))
    };
    
    yield update('echo', 'Consensus reached. Finalizing report.', 'success');
    yield { result };
}
