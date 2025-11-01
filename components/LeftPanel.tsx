import React from 'react';

interface LeftPanelProps {
    isOpen: boolean;
    onUndo: () => void;
    onRedo: () => void;
    onPromptSubmit: (prompt: string, useOrchestrator: boolean) => void;
}

const ActionButton: React.FC<{ onClick: () => void, children: React.ReactNode, className?: string }> = ({ onClick, children, className = '' }) => (
    <button
        onClick={onClick}
        className={`w-full text-xs px-2 py-1.5 rounded transition-colors bg-[#4a4e40] hover:bg-[#5a5e50] border border-transparent hover:border-[#4ac94a] ${className}`}
    >
        {children}
    </button>
);

export const LeftPanel: React.FC<LeftPanelProps> = ({ isOpen, onUndo, onRedo, onPromptSubmit }) => {
    return (
        <aside className={`bg-[#313328] border-r border-[#22241e] p-2.5 box-border flex flex-col gap-2 overflow-y-auto transition-all duration-300 ${isOpen ? 'w-60' : 'w-0 p-0 overflow-hidden'}`}>
             <div className="grid grid-cols-2 gap-2">
                <ActionButton onClick={onUndo}>UNDO</ActionButton>
                <ActionButton onClick={onRedo}>REDO</ActionButton>
            </div>
            
            <div className="mt-5">
                <p className="text-xs font-bold text-[#999966] mb-2">Quantum Actions:</p>
                <div className="flex flex-col gap-1.5">
                     <ActionButton onClick={() => onPromptSubmit("Apply quantum fractal optimization to this code", false)}>Quantum Optimize</ActionButton>
                    <ActionButton onClick={() => onPromptSubmit("Add fractal documentation with quantum clarity", false)}>Fractal Document</ActionButton>
                    <ActionButton onClick={() => onPromptSubmit("Refactor using quantum fractal patterns and hyperthreaded efficiency", false)}>Hyper Refactor</ActionButton>
                    <ActionButton onClick={() => onPromptSubmit("Analyze the current code and generate 3 alternative optimized versions, then select the best one.", true)} className="bg-[#4ac94a]/20 text-[#4ac94a] hover:bg-[#4ac94a]/30">Multi-Agent Consensus</ActionButton>
                </div>
            </div>

            <div className="mt-5 text-xs text-[#999966]">
                <p className="font-bold mb-2">Quantum AI Commands:</p>
                <ul className="list-disc list-inside space-y-1 text-[#ccc]">
                    <li>Rewrite this function</li>
                    <li>Optimize performance</li>
                    <li>Add error handling</li>
                    <li>Convert to TypeScript</li>
                    <li>Explain this code</li>
                </ul>
            </div>
        </aside>
    );
};
