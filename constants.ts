import { AgentName, AgentInfo, AgentStatus } from './types';

export const AGENT_NAMES: AgentName[] = ['nexus', 'cognito', 'relay', 'sentinel', 'echo'];

export const AGENTS_CONFIG: Record<AgentName, AgentInfo> = {
    nexus: { name: 'Nexus', title: 'Quantum Orchestrator', subtitle: 'Fractal Core', color: 'text-[#BB86FC]', borderColor: 'border-l-[#BB86FC]' },
    cognito: { name: 'Cognito', title: 'Fractal Analyzer', subtitle: 'Quantum Loop', color: 'text-[#03DAC6]', borderColor: 'border-l-[#03DAC6]' },
    relay: { name: 'Relay', title: 'Quantum Communicator', subtitle: '2244', color: 'text-[#FFD54F]', borderColor: 'border-l-[#FFD54F]' },
    sentinel: { name: 'Sentinel', title: 'Quantum Monitor', subtitle: 'Fractal Coin', color: 'text-[#CF6679]', borderColor: 'border-l-[#CF6679]' },
    echo: { name: 'Echo', title: 'Quantum Reporter', subtitle: 'Fractal Code', color: 'text-[#4ac94a]', borderColor: 'border-l-[#4ac94a]' },
};

export const INITIAL_AGENTS: Record<AgentName, AgentStatus> = {
    nexus: { message: 'Idle. Awaiting quantum command.', state: 'idle' },
    cognito: { message: 'Ready', state: 'idle' },
    relay: { message: 'Ready', state: 'idle' },
    sentinel: { message: 'Ready', state: 'idle' },
    echo: { message: 'Awaiting quantum report...', state: 'idle' },
};

export const INITIAL_CODE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quantum Fractal AI Demo</title>
  <style>
    body {
      font-family: 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d);
      color: white;
      text-align: center;
      padding: 20px;
    }
    .container {
      background: rgba(0, 0, 0, 0.7);
      padding: 30px;
      border-radius: 15px;
      display: inline-block;
    }
    h1 {
      font-size: 2.5rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome to Quantum Fractal AI</h1>
    <p>Experience hyper-accelerated AI reasoning.</p>
  </div>
</body>
</html>`;
