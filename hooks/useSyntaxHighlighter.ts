
type Language = 'js' | 'html' | 'css' | string;

// FIX: Update the type to allow a string or a function for the replacement, resolving type errors.
type StyleOrFn = string | ((...args: any[]) => string);

const rules: Record<Language, [RegExp, StyleOrFn][]> = {
    js: [
        [/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g, 'sh-comment'],
        [/([`"'])(?:(?=(\\?))\2.)*?\1/g, 'sh-string'],
        [/\b(if|else|for|while|function|return|const|let|var|class|new|import|export|from|async|await)\b/g, 'sh-keyword'],
        [/\b\d+(\.\d+)?\b/g, 'sh-number'],
        [/\b([A-Z][\w$]*)\b/g, 'sh-type'],
        [/([a-zA-Z_$][\w$]*)(?=\s*\()/g, 'sh-function'],
        [/([\[\]\{\}\(\)])/g, 'sh-bracket'],
        [/([=+\-*/%<>!&|?:]|[.]{1,3})/g, 'sh-op'],
    ],
    html: [
        [/(&lt;!--[\s\S]*?--&gt;)/g, 'sh-comment'],
        [/(&lt;\/?)([a-zA-Z0-9-]+)/g, (m, p1, p2) => `${p1}<span class="sh-tag">${p2}</span>`],
        [/([a-zA-Z-]+)=/g, '<span class="sh-property">$1</span>='],
        [/(".*?")/g, 'sh-string'],
    ],
    css: [
        [/(\/\*[\s\S]*?\*\/)/g, 'sh-comment'],
        [/([a-zA-Z-]+)(?=:)/g, 'sh-property'],
        [/(#[\w\d]{3,6})/g, 'sh-number'],
        [/("(?:\\.|[^"])*"|'(?:\\.|[^'])*')/g, 'sh-string'],
    ],
};

const escapeHtml = (text: string): string => 
    text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');


export const highlight = (text: string, language: Language): string => {
    if (!text) return '';
    
    const langRules = rules[language] || [];
    if (langRules.length === 0) {
        return escapeHtml(text);
    }

    let highlightedText = escapeHtml(text);

    for (const [regex, style] of langRules) {
        highlightedText = highlightedText.replace(regex, (match, ...args) => {
            if (typeof style === 'function') {
                // FIX: This call is now type-safe because the `rules` type allows `style` to be a function.
                return style(match, ...args);
            }
            return `<span class="${style}">${match}</span>`;
        });
    }
    
    // This is a workaround for regex replacing nested spans. A proper tokenizer is better but more complex.
    // It cleans up artifacts like <span..><span..>text</span></span>
    highlightedText = highlightedText.replace(/<span class="[^"]+">(\s*<span class="[^"]+">[\s\S]*?<\/span>\s*)<\/span>/g, '$1');

    return highlightedText;
};
