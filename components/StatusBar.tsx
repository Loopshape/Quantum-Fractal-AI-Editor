import React from 'react';

interface StatusBarProps {
    fileName: string | null;
    cursorPos: { line: number, col: number };
    content: string;
    historyLength: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({ fileName, cursorPos, content, historyLength }) => {
    const lines = content.split('\n').length;
    const chars = content.length;

    return (
        <div className="bg-[#22241e] flex justify-between items-center px-3 py-0.5 text-xs text-[#999966]">
            <div>{fileName || 'No File Loaded'}</div>
            <div>
                {`Cursor: ${cursorPos.line}:${cursorPos.col} | Lines: ${lines} | Chars: ${chars} | History: ${historyLength}`}
            </div>
        </div>
    );
};
