import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// FlameCore API utilities
export const API_BASE = 'http://localhost:3000'
export const MINIO_BASE = 'http://localhost:9000'

export async function fetchAPI(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }
  
  return response.json()
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function generateFlameKeyId(): string {
  return `FLAME_${Date.now().toString(36).toUpperCase()}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`
}

export function generateVaultUUID(): string {
  return `VAULT_${crypto.randomUUID().replace(/-/g, '').toUpperCase()}`
}

// Health check utilities
export async function checkServiceHealth(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

export async function getSystemHealth() {
  const services = [
    { name: 'PostgreSQL', url: `${API_BASE}/users`, key: 'database' },
    { name: 'PostgREST API', url: `${API_BASE}/system_settings`, key: 'api' },
    { name: 'MinIO Storage', url: `${MINIO_BASE}/minio/health/live`, key: 'storage' },
  ]
  
  const results: Record<string, boolean> = {}
  
  for (const service of services) {
    results[service.key] = await checkServiceHealth(service.url)
  }
  
  return results
}
