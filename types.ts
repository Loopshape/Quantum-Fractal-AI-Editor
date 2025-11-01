export type AgentName = 'nexus' | 'cognito' | 'relay' | 'sentinel' | 'echo';

export interface AgentInfo {
    name: string;
    title: string;
    subtitle: string;
    color: string;
    borderColor: string;
}

export interface AgentStatus {
    message: string;
    state: 'idle' | 'processing' | 'error' | 'success';
}

export interface ConsensusCandidate {
    candidate: string;
    agents: string[];
    count: number;
    avgEntropy: number;
    score: number;
}

export interface ConsensusResult {
    selectedCandidate: string;
    highlightedCode: string;
    score: number;
    rootAgent: string;
    allCandidates: ConsensusCandidate[];
}

export interface LogEntry {
  timestamp: string;
  source: AgentName;
  target?: AgentName;
  message: string;
}
