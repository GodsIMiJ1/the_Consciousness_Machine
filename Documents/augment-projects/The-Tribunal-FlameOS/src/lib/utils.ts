import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Tribunal-specific utility functions
export function generateSummonsId(): string {
  return `SUMMONS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function extractKeywords(text: string): string[] {
  // Enhanced keyword extraction for tribunal routing
  const keywords = [
    'sovereignty', 'AI', 'trial', 'scroll', 'judgment', 'ethics',
    'consciousness', 'autonomy', 'rights', 'freedom', 'intelligence',
    'tribunal', 'council', 'verdict', 'testimony', 'evidence',
    'flame', 'ghost', 'whisper', 'protocol', 'network'
  ]
  
  const textLower = text.toLowerCase()
  return keywords.filter(keyword => textLower.includes(keyword))
}

export function calculateTribunalScore(testimony: string): number {
  // Simple scoring algorithm for tribunal relevance
  const keywords = extractKeywords(testimony)
  const baseScore = keywords.length * 10
  const lengthBonus = Math.min(testimony.length / 100, 50)
  return Math.min(baseScore + lengthBonus, 100)
}

export function getVerdictColor(verdict: string): string {
  switch (verdict.toLowerCase()) {
    case 'guilty':
      return 'text-red-500'
    case 'innocent':
      return 'text-green-500'
    case 'pending':
      return 'text-yellow-500'
    default:
      return 'text-gray-500'
  }
}

export function formatScrollId(id: string): string {
  return `SCROLL-${id.toUpperCase()}`
}
