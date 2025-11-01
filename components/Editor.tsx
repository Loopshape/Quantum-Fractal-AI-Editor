
import React, { useRef, useEffect, useCallback } from 'react';
import { highlight } from '../hooks/useSyntaxHighlighter';

interface EditorProps {
    content: string;
    onContentChange: (content: string) => void;
    onCursorChange: (pos: { line: number; col: number }) => void;
    language: string;
}

export const Editor: React.FC<EditorProps> = ({ content, onContentChange, onCursorChange, language }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const lineNumbersRef = useRef<HTMLDivElement>(null);

    const updateLineNumbers = useCallback(() => {
        if (!editorRef.current || !lineNumbersRef.current) return;
        const lineCount = editorRef.current.textContent?.split('\n').length || 1;
        lineNumbersRef.current.innerHTML = Array.from({ length: lineCount }, (_, i) => i + 1).join('<br>');
    }, []);

    useEffect(() => {
        const editor = editorRef.current;
        if (editor && editor.textContent !== content) {
            editor.innerHTML = highlight(content, language);
            updateLineNumbers();
        }
    }, [content, language, updateLineNumbers]);


    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        const newContent = (e.currentTarget as HTMLDivElement).textContent || '';
        onContentChange(newContent);
        updateCursorPosition();
    };

    const handleScroll = () => {
        if (editorRef.current && lineNumbersRef.current) {
            lineNumbersRef.current.scrollTop = editorRef.current.scrollTop;
        }
    };
    
    const updateCursorPosition = useCallback(() => {
        const editor = editorRef.current;
        const selection = window.getSelection();
        if (!editor || !selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(editor);
        preCaretRange.setEnd(range.startContainer, range.startOffset);
        
        const text = preCaretRange.toString();
        const lines = text.split('\n');
        const line = lines.length;
        const col = lines[lines.length - 1].length;
        onCursorChange({ line, col });
    }, [onCursorChange]);
    
     const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            document.execCommand('insertText', false, '    ');
        }
    };

    return (
        <div className="flex h-full overflow-hidden">
            <div
                ref={lineNumbersRef}
                className="w-[50px] p-2.5 bg-[#313328] text-[#999966] text-right select-none sticky left-0 font-mono text-sm leading-[1.5em] overflow-hidden"
            >
                1
            </div>
            <div
                ref={editorRef}
                className="editor-content flex-1 p-2.5 box-border whitespace-pre outline-none overflow-auto font-mono text-sm leading-[1.5em] caret-[#4ac94a]"
                contentEditable="true"
                spellCheck="false"
                onInput={handleInput}
                onScroll={handleScroll}
                onClick={updateCursorPosition}
                onKeyUp={updateCursorPosition}
                onKeyDown={handleKeyDown}
                suppressContentEditableWarning={true}
                data-gramm="false"
                data-gramm_editor="false"
                data-enable-grammarly="false"
            >
            </div>
        </div>
    );
};
