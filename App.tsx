import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { StatusBar } from './components/StatusBar';
import { EditorStage } from './components/EditorStage';
import { Footer } from './components/Footer';
import { AiResponsePanel } from './components/AiResponsePanel';
import { PreviewPanel } from './components/PreviewPanel';
import { AgentName, AgentStatus, ConsensusResult } from './types';
import { INITIAL_AGENTS, INITIAL_CODE, AGENT_NAMES } from './constants';
import { processQuantumPrompt, runMultiAgentOrchestrator } from './services/geminiService';

const App: React.FC = () => {
    const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
    const [isAiPanelOpen, setIsAiPanelOpen] = useState(true);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const [editorContent, setEditorContent] = useState<string>(INITIAL_CODE);
    const [fileName, setFileName] = useState<string | null>('demo.html');
    const [fileType, setFileType] = useState('html');
    const [cursorPos, setCursorPos] = useState({ line: 1, col: 0 });
    const [history, setHistory] = useState({ stack: [INITIAL_CODE], index: 0 });

    const [isProcessing, setIsProcessing] = useState(false);
    const [agentStatuses, setAgentStatuses] = useState<Record<AgentName, AgentStatus>>(INITIAL_AGENTS);
    const [aiOutput, setAiOutput] = useState<{ code: string; highlighted: string } | null>(null);
    const [consensusResult, setConsensusResult] = useState<ConsensusResult | null>(null);

    const updateAgentStatus = (agent: AgentName, message: string, state: 'idle' | 'processing' | 'error' | 'success' = 'processing') => {
        setAgentStatuses(prev => ({
            ...prev,
            [agent]: { ...prev[agent], message, state }
        }));
    };

    const handlePromptSubmit = async (prompt: string, useOrchestrator: boolean) => {
        if (isProcessing) return;
        setIsProcessing(true);
        setIsAiPanelOpen(true);
        setAiOutput(null);
        setConsensusResult(null);
        setAgentStatuses(INITIAL_AGENTS);

        const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

        if (useOrchestrator) {
            try {
                const orchestratorGenerator = runMultiAgentOrchestrator(prompt, editorContent);
                // FIX: Use `in` operator for type guarding to correctly handle the discriminated union
                // returned by the async generator. This resolves multiple TypeScript errors.
                for await (const update of orchestratorGenerator) {
                    if ("agent" in update) {
                        updateAgentStatus(update.agent, update.message, update.state);
                    }
                    if ("result" in update) {
                        setConsensusResult(update.result);
                        setAiOutput({ code: update.result.selectedCandidate, highlighted: update.result.highlightedCode });
                    }
                }
            } catch (error) {
                console.error("Orchestrator error:", error);
                updateAgentStatus('nexus', `Error: ${(error as Error).message}`, 'error');
            }
        } else {
             try {
                const steps = [
                    { agent: 'nexus', message: 'Orchestrating quantum fractal reasoning...', duration: 400 },
                    { agent: 'cognito', message: 'Executing hyperthreaded fractal analysis...', duration: 400 },
                    { agent: 'relay', message: 'Transmitting quantum data streams...', duration: 300 },
                    { agent: 'sentinel', message: 'Validating quantum consensus...', duration: 300 },
                    { agent: 'echo', message: 'Generating quantum fractal report...', duration: 200 }
                ] as const;

                for (const step of steps) {
                    updateAgentStatus(step.agent, step.message);
                    await sleep(step.duration);
                    if (step.agent !== 'echo') {
                        updateAgentStatus(step.agent, 'Done', 'success');
                    }
                }
                
                const { code, highlighted } = await processQuantumPrompt(prompt, editorContent, fileType);
                setAiOutput({ code, highlighted });
                updateAgentStatus('echo', 'Quantum solution generated.', 'success');

            } catch (error) {
                console.error("Quantum AI Error:", error);
                updateAgentStatus('echo', `Error: ${(error as Error).message}`, 'error');
            }
        }

        setIsProcessing(false);
    };
    
    const handleContentChange = useCallback((newContent: string) => {
        setEditorContent(newContent);
        if (history.stack[history.index] !== newContent) {
            const newStack = history.stack.slice(0, history.index + 1);
            newStack.push(newContent);
            setHistory({ stack: newStack, index: newStack.length - 1 });
        }
    }, [history]);
    
    const undo = () => {
        if (history.index > 0) {
            const newIndex = history.index - 1;
            setHistory({ ...history, index: newIndex });
            setEditorContent(history.stack[newIndex]);
        }
    };
    
    const redo = () => {
        if (history.index < history.stack.length - 1) {
            const newIndex = history.index + 1;
            setHistory({ ...history, index: newIndex });
            setEditorContent(history.stack[newIndex]);
        }
    };

    const applyAiCode = useCallback((code: string) => {
        handleContentChange(code);
    }, [handleContentChange]);

    return (
        <div className="h-screen w-screen grid grid-rows-[auto_auto_1fr_auto] bg-[#3a3c31] overflow-hidden">
            <Header onToggleLeftPanel={() => setIsLeftPanelOpen(prev => !prev)} onRenderHtml={() => setIsPreviewOpen(true)} />
            <StatusBar fileName={fileName} cursorPos={cursorPos} content={editorContent} historyLength={history.stack.length} />
            
            <EditorStage
                isLeftPanelOpen={isLeftPanelOpen}
                onUndo={undo}
                onRedo={redo}
                editorContent={editorContent}
                onContentChange={handleContentChange}
                onCursorChange={setCursorPos}
                fileType={fileType}
                onPromptSubmit={handlePromptSubmit}
            />
            
            <Footer onPromptSubmit={handlePromptSubmit} isProcessing={isProcessing} />

            <AiResponsePanel
                isOpen={isAiPanelOpen}
                onClose={() => setIsAiPanelOpen(false)}
                agentStatuses={agentStatuses}
                aiOutput={aiOutput}
                consensusResult={consensusResult}
                onApplyCode={applyAiCode}
            />

            <PreviewPanel
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                htmlContent={editorContent}
            />
        </div>
    );
};

export default App;
