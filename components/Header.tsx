import React from 'react';

interface HeaderProps {
    onToggleLeftPanel: () => void;
    onRenderHtml: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleLeftPanel, onRenderHtml }) => {
    return (
        <header className="grid-row-1 grid-column-1/-1 bg-[#2e3026] border-b border-[#22241e] flex items-center justify-between px-3 py-1.5 relative overflow-hidden animate-quantum-scan">
            <div className="flex gap-3 items-center z-10">
                <button onClick={onToggleLeftPanel} className="text-sm px-2 py-1 bg-transparent border border-gray-600 rounded hover:bg-gray-700">☰</button>
                <div className="font-bold text-lg animate-quantum-pulse">Nemodian 2244-1 :: Quantum Fractal AI</div>
            </div>
            <div className="flex gap-2 items-center z-10">
                {/* File handling buttons could be added here if needed */}
                <button onClick={onRenderHtml} className="text-xs px-2 py-1 bg-[#f0ad4e] text-black border border-[#f0ad4e] rounded hover:opacity-80 transition-opacity">Render HTML</button>
            </div>
        </header>
    );
};
