// IndexedDB chat history via Dexie for local persistence with search
import Dexie, { Table } from 'dexie'
import { getDeviceId } from '@utils/device'
import type { ProjectSettings, AuditLogEntry } from '@/types/project'

export interface ChatMessage {
  id: string
  deviceId: string
  convId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: number
  metadata?: Record<string, any>
}

export interface Conversation {
  id: string
  deviceId: string
  title: string
  createdAt: number
  updatedAt: number
  messageCount: number
}

export interface IndexRow {
  term: string
  msgId: string
  convId: string
  deviceId: string
  weight: number
}

class KodiiDatabase extends Dexie {
  messages!: Table<ChatMessage>
  conversations!: Table<Conversation>
  index!: Table<IndexRow, [string, string]>
  kv!: Table<{ key: string; value: any }, string>
  projects!: Table<ProjectSettings>
  auditLog!: Table<AuditLogEntry>

  constructor() {
    super('KodiiDatabase')
    this.version(1).stores({
      messages: '++id, deviceId, convId, role, createdAt',
      conversations: '++id, deviceId, createdAt, updatedAt'
    })

    // v2 adds search index and KV store
    this.version(2).stores({
      messages: '++id, deviceId, convId, role, createdAt',
      conversations: '++id, deviceId, createdAt, updatedAt',
      index: '[term+msgId], convId, deviceId',
      kv: 'key'
    })

    // v3 adds project settings and audit logging
    this.version(3).stores({
      messages: '++id, deviceId, convId, role, createdAt',
      conversations: '++id, deviceId, createdAt, updatedAt',
      index: '[term+msgId], convId, deviceId',
      kv: 'key',
      projects: '++id, name, createdAt, updatedAt',
      auditLog: '++id, projectId, convId, tool, timestamp'
    })
  }
}

export const db = new KodiiDatabase()

// Core memory operations
export async function saveMessage(message: Omit<ChatMessage, 'id' | 'deviceId' | 'createdAt'>): Promise<ChatMessage> {
  const fullMessage: ChatMessage = {
    ...message,
    id: crypto.randomUUID(),
    deviceId: getDeviceId(),
    createdAt: Date.now()
  }

  await db.messages.add(fullMessage)
  await updateConversation(message.convId)

  // Index the message for search
  await indexMessage(fullMessage)

  return fullMessage
}

export async function getMessages(convId: string): Promise<ChatMessage[]> {
  const deviceId = getDeviceId()
  return db.messages
    .where({ deviceId, convId })
    .sortBy('createdAt')
}

export async function createConversation(title?: string): Promise<Conversation> {
  const deviceId = getDeviceId()
  const conv: Conversation = {
    id: crypto.randomUUID(),
    deviceId,
    title: title || 'New Chat',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messageCount: 0
  }
  
  await db.conversations.add(conv)
  return conv
}

export async function updateConversation(convId: string): Promise<void> {
  const deviceId = getDeviceId()
  const messageCount = await db.messages.where({ deviceId, convId }).count()
  
  await db.conversations
    .where({ deviceId, id: convId })
    .modify({
      updatedAt: Date.now(),
      messageCount
    })
}

export async function getConversation(convId: string): Promise<ChatMessage[]> {
  // Return messages for a specific conversation
  return getMessages(convId)
}

export async function getConversations(): Promise<Conversation[]> {
  const deviceId = getDeviceId()
  return db.conversations
    .where({ deviceId })
    .reverse()
    .sortBy('updatedAt')
}

export async function deleteConversation(convId: string): Promise<void> {
  const deviceId = getDeviceId()
  await db.messages.where({ deviceId, convId }).delete()
  await db.conversations.where({ deviceId, id: convId }).delete()
}

// Export/Import for encrypted .kodii files
export async function exportConversation(convId: string) {
  const deviceId = getDeviceId()
  const messages = await db.messages.where({ deviceId, convId }).sortBy('createdAt')
  const conversation = await db.conversations.where({ deviceId, id: convId }).first()
  
  return { 
    deviceId, 
    convId, 
    conversation,
    messages, 
    exportedAt: Date.now(), 
    version: 1 
  }
}

export async function importConversation(bundle: {
  deviceId: string
  convId: string
  conversation?: Conversation
  messages: ChatMessage[]
}) {
  // Insert messages with the current deviceId to keep provenance local
  const deviceId = getDeviceId()
  const convId = crypto.randomUUID()

  // Create conversation
  const conv: Conversation = {
    id: convId,
    deviceId,
    title: bundle.conversation?.title || 'Imported Chat',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messageCount: bundle.messages.length
  }

  await db.conversations.add(conv)

  // Import messages
  const imported = bundle.messages.map(m => ({
    ...m,
    id: crypto.randomUUID(),
    deviceId,
    convId
  }))

  await db.messages.bulkAdd(imported)

  // Index imported messages for search
  for (const msg of imported) {
    await indexMessage(msg)
  }

  return { deviceId, convId, count: imported.length }
}

// Optional generic KV store
export const KV = {
  async get<T>(key: string): Promise<T | null> {
    const row = await db.kv.get(key)
    return row ? (row.value as T) : null
  },
  async set<T>(key: string, value: T) {
    await db.kv.put({ key, value })
  }
}

// Search functionality
const STOP_WORDS = new Set(['the','a','an','of','and','or','to','in','for','on','with','is','are','be','as','at','by','from'])

function tokenize(text: string): string[] {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t && !STOP_WORDS.has(t))
    .slice(0, 128)
}

export async function indexMessage(message: ChatMessage): Promise<void> {
  const tokens = tokenize(message.content)
  const deviceId = message.deviceId
  const convId = message.convId

  const rows: IndexRow[] = tokens.map((term, i) => ({
    term,
    msgId: message.id,
    convId,
    deviceId,
    weight: 1 / (1 + i)
  }))

  if (rows.length) {
    await db.index.bulkPut(rows)
  }
}

export async function rebuildIndex(convId?: string): Promise<void> {
  const deviceId = getDeviceId()
  const query = convId
    ? db.messages.where({ deviceId, convId })
    : db.messages.where('deviceId').equals(deviceId)

  const allMessages = await query.toArray()

  // Clear existing index
  await db.index.clear()

  // Rebuild index
  for (const message of allMessages) {
    await indexMessage(message)
  }
}

export async function searchConversations(query: string, limit = 10) {
  const deviceId = getDeviceId()
  const terms = Array.from(new Set(tokenize(query)))

  if (!terms.length) return []

  // Fetch hits per term
  const hits = await Promise.all(
    terms.map(term => db.index.where('term').equals(term).toArray())
  )

  const scoreByConv = new Map<string, number>()
  const msgByConv = new Map<string, string>()

  for (const rows of hits) {
    for (const row of rows) {
      if (row.deviceId !== deviceId) continue

      const score = (scoreByConv.get(row.convId) || 0) + row.weight
      scoreByConv.set(row.convId, score)
      msgByConv.set(row.convId, row.msgId)
    }
  }

  const ranked = Array.from(scoreByConv.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)

  const results = []
  for (const [convId, score] of ranked) {
    const messages = await db.messages.where({ deviceId, convId }).sortBy('createdAt')
    const preview = messages
      .slice(-4)
      .map(m => `${m.role}: ${m.content}`)
      .join(' | ')
      .slice(0, 240)

    results.push({
      convId,
      score,
      count: messages.length,
      preview
    })
  }

  return results
}

// Project management functions
export async function saveProject(project: ProjectSettings): Promise<void> {
  await db.projects.put(project)
}

export async function getProject(projectId: string): Promise<ProjectSettings | undefined> {
  return db.projects.get(projectId)
}

export async function getAllProjects(): Promise<ProjectSettings[]> {
  return db.projects.orderBy('updatedAt').reverse().toArray()
}

export async function deleteProject(projectId: string): Promise<void> {
  await db.projects.delete(projectId)
  // Also clean up related audit logs
  await db.auditLog.where('projectId').equals(projectId).delete()
}

export async function updateProject(projectId: string, updates: Partial<ProjectSettings>): Promise<void> {
  await db.projects.update(projectId, { ...updates, updatedAt: Date.now() })
}

// Scratchpad functions (stored in KV store)
export async function getScratchpad(projectId: string): Promise<string> {
  const key = `proj:scratchpad:${projectId}`
  const value = await KV.get<string>(key)
  return value || ''
}

export async function saveScratchpad(projectId: string, content: string): Promise<void> {
  const key = `proj:scratchpad:${projectId}`
  await KV.set(key, content)
}

// Audit log functions
export async function logToolCall(entry: AuditLogEntry): Promise<void> {
  await db.auditLog.add(entry)
}

export async function getAuditLog(projectId: string, limit = 50): Promise<AuditLogEntry[]> {
  return db.auditLog
    .where('projectId')
    .equals(projectId)
    .orderBy('timestamp')
    .reverse()
    .limit(limit)
    .toArray()
}

export async function getRecentAuditLog(limit = 100): Promise<AuditLogEntry[]> {
  return db.auditLog
    .orderBy('timestamp')
    .reverse()
    .limit(limit)
    .toArray()
}

export async function clearAuditLog(projectId?: string): Promise<void> {
  if (projectId) {
    await db.auditLog.where('projectId').equals(projectId).delete()
  } else {
    await db.auditLog.clear()
  }
}

// Additional conversation management functions
export async function listAllConversationIds(): Promise<string[]> {
  const conversations = await db.conversations.orderBy('updatedAt').reverse().toArray()
  return conversations.map(conv => conv.id)
}

export async function deleteConversations(convIds: string[]): Promise<void> {
  // Delete messages first
  for (const convId of convIds) {
    await db.messages.where('convId').equals(convId).delete()
    await db.index.where('convId').equals(convId).delete()
  }

  // Delete conversations
  await db.conversations.where('id').anyOf(convIds).delete()
}

export async function setConversationProject(convId: string, projectId: string): Promise<void> {
  // For now, just store in KV store since we don't have project field in conversations table
  await KV.set(`conv:project:${convId}`, projectId)
}

export async function listConversationsByProject(projectId: string): Promise<string[]> {
  // Get all conversation IDs that belong to this project
  const allConvs = await listAllConversationIds()
  const projectConvs: string[] = []

  for (const convId of allConvs) {
    const convProject = await KV.get<string>(`conv:project:${convId}`)
    if (convProject === projectId) {
      projectConvs.push(convId)
    }
  }

  return projectConvs
}

export async function exportConversations(convIds: string[]): Promise<any> {
  // Export conversations and their messages
  const conversations = []

  for (const convId of convIds) {
    const messages = await getMessages(convId)
    const conversation = await db.conversations.get(convId)
    if (conversation) {
      conversations.push({
        conversation,
        messages
      })
    }
  }

  return {
    version: '1.0',
    timestamp: Date.now(),
    conversations
  }
}

export async function importArchive(data: any): Promise<Record<string, string>> {
  // Import conversations and return mapping of old IDs to new IDs
  const idMap: Record<string, string> = {}

  if (!data.conversations) return idMap

  for (const item of data.conversations) {
    const oldConvId = item.conversation.id
    const newConvId = crypto.randomUUID()
    idMap[oldConvId] = newConvId

    // Create new conversation
    const newConv = {
      ...item.conversation,
      id: newConvId,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    await db.conversations.add(newConv)

    // Import messages
    for (const msg of item.messages) {
      const newMsg = {
        ...msg,
        id: crypto.randomUUID(),
        convId: newConvId,
        createdAt: Date.now()
      }
      await db.messages.add(newMsg)
    }
  }

  return idMap
}
