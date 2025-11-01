import React, { useMemo } from 'react';

interface PreviewPanelProps {
    isOpen: boolean;
    onClose: () => void;
    htmlContent: string;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ isOpen, onClose, htmlContent }) => {
    const blobUrl = useMemo(() => {
        if (!isOpen) return '';
        const blob = new Blob([htmlContent], { type: 'text/html' });
        return URL.createObjectURL(blob);
    }, [htmlContent, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4">
            <div className="w-full h-full max-w-4xl max-h-[80vh] bg-white rounded-lg flex flex-col shadow-2xl">
                <div className="flex justify-between items-center p-2 bg-[#2e3026] border-b border-[#4ac94a]">
                    <span className="font-bold text-[#f0f0e0]">Quantum Preview</span>
                    <button onClick={onClose} className="text-2xl text-[#f0f0e0] hover:text-red-500">&times;</button>
                </div>
                <iframe
                    src={blobUrl}
                    title="HTML Preview"
                    className="w-full h-full border-none"
                    sandbox="allow-scripts"
                />
            </div>
        </div>
    );
};
