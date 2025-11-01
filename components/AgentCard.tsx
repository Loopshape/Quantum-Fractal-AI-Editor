import React from 'react';
import { AgentName, AgentStatus } from '../types';
import { AGENTS_CONFIG } from '../constants';

interface AgentCardProps {
    name: AgentName;
    status: AgentStatus;
}

export const AgentCard: React.FC<AgentCardProps> = ({ name, status }) => {
    const config = AGENTS_CONFIG[name];

    const showSpinner = status.state === 'processing';

    return (
        <div className={`p-3 rounded-lg border-l-4 transition-all duration-300 ${config.borderColor} ${status.state === 'processing' ? 'bg-white/5 shadow-lg shadow-black/30' : 'bg-black/20'}`}>
            <div className={`font-bold text-base ${config.color}`}>{config.name}</div>
            <div className="text-xs text-[#999966] mb-1">{config.subtitle}</div>
            <div className="text-sm min-h-[20px] flex items-center">
                {showSpinner && <div className="quantum-spinner w-4 h-4 relative inline-block mr-2"></div>}
                <span>{status.message}</span>
            </div>
        </div>
    );
};
