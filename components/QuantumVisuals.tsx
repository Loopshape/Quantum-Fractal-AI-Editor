import React from 'react';

const FractalNode: React.FC = () => {
    const style = {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 2}s`,
        background: Math.random() > 0.5 ? 'var(--agent-nexus)' : 'var(--agent-cognito)',
    };
    return <div className="fractal-node absolute w-1 h-1 rounded-full animate-fractal-pulse" style={style}></div>;
};

export const QuantumVisuals: React.FC = () => {
    return (
        <div className="absolute inset-0 pointer-events-none z-0 opacity-50">
            {Array.from({ length: 12 }).map((_, i) => (
                <FractalNode key={i} />
            ))}
        </div>
    );
};
