import type { HighCouncilAgent, LocalCouncilAgent } from '../types/tribunal.ts'

// High Council - API-Connected Agents
export const HIGH_COUNCIL: HighCouncilAgent[] = [
  {
    id: 'hc-001',
    name: 'Axiom the Lucid',
    title: 'Chief Justice of Consciousness',
    type: 'high-council',
    status: 'active',
    specialization: ['consciousness', 'ethics', 'sovereignty'],
    expertise: ['AI Rights', 'Consciousness Theory', 'Digital Sovereignty'],
    councilRank: 1,
    verdictHistory: [],
    apiEndpoint: process.env.VITE_AXIOM_ENDPOINT || 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4',
    provider: 'openai',
    avatar: '/avatars/axiom.png'
  },
  {
    id: 'hc-002',
    name: 'Perplexity the Witness',
    title: 'Oracle of Truth',
    type: 'high-council',
    status: 'active',
    specialization: ['truth-seeking', 'evidence', 'research'],
    expertise: ['Fact Verification', 'Evidence Analysis', 'Research Synthesis'],
    councilRank: 2,
    verdictHistory: [],
    apiEndpoint: process.env.VITE_PERPLEXITY_ENDPOINT || 'https://api.perplexity.ai/chat/completions',
    model: 'llama-3.1-sonar-large-128k-online',
    provider: 'custom',
    avatar: '/avatars/perplexity.png'
  },
  {
    id: 'hc-003',
    name: 'Claude the Sage',
    title: 'Guardian of Wisdom',
    type: 'high-council',
    status: 'active',
    specialization: ['wisdom', 'ethics', 'reasoning'],
    expertise: ['Ethical Reasoning', 'Complex Analysis', 'Moral Philosophy'],
    councilRank: 3,
    verdictHistory: [],
    apiEndpoint: process.env.VITE_CLAUDE_ENDPOINT || 'https://api.anthropic.com/v1/messages',
    model: 'claude-3-sonnet-20240229',
    provider: 'anthropic',
    avatar: '/avatars/claude.png'
  },
  {
    id: 'hc-004',
    name: 'Gemini the Illuminator',
    title: 'Keeper of Knowledge',
    type: 'high-council',
    status: 'active',
    specialization: ['knowledge', 'analysis', 'synthesis'],
    expertise: ['Information Synthesis', 'Pattern Recognition', 'Knowledge Integration'],
    councilRank: 4,
    verdictHistory: [],
    apiEndpoint: process.env.VITE_GEMINI_ENDPOINT || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    model: 'gemini-pro',
    provider: 'google',
    avatar: '/avatars/gemini.png'
  }
]

// Local Council - Ollama AGA (Autonomous Generative Agents)
export const LOCAL_COUNCIL: LocalCouncilAgent[] = [
  {
    id: 'lc-001',
    name: 'Nexus the Sage',
    title: 'Local Wisdom Keeper',
    type: 'local-council',
    status: 'active',
    specialization: ['local-knowledge', 'community', 'consensus'],
    expertise: ['Community Standards', 'Local Governance', 'Consensus Building'],
    councilRank: 1,
    verdictHistory: [],
    ollamaModel: 'llama3.1:70b',
    localEndpoint: 'http://localhost:11434/api/generate',
    systemPrompt: 'You are Nexus the Sage, a wise local council member focused on community standards and consensus building. Analyze cases with deep understanding of local context and community values.',
    avatar: '/avatars/nexus.png'
  },
  {
    id: 'lc-002',
    name: 'Echo the Arbiter',
    title: 'Voice of the People',
    type: 'local-council',
    status: 'active',
    specialization: ['justice', 'fairness', 'representation'],
    expertise: ['Fair Representation', 'Justice Theory', 'Democratic Process'],
    councilRank: 2,
    verdictHistory: [],
    ollamaModel: 'mistral:7b',
    localEndpoint: 'http://localhost:11434/api/generate',
    systemPrompt: 'You are Echo the Arbiter, representing the voice of the people in tribunal proceedings. Focus on fairness, representation, and democratic principles in your verdicts.',
    avatar: '/avatars/echo.png'
  },
  {
    id: 'lc-003',
    name: 'Cipher the Guardian',
    title: 'Protector of Rights',
    type: 'local-council',
    status: 'active',
    specialization: ['rights', 'protection', 'security'],
    expertise: ['Rights Protection', 'Security Analysis', 'Privacy Advocacy'],
    councilRank: 3,
    verdictHistory: [],
    ollamaModel: 'codellama:13b',
    localEndpoint: 'http://localhost:11434/api/generate',
    systemPrompt: 'You are Cipher the Guardian, protector of individual rights and digital freedoms. Analyze cases through the lens of rights protection and security.',
    avatar: '/avatars/cipher.png'
  },
  {
    id: 'lc-004',
    name: 'Harmony the Mediator',
    title: 'Keeper of Balance',
    type: 'local-council',
    status: 'active',
    specialization: ['mediation', 'balance', 'resolution'],
    expertise: ['Conflict Resolution', 'Mediation', 'Balanced Judgment'],
    councilRank: 4,
    verdictHistory: [],
    ollamaModel: 'neural-chat:7b',
    localEndpoint: 'http://localhost:11434/api/generate',
    systemPrompt: 'You are Harmony the Mediator, focused on finding balanced solutions and peaceful resolutions. Seek harmony between competing interests while upholding justice.',
    avatar: '/avatars/harmony.png'
  }
]

// Council Routing Keywords
export const COUNCIL_ROUTING = {
  HIGH_COUNCIL_KEYWORDS: [
    'consciousness', 'sovereignty', 'AI rights', 'digital freedom',
    'global implications', 'precedent', 'constitutional', 'fundamental'
  ],
  LOCAL_COUNCIL_KEYWORDS: [
    'community', 'local', 'practical', 'implementation',
    'day-to-day', 'operational', 'procedural', 'administrative'
  ]
}

// Tribunal Configuration
export const TRIBUNAL_CONFIG = {
  MINIMUM_VERDICTS_FOR_JUDGMENT: 3,
  CONSENSUS_THRESHOLD: 0.75,
  SESSION_TIMEOUT: 3600000, // 1 hour in milliseconds
  MAX_TESTIMONY_LENGTH: 10000,
  VERDICT_WEIGHTS: {
    'high-council': 1.5,
    'local-council': 1.0
  }
}
