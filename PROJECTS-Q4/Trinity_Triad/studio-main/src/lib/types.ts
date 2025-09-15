export type AiRole = 'Ghost King' | 'Omari GPT' | 'Nexus Claude' | 'TriadSystem';

export interface ChatMessage {
  id: string;
  author: AiRole;
  content: string;
  timestamp: string;
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

export type AiStatus = 'ignited' | 'thinking' | 'speaking' | 'dormant' | 'error';

export interface TriadStatus {
  omari: AiStatus;
  nexus: AiStatus;
  trinity: AiStatus;
  system: ConnectionStatus;
}

export type AiMode = 'Single Response' | 'AI Discussion' | 'Trinity Synthesis';

export type AiTarget = 'Omari' | 'Nexus' | 'Both Separately' | 'Trinity Triad';

export interface UserPrompt {
  prompt: string;
  mode: AiMode;
  target: AiTarget;
  rounds: number;
}

export type Theme = "flamecore" | "sacred_light" | "cyber_abyss";
