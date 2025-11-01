import React from 'react';
import { AgentCard } from './AgentCard';
import { AgentName, AgentStatus, ConsensusResult } from '../types';
import { AGENT_NAMES } from '../constants';

interface AiResponsePanelProps {
    isOpen: boolean;
    onClose: () => void;
    agentStatuses: Record<AgentName, AgentStatus>;
    aiOutput: { code: string; highlighted: string } | null;
    consensusResult: ConsensusResult | null;
    onApplyCode: (code: string) => void;
}

export const AiResponsePanel: React.FC<AiResponsePanelProps> = ({
    isOpen, onClose, agentStatuses, aiOutput, consensusResult, onApplyCode
}) => {
    if (!isOpen) return null;
    
    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
    };

    return (
        <div className="fixed bottom-[70px] right-5 w-[500px] max-h-[600px] bg-[#313328] border border-[#4ac94a] rounded-lg p-4 overflow-y-auto z-50 shadow-lg shadow-black/50 text-sm">
            <button onClick={onClose} className="absolute top-2 right-2 text-[#999966] hover:text-white">×</button>
            
            <div className="space-y-2">
                {AGENT_NAMES.map(name => (
                    <AgentCard key={name} name={name} status={agentStatuses[name]} />
                ))}

                {aiOutput && (
                    <div className="agent-card bg-[#313328] border-l-4 border-[#4ac94a] p-3 rounded-lg">
                        <div className="agent-title text-[#4ac94a] font-bold">Echo</div>
                         <div className="mt-2 p-2 bg-black/50 rounded max-h-64 overflow-auto border border-gray-700">
                           <pre><code dangerouslySetInnerHTML={{ __html: aiOutput.highlighted }} /></pre>
                         </div>
                         <div className="flex gap-2 mt-3">
                             <button onClick={() => handleCopy(aiOutput.code)} className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-500">Copy</button>
                             <button onClick={() => onApplyCode(aiOutput.code)} className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-500">Apply Code</button>
                         </div>
                    </div>
                )}
                 
                {consensusResult && (
                    <div className="bg-[#313328] border border-[#BB86FC] rounded-lg p-4 mt-4">
                        <div className="flex justify-between items-center text-[#BB86FC] font-bold mb-2">
                            <span>Multi-Agent Consensus</span>
                            <span className="text-xs bg-[#BB86FC] text-black px-2 py-0.5 rounded-full">Score: {consensusResult.score}</span>
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {consensusResult.allCandidates.map((c, i) => (
                                <div key={i} className={`p-2 rounded border-l-4 ${i === 0 ? 'bg-green-500/10 border-green-500' : 'bg-gray-500/10 border-gray-500'}`}>
                                    <div className="text-xs text-gray-400 flex justify-between">
                                        <span>Agents: {c.count}</span>
                                        <span>Entropy: {c.avgEntropy.toFixed(2)}</span>
                                    </div>
                                    <p className="text-xs mt-1 font-mono truncate">{c.candidate.split('\n')[0]}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
