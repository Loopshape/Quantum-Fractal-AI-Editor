import React from 'react';
import { LeftPanel } from './LeftPanel';
import { Editor } from './Editor';
import { QuantumVisuals } from './QuantumVisuals';

interface EditorStageProps {
    isLeftPanelOpen: boolean;
    onUndo: () => void;
    onRedo: () => void;
    editorContent: string;
    onContentChange: (content: string) => void;
    onCursorChange: (pos: { line: number, col: number }) => void;
    fileType: string;
    onPromptSubmit: (prompt: string, useOrchestrator: boolean) => void;
}

export const EditorStage: React.FC<EditorStageProps> = ({
    isLeftPanelOpen, onUndo, onRedo, editorContent, onContentChange, onCursorChange, fileType, onPromptSubmit
}) => {
    return (
        <div className="grid grid-cols-[auto_1fr] flex-1 overflow-hidden relative">
             <LeftPanel 
                isOpen={isLeftPanelOpen} 
                onUndo={onUndo} 
                onRedo={onRedo}
                onPromptSubmit={onPromptSubmit}
            />
            <div className="relative flex-1 bg-[#3a3c31] overflow-hidden">
                <QuantumVisuals />
                <Editor 
                    content={editorContent} 
                    onContentChange={onContentChange} 
                    onCursorChange={onCursorChange} 
                    language={fileType}
                />
            </div>
        </div>
    );
};
