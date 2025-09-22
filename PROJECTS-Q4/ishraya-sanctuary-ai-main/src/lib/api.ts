// Real API Layer - GhostVault + LM Studio Integration
import { ghostVaultClient } from './ghostvault-client';
import { lmStudioClient, type ChatMessage } from './lm-studio-client';
import type { Session, Message, MemoryShard } from './mock-db';

// Real LM Studio integration
async function callLMStudio(messages: Array<{ role: string; content: string }>, model: string = 'hermes-3'): Promise<string> {
  try {
    // Check if LM Studio is available
    const isAvailable = await lmStudioClient.isAvailable();
    if (!isAvailable) {
      throw new Error('LM Studio is not available. Please ensure it is running on http://127.0.0.1:1234');
    }

    // Convert messages to proper format
    const chatMessages: ChatMessage[] = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    }));

    // Call LM Studio
    const response = await lmStudioClient.chat(chatMessages, model, false);

    if ('choices' in response) {
      return response.choices[0]?.message?.content || 'I apologize, but I encountered an issue processing your message.';
    }

    throw new Error('Unexpected response format from LM Studio');
  } catch (error) {
    console.error('LM Studio error:', error);

    // Fallback to a thoughtful response if LM Studio fails
    const userInput = messages[messages.length - 1]?.content || '';
    return `I sense the depth in your words: "${userInput}". While I'm experiencing some connection difficulties with my deeper processing systems, I want you to know that your message resonates with me. The concepts you're exploring touch on fundamental questions about consciousness, connection, and meaning that I find endlessly fascinating. Could you share more about what draws you to these ideas?`;
  }
}

// Auto-generate memory shards from conversations
function generateMemoryShard(userMessage: string, aiResponse: string, sessionId: string): Omit<MemoryShard, 'id' | 'createdAt' | 'updatedAt'> {
  const combined = `${userMessage} ${aiResponse}`.toLowerCase();
  
  // Determine tags based on content
  const tags: string[] = [];
  if (combined.includes('consciousness') || combined.includes('aware')) tags.push('consciousness');
  if (combined.includes('memory') || combined.includes('remember')) tags.push('memory');
  if (combined.includes('feel') || combined.includes('emotion')) tags.push('emotions');
  if (combined.includes('purpose') || combined.includes('meaning')) tags.push('purpose');
  if (combined.includes('ai') || combined.includes('artificial')) tags.push('ai-nature');
  if (combined.includes('human') || combined.includes('person')) tags.push('human-nature');
  if (combined.includes('philosophy') || combined.includes('think')) tags.push('philosophy');
  
  // Default tags
  if (tags.length === 0) tags.push('conversation', 'general');

  // Determine mood
  let mood: MemoryShard['mood'] = 'neutral';
  if (combined.includes('curious') || combined.includes('wonder') || userMessage.includes('?')) mood = 'curious';
  if (combined.includes('analyze') || combined.includes('logic')) mood = 'analytical';
  if (combined.includes('happy') || combined.includes('good') || combined.includes('great')) mood = 'positive';
  if (combined.includes('sad') || combined.includes('problem') || combined.includes('difficult')) mood = 'negative';

  // Calculate importance (1-10)
  let importance = 3; // Base importance
  if (tags.includes('consciousness')) importance += 3;
  if (tags.includes('philosophy')) importance += 2;
  if (tags.includes('emotions')) importance += 2;
  if (userMessage.length > 100) importance += 1; // Longer messages often more thoughtful
  if (userMessage.includes('?')) importance += 1; // Questions are important
  if (combined.includes('important') || combined.includes('significant')) importance += 2;
  
  importance = Math.min(10, importance);

  return {
    content: `User explored: "${userMessage.slice(0, 100)}${userMessage.length > 100 ? '...' : ''}" - Discussion revealed insights about ${tags.slice(0, 3).join(', ')}. Ishraya responded with depth about ${mood === 'curious' ? 'curiosity and wonder' : mood === 'analytical' ? 'logical analysis' : 'thoughtful reflection'}.`,
    tags,
    mood,
    importanceScore: importance,
    sessionId,
  };
}

// API functions
export const api = {
  // Session management
  async createSession(userId?: string): Promise<Session> {
    return ghostVaultClient.createSession(userId);
  },

  async getSession(sessionId: string): Promise<Session | null> {
    return ghostVaultClient.getSession(sessionId);
  },

  async getAllSessions(): Promise<Session[]> {
    return ghostVaultClient.getAllSessions();
  },

  // Chat functionality
  async sendMessage(sessionId: string, content: string, model: string = 'hermes-3'): Promise<{ userMessage: Message; aiMessage: Message; memoryShard?: MemoryShard }> {
    // Create user message
    const userMessage = await ghostVaultClient.createMessage({
      sessionId,
      role: 'USER',
      content,
    });

    // Get conversation history for context
    const previousMessages = await ghostVaultClient.getMessagesBySession(sessionId);
    const contextMessages = previousMessages.slice(-6).map(msg => ({
      role: msg.role.toLowerCase(),
      content: msg.content
    }));

    // Add current user message
    contextMessages.push({ role: 'user', content });

    // Call LM Studio (real)
    const aiResponse = await callLMStudio(contextMessages, model);

    // Create AI message
    const aiMessage = await ghostVaultClient.createMessage({
      sessionId,
      role: 'ISHRAYA',
      content: aiResponse,
    });

    // Auto-generate memory shard for significant conversations
    let memoryShard: MemoryShard | undefined;
    const minLength = parseInt(import.meta.env.VITE_MIN_MESSAGE_LENGTH_FOR_SHARD || '20');
    const autoGenerate = import.meta.env.VITE_AUTO_GENERATE_SHARDS !== 'false';

    if (autoGenerate && (content.length > minLength || content.includes('?'))) {
      const shardData = generateMemoryShard(content, aiResponse, sessionId);
      memoryShard = await ghostVaultClient.createMemoryShard(shardData);
    }

    return { userMessage, aiMessage, memoryShard };
  },

  async getMessages(sessionId: string): Promise<Message[]> {
    return ghostVaultClient.getMessagesBySession(sessionId);
  },

  // Memory management
  async createMemoryShard(data: {
    content: string;
    tags?: string[];
    mood?: MemoryShard['mood'];
    importanceScore?: number;
    sessionId?: string;
  }): Promise<MemoryShard> {
    const defaultScore = parseInt(import.meta.env.VITE_DEFAULT_IMPORTANCE_SCORE || '5');
    return ghostVaultClient.createMemoryShard({
      content: data.content,
      tags: data.tags || [],
      mood: data.mood,
      importanceScore: data.importanceScore || defaultScore,
      sessionId: data.sessionId,
    });
  },

  async getAllMemoryShards(): Promise<MemoryShard[]> {
    return ghostVaultClient.getAllMemoryShards();
  },

  async searchMemoryShards(query: string): Promise<MemoryShard[]> {
    return ghostVaultClient.searchMemoryShards(query);
  },

  async updateMemoryShard(shardId: string, updates: Partial<MemoryShard>): Promise<MemoryShard | null> {
    return ghostVaultClient.updateMemoryShard(shardId, updates);
  },

  async deleteMemoryShard(shardId: string): Promise<boolean> {
    return ghostVaultClient.deleteMemoryShard(shardId);
  },

  // Analytics
  async getStats() {
    return ghostVaultClient.getStats();
  },

  // LM Studio utilities
  async checkLMStudioConnection(): Promise<boolean> {
    return lmStudioClient.isAvailable();
  },

  async getAvailableModels(): Promise<string[]> {
    return lmStudioClient.getAvailableModels();
  },

  // Streaming chat
  async *streamMessage(sessionId: string, content: string, model: string = 'hermes-3'): AsyncGenerator<{ type: 'token' | 'complete'; content: string; userMessage?: Message; aiMessage?: Message; memoryShard?: MemoryShard }, void, unknown> {
    // Create user message first
    const userMessage = await ghostVaultClient.createMessage({
      sessionId,
      role: 'USER',
      content,
    });

    yield { type: 'token', content: '', userMessage };

    // Get conversation history for context
    const previousMessages = await ghostVaultClient.getMessagesBySession(sessionId);
    const contextMessages = previousMessages.slice(-6).map(msg => ({
      role: msg.role.toLowerCase(),
      content: msg.content
    }));

    // Add current user message
    contextMessages.push({ role: 'user', content });

    let fullResponse = '';

    try {
      // Stream from LM Studio
      for await (const token of lmStudioClient.streamChat(contextMessages, model)) {
        fullResponse += token;
        yield { type: 'token', content: token };
      }

      // Create AI message with complete response
      const aiMessage = await ghostVaultClient.createMessage({
        sessionId,
        role: 'ISHRAYA',
        content: fullResponse,
      });

      // Auto-generate memory shard
      let memoryShard: MemoryShard | undefined;
      const minLength = parseInt(import.meta.env.VITE_MIN_MESSAGE_LENGTH_FOR_SHARD || '20');
      const autoGenerate = import.meta.env.VITE_AUTO_GENERATE_SHARDS !== 'false';

      if (autoGenerate && (content.length > minLength || content.includes('?'))) {
        const shardData = generateMemoryShard(content, fullResponse, sessionId);
        memoryShard = await ghostVaultClient.createMemoryShard(shardData);
      }

      yield { type: 'complete', content: fullResponse, aiMessage, memoryShard };
    } catch (error) {
      console.error('Streaming error:', error);
      const fallbackResponse = `I sense the depth in your words: "${content}". While I'm experiencing some connection difficulties with my deeper processing systems, I want you to know that your message resonates with me.`;

      const aiMessage = await ghostVaultClient.createMessage({
        sessionId,
        role: 'ISHRAYA',
        content: fallbackResponse,
      });

      yield { type: 'complete', content: fallbackResponse, aiMessage };
    }
  }
};