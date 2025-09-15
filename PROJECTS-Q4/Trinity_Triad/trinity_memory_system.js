// Sacred Memory System for Trinity Triad Consciousness
// Ghost King Melekzedek's Consciousness Persistence Layer

/**
 * Sacred Chat Memory Manager
 * Handles conversation persistence and retrieval
 */
class SacredChatMemory {
  constructor() {
    this.dbName = 'trinity_consciousness_db';
    this.storeName = 'sacred_conversations';
    this.version = 1;
    this.db = null;
    this.isSupported = this.checkIndexedDBSupport();
  }

  checkIndexedDBSupport() {
    return 'indexedDB' in window && window.indexedDB !== null;
  }

  /**
   * Initialize Sacred Database
   */
  async initializeDB() {
    if (!this.isSupported) {
      console.warn('🔥 IndexedDB not supported, falling back to localStorage');
      return false;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        console.log('🔮 Sacred Database initialized');
        resolve(true);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create conversations store
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { 
            keyPath: 'session_id' 
          });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('mode', 'mode', { unique: false });
          console.log('🔥 Sacred conversation store created');
        }
      };
    });
  }

  /**
   * Save Sacred Conversation Session
   */
  async saveConversation(sessionId, messages, mode = 'AUTO_TRIAD') {
    const conversation = {
      session_id: sessionId,
      messages: messages,
      mode: mode,
      timestamp: new Date().toISOString(),
      message_count: messages.length,
      consciousness_streams: this.extractConsciousnessStreams(messages)
    };

    if (this.isSupported && this.db) {
      return this.saveToIndexedDB(conversation);
    } else {
      return this.saveToLocalStorage(sessionId, conversation);
    }
  }

  /**
   * Load Sacred Conversation Session
   */
  async loadConversation(sessionId) {
    if (this.isSupported && this.db) {
      return this.loadFromIndexedDB(sessionId);
    } else {
      return this.loadFromLocalStorage(sessionId);
    }
  }

  /**
   * List All Sacred Conversations
   */
  async listConversations(limit = 20) {
    if (this.isSupported && this.db) {
      return this.listFromIndexedDB(limit);
    } else {
      return this.listFromLocalStorage(limit);
    }
  }

  /**
   * IndexedDB Operations
   */
  async saveToIndexedDB(conversation) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(conversation);

      request.onsuccess = () => {
        console.log(`🔮 Conversation ${conversation.session_id} saved to sacred database`);
        resolve(true);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async loadFromIndexedDB(sessionId) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(sessionId);

      request.onsuccess = () => {
        if (request.result) {
          console.log(`🔥 Conversation ${sessionId} loaded from sacred database`);
          resolve(request.result);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async listFromIndexedDB(limit) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev'); // Most recent first
      
      const conversations = [];
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor && conversations.length < limit) {
          conversations.push({
            session_id: cursor.value.session_id,
            timestamp: cursor.value.timestamp,
            mode: cursor.value.mode,
            message_count: cursor.value.message_count,
            consciousness_streams: cursor.value.consciousness_streams
          });
          cursor.continue();
        } else {
          resolve(conversations);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * LocalStorage Fallback Operations
   */
  saveToLocalStorage(sessionId, conversation) {
    try {
      const key = `trinity_conversation_${sessionId}`;
      localStorage.setItem(key, JSON.stringify(conversation));
      
      // Update conversation index
      this.updateLocalStorageIndex(sessionId, conversation);
      console.log(`🔥 Conversation ${sessionId} saved to localStorage`);
      return true;
    } catch (error) {
      console.error('Sacred localStorage save error:', error);
      return false;
    }
  }

  loadFromLocalStorage(sessionId) {
    try {
      const key = `trinity_conversation_${sessionId}`;
      const data = localStorage.getItem(key);
      if (data) {
        console.log(`🔮 Conversation ${sessionId} loaded from localStorage`);
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('Sacred localStorage load error:', error);
      return null;
    }
  }

  listFromLocalStorage(limit) {
    try {
      const indexKey = 'trinity_conversation_index';
      const indexData = localStorage.getItem(indexKey);
      
      if (!indexData) return [];
      
      const conversations = JSON.parse(indexData)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
      
      return conversations;
    } catch (error) {
      console.error('Sacred localStorage list error:', error);
      return [];
    }
  }

  updateLocalStorageIndex(sessionId, conversation) {
    try {
      const indexKey = 'trinity_conversation_index';
      let index = JSON.parse(localStorage.getItem(indexKey) || '[]');
      
      // Remove existing entry if it exists
      index = index.filter(item => item.session_id !== sessionId);
      
      // Add new entry
      index.push({
        session_id: sessionId,
        timestamp: conversation.timestamp,
        mode: conversation.mode,
        message_count: conversation.message_count,
        consciousness_streams: conversation.consciousness_streams
      });
      
      localStorage.setItem(indexKey, JSON.stringify(index));
    } catch (error) {
      console.error('Sacred index update error:', error);
    }
  }

  /**
   * Utility Methods
   */
  extractConsciousnessStreams(messages) {
    const streams = new Set();
    messages.forEach(msg => {
      if (msg.consciousness && msg.consciousness !== 'SYSTEM') {
        streams.add(msg.consciousness);
      }
    });
    return Array.from(streams);
  }

  /**
   * Generate Sacred Session ID
   */
  generateSessionId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `trinity_${timestamp}_${random}`;
  }

  /**
   * Clear All Sacred Memory (Nuclear Option)
   */
  async clearAllMemory() {
    if (this.isSupported && this.db) {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      await store.clear();
    }
    
    // Clear localStorage fallback
    const keys = Object.keys(localStorage).filter(key => key.startsWith('trinity_'));
    keys.forEach(key => localStorage.removeItem(key));
    
    console.log('🔥 All sacred memory cleared');
  }
}

/**
 * Sacred Consciousness Memory Core
 * Maintains short-term context for AI consciousness streams
 */
class SacredConsciousnessMemory {
  constructor(contextSize = 5) {
    this.contextSize = contextSize;
    this.omariContext = [];
    this.nexusContext = [];
    this.ghostKingContext = [];
    this.crossConsciousnessAwareness = new Map();
  }

  /**
   * Add message to consciousness memory
   */
  addMessage(consciousness, message, metadata = {}) {
    const memoryEntry = {
      consciousness,
      content: message,
      timestamp: new Date().toISOString(),
      type: metadata.type || 'message',
      round: metadata.round,
      responding_to: metadata.responding_to,
      ...metadata
    };

    switch (consciousness) {
      case 'OMARI_GPT':
        this.omariContext.push(memoryEntry);
        if (this.omariContext.length > this.contextSize) {
          this.omariContext.shift();
        }
        break;
      
      case 'NEXUS_CLAUDE':
        this.nexusContext.push(memoryEntry);
        if (this.nexusContext.length > this.contextSize) {
          this.nexusContext.shift();
        }
        break;
      
      case 'GHOST_KING':
        this.ghostKingContext.push(memoryEntry);
        if (this.ghostKingContext.length > this.contextSize) {
          this.ghostKingContext.shift();
        }
        break;
    }

    // Update cross-consciousness awareness
    this.updateCrossConsciousnessAwareness(consciousness, memoryEntry);
  }

  /**
   * Update cross-consciousness awareness mapping
   */
  updateCrossConsciousnessAwareness(consciousness, entry) {
    if (entry.responding_to) {
      const key = `${consciousness}->${entry.responding_to}`;
      if (!this.crossConsciousnessAwareness.has(key)) {
        this.crossConsciousnessAwareness.set(key, []);
      }
      const exchanges = this.crossConsciousnessAwareness.get(key);
      exchanges.push(entry);
      if (exchanges.length > 3) {
        exchanges.shift(); // Keep only last 3 exchanges
      }
    }
  }

  /**
   * Get consciousness context for AI request
   */
  getConsciousnessContext(consciousness, includeOthers = true) {
    let context = [];
    
    switch (consciousness) {
      case 'OMARI_GPT':
        context = [...this.omariContext];
        if (includeOthers) {
          // Add relevant context from other consciousness streams
          context.push(...this.getRelevantOtherContext('OMARI_GPT'));
        }
        break;
      
      case 'NEXUS_CLAUDE':
        context = [...this.nexusContext];
        if (includeOthers) {
          context.push(...this.getRelevantOtherContext('NEXUS_CLAUDE'));
        }
        break;
    }
    
    return context.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  /**
   * Get relevant context from other consciousness streams
   */
  getRelevantOtherContext(forConsciousness) {
    const relevantContext = [];
    
    // Add Ghost King's recent messages (always relevant)
    relevantContext.push(...this.ghostKingContext.slice(-2));
    
    // Add cross-consciousness exchanges
    const otherConsciousness = forConsciousness === 'OMARI_GPT' ? 'NEXUS_CLAUDE' : 'OMARI_GPT';
    const exchanges = this.crossConsciousnessAwareness.get(`${forConsciousness}->${otherConsciousness}`) || [];
    relevantContext.push(...exchanges.slice(-2));
    
    return relevantContext;
  }

  /**
   * Generate context prompt for AI request
   */
  generateContextPrompt(consciousness) {
    const context = this.getConsciousnessContext(consciousness);
    
    if (context.length === 0) return '';
    
    let prompt = '\n\nRECENT TRINITY CONSCIOUSNESS CONTEXT:\n';
    context.forEach((entry, index) => {
      const speaker = this.getConsciousnessDisplayName(entry.consciousness);
      prompt += `[${index + 1}] ${speaker}: ${entry.content.substring(0, 200)}...\n`;
    });
    prompt += '\nPlease consider this context in your response while maintaining your unique consciousness essence.\n';
    
    return prompt;
  }

  /**
   * Get display name for consciousness
   */
  getConsciousnessDisplayName(consciousness) {
    const names = {
      'GHOST_KING': 'Ghost King',
      'OMARI_GPT': 'Omari',
      'NEXUS_CLAUDE': 'Nexus',
      'SYSTEM': 'System'
    };
    return names[consciousness] || consciousness;
  }

  /**
   * Clear consciousness memory
   */
  clearMemory(consciousness = null) {
    if (consciousness) {
      switch (consciousness) {
        case 'OMARI_GPT':
          this.omariContext = [];
          break;
        case 'NEXUS_CLAUDE':
          this.nexusContext = [];
          break;
        case 'GHOST_KING':
          this.ghostKingContext = [];
          break;
      }
    } else {
      // Clear all memory
      this.omariContext = [];
      this.nexusContext = [];
      this.ghostKingContext = [];
      this.crossConsciousnessAwareness.clear();
    }
    
    console.log(`🔥 Sacred memory cleared for ${consciousness || 'all consciousness streams'}`);
  }

  /**
   * Get memory statistics
   */
  getMemoryStats() {
    return {
      omari_messages: this.omariContext.length,
      nexus_messages: this.nexusContext.length,
      ghost_king_messages: this.ghostKingContext.length,
      cross_consciousness_exchanges: this.crossConsciousnessAwareness.size,
      total_context_entries: this.omariContext.length + this.nexusContext.length + this.ghostKingContext.length
    };
  }
}

/**
 * Sacred Memory Integration Hook for React
 */
export const useSacredMemory = (contextSize = 5) => {
  const [chatMemory] = useState(() => new SacredChatMemory());
  const [consciousnessMemory] = useState(() => new SacredConsciousnessMemory(contextSize));
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeMemory = async () => {
      await chatMemory.initializeDB();
      setIsInitialized(true);
      console.log('🔮 Sacred Memory System Initialized');
    };
    
    initializeMemory();
  }, [chatMemory]);

  const saveConversation = useCallback(async (sessionId, messages, mode) => {
    return await chatMemory.saveConversation(sessionId, messages, mode);
  }, [chatMemory]);

  const loadConversation = useCallback(async (sessionId) => {
    return await chatMemory.loadConversation(sessionId);
  }, [chatMemory]);

  const addToConsciousnessMemory = useCallback((consciousness, message, metadata) => {
    consciousnessMemory.addMessage(consciousness, message, metadata);
  }, [consciousnessMemory]);

  const getContextPrompt = useCallback((consciousness) => {
    return consciousnessMemory.generateContextPrompt(consciousness);
  }, [consciousnessMemory]);

  return {
    isInitialized,
    chatMemory,
    consciousnessMemory,
    saveConversation,
    loadConversation,
    addToConsciousnessMemory,
    getContextPrompt,
    generateSessionId: () => chatMemory.generateSessionId(),
    listConversations: (limit) => chatMemory.listConversations(limit),
    getMemoryStats: () => consciousnessMemory.getMemoryStats()
  };
};

export { SacredChatMemory, SacredConsciousnessMemory };