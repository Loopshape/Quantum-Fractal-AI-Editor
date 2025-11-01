import React, { useState } from 'react';

interface FooterProps {
    onPromptSubmit: (prompt: string, useOrchestrator: boolean) => void;
    isProcessing: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onPromptSubmit, isProcessing }) => {
    const [prompt, setPrompt] = useState('');
    const [useOrchestrator, setUseOrchestrator] = useState(false);

    const handleSubmit = () => {
        if (prompt.trim() && !isProcessing) {
            onPromptSubmit(prompt, useOrchestrator);
            setPrompt('');
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <footer className="flex items-center justify-between p-2 bg-[#2e3026] border-t border-[#22241e]">
            <input
                id="prompt-input"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter quantum command (e.g., 'rewrite this with fractal optimization')"
                className="flex-1 mr-2 p-2 bg-[#22241e] border border-[#4ac94a] text-[#f0f0e0] rounded text-base placeholder:text-[#999966]/50 focus:outline-none focus:ring-2 focus:ring-[#4ac94a]"
                disabled={isProcessing}
            />
            <div className="flex items-center gap-2">
                <label className="flex items-center text-xs text-gray-400 cursor-pointer">
                    <input type="checkbox" checked={useOrchestrator} onChange={(e) => setUseOrchestrator(e.target.checked)} className="mr-1.5 h-4 w-4 rounded bg-gray-700 border-gray-600 text-[#4ac94a] focus:ring-[#4ac94a]"/>
                    Multi-Agent
                </label>
                <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-[#4ac94a] text-white font-bold rounded hover:bg-green-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                    disabled={isProcessing}
                >
                    {isProcessing ? 'PROCESSING...' : 'QUANTUM PROCESS'}
                </button>
            </div>
        </footer>
    );
};
