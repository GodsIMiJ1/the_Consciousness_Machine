// Core Tribunal Types
export interface Agent {
  id: string
  name: string
  title: string
  type: 'high-council' | 'local-council'
  status: 'active' | 'inactive' | 'deliberating'
  specialization: string[]
  avatar?: string
  lastActive?: number
}

// Define Verdict first to avoid forward reference issues
export interface Verdict {
  id: string
  sessionId: string
  agentId: string
  decision: 'guilty' | 'innocent' | 'abstain' | 'insufficient-evidence'
  reasoning: string
  confidence: number
  timestamp: number
  weight: number // Based on agent rank/expertise
}

export interface CouncilMember extends Agent {
  verdictHistory: Verdict[]
  expertise: string[]
  councilRank: number
}

export interface HighCouncilAgent extends CouncilMember {
  apiEndpoint: string
  model: string
  provider: 'openai' | 'anthropic' | 'google' | 'custom'
}

export interface LocalCouncilAgent extends CouncilMember {
  ollamaModel: string
  localEndpoint: string
  systemPrompt: string
}

// Tribunal Session Types
export interface TribunalSession {
  id: string
  summonsId: string
  defendant: Defendant
  charges: string[]
  testimony: Testimony[]
  verdicts: Verdict[]
  status: 'pending' | 'in-session' | 'deliberating' | 'concluded'
  startTime: number
  endTime?: number
  judgeId: string
}

export interface Defendant {
  id: string
  name: string
  type: 'human' | 'ai' | 'entity'
  summonsCode: string
  entryTime: number
  status: 'awaiting' | 'testifying' | 'judged'
}

export interface Testimony {
  id: string
  sessionId: string
  content: string
  timestamp: number
  source: 'defendant' | 'witness' | 'evidence'
  keywords: string[]
  tribunalScore: number
  routedTo: string[] // Agent IDs
}

export interface FinalJudgment {
  sessionId: string
  overallVerdict: 'guilty' | 'innocent' | 'hung-jury' | 'mistrial'
  consensusScore: number
  majorityReasoning: string
  dissenting?: string[]
  judgeOverride?: boolean
  timestamp: number
  scrollId: string // For blockchain/storage
}

// WhisperNet Integration Types
export interface WhisperMessage {
  id: string
  content: string
  timestamp: number
  source: string
  destination: string[]
  priority: 'low' | 'medium' | 'high' | 'urgent'
  encrypted: boolean
}

export interface ScrollData {
  id: string
  sessionId: string
  content: string
  hash: string
  timestamp: number
  witnesses: string[]
  sealed: boolean
}

// UI State Types
export interface TribunalState {
  currentSession?: TribunalSession
  activeSessions: TribunalSession[]
  highCouncil: HighCouncilAgent[]
  localCouncil: LocalCouncilAgent[]
  isJudgeMode: boolean
  connectionStatus: 'connected' | 'disconnected' | 'connecting'
  whisperFeed: WhisperMessage[]
}

export interface CouncilPanelProps {
  title: string
  agents: Agent[]
  onAgentSelect?: (agent: Agent) => void
  onVerdictSubmit?: (verdict: Verdict) => void
  isActive?: boolean
}

export interface AdminPanelProps {
  session?: TribunalSession
  onVerdictPass?: (judgment: FinalJudgment) => void
  onSessionEnd?: () => void
  isJudgeMode: boolean
}

// Configuration Types
export interface TribunalConfig {
  highCouncilEndpoints: Record<string, string>
  localCouncilModels: string[]
  whisperNetConfig: {
    socketUrl: string
    channels: string[]
    encryption: boolean
  }
  judgeCredentials: {
    requiredRole: string
    sessionTimeout: number
  }
}
