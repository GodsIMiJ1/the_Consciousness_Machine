// Chat store with persistence and encrypted export/import
import { create } from 'zustand'
import {
  ChatMessage,
  Conversation,
  saveMessage,
  getMessages,
  createConversation,
  getConversations,
  deleteConversation,
  exportConversation,
  importConversation,
  rebuildIndex
} from '@ai/core/memory/IndexedDbMemory'
import { kodiiEngine } from '@ai/chat/engine'
import { encryptJSON, decryptJSON, bytesToBlob } from '@utils/crypto'

interface ChatState {
  // Current conversation
  convId: string
  deviceId: string
  messages: ChatMessage[]
  conversations: Conversation[]

  // UI state
  loading: boolean
  error: string | null

  // Actions
  sendMessage: (content: string) => Promise<void>
  loadConversation: (convId: string) => Promise<void>
  load: (convId: string) => Promise<void> // Alias for loadConversation
  newConversation: (title?: string) => Promise<void>
  deleteConv: (convId: string) => Promise<void>
  loadConversations: () => Promise<void>
  clearError: () => void
  rebuildSearchIndex: (convId?: string) => Promise<void>
}

export const useChat = create<ChatState>((set, get) => ({
  convId: '',
  deviceId: crypto.randomUUID(), // Generate a unique device ID
  messages: [],
  conversations: [],
  loading: false,
  error: null,

  sendMessage: async (content: string) => {
    const { convId } = get()
    if (!convId) {
      await get().newConversation()
    }
    
    set({ loading: true, error: null })
    
    try {
      // Save user message
      const userMessage = await saveMessage({
        convId: get().convId,
        role: 'user',
        content
      })
      
      // Update UI with user message
      set(state => ({ 
        messages: [...state.messages, userMessage] 
      }))
      
      // Get chat history for context
      const history = get().messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
      
      // Get AI response
      const response = await kodiiEngine.chat(content, history)
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      // Save AI response
      const aiMessage = await saveMessage({
        convId: get().convId,
        role: 'assistant',
        content: response.content,
        metadata: {
          provider: response.provider,
          model: response.model,
          timestamp: response.timestamp
        }
      })
      
      // Update UI with AI response
      set(state => ({ 
        messages: [...state.messages, aiMessage],
        loading: false
      }))
      
      // Refresh conversations list
      await get().loadConversations()
      
    } catch (error) {
      console.error('Send message error:', error)
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to send message' 
      })
    }
  },

  loadConversation: async (convId: string) => {
    set({ loading: true, error: null })

    try {
      const messages = await getMessages(convId)
      set({
        convId,
        messages,
        loading: false
      })

      // Refresh conversations list to update timestamps
      await get().loadConversations()
    } catch (error) {
      console.error('Load conversation error:', error)
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load conversation'
      })
    }
  },

  load: async (convId: string) => {
    // Alias for loadConversation
    await get().loadConversation(convId)
  },

  newConversation: async (title?: string) => {
    set({ loading: true, error: null })
    
    try {
      const conv = await createConversation(title)
      set({ 
        convId: conv.id, 
        messages: [], 
        loading: false 
      })
      await get().loadConversations()
    } catch (error) {
      console.error('New conversation error:', error)
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to create conversation' 
      })
    }
  },

  deleteConv: async (convId: string) => {
    try {
      await deleteConversation(convId)
      await get().loadConversations()
      
      // If we deleted the current conversation, start a new one
      if (get().convId === convId) {
        await get().newConversation()
      }
    } catch (error) {
      console.error('Delete conversation error:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete conversation' 
      })
    }
  },

  loadConversations: async () => {
    try {
      const conversations = await getConversations()
      set({ conversations })
    } catch (error) {
      console.error('Load conversations error:', error)
    }
  },

  clearError: () => set({ error: null }),

  // Search and indexing utilities
  rebuildSearchIndex: async (convId?: string) => {
    try {
      await rebuildIndex(convId)
    } catch (error) {
      console.error('Rebuild index error:', error)
      set({
        error: error instanceof Error ? error.message : 'Failed to rebuild search index'
      })
    }
  }
}))

// Encrypted export/import store
interface ChatExportState {
  exportEncrypted: (passphrase: string) => Promise<void>
  importEncrypted: (file: File, passphrase: string) => Promise<{ deviceId: string; convId: string; count: number }>
}

export const useChatExport = create<ChatExportState>(() => ({
  async exportEncrypted(passphrase: string) {
    const { convId } = useChat.getState()
    if (!convId) throw new Error('No conversation to export')
    
    const bundle = await exportConversation(convId)
    const bytes = await encryptJSON(bundle, passphrase)
    const blob = bytesToBlob(bytes, 'application/x-kodii')
    
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `kodii-${convId.slice(0, 8)}.kodii`
    a.click()
    
    setTimeout(() => URL.revokeObjectURL(a.href), 10000)
  },

  async importEncrypted(file: File, passphrase: string) {
    const buf = await file.arrayBuffer()
    const bundle = await decryptJSON(buf, passphrase)
    const res = await importConversation(bundle)
    
    // Load the imported conversation
    await useChat.getState().loadConversation(res.convId)
    await useChat.getState().loadConversations()
    
    return res
  }
}))

// Initialize chat on app start
export async function initializeChat() {
  const store = useChat.getState()
  await store.loadConversations()

  // Rebuild search index on startup (in background)
  store.rebuildSearchIndex().catch(console.error)

  // If no conversations exist, create a new one
  if (store.conversations.length === 0) {
    await store.newConversation('Welcome to Kodii')
  } else {
    // Load the most recent conversation
    const recent = store.conversations[0]
    await store.loadConversation(recent.id)
  }
}
