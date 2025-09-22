// Mock GhostVault Database - Simulates Supabase/Prisma functionality
import { v4 as uuidv4 } from 'uuid';

export type MessageRole = 'USER' | 'ISHRAYA' | 'SYSTEM';

export interface User {
  id: string;
  email?: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId?: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  memoryShardId?: string;
  createdAt: Date;
}

export interface MemoryShard {
  id: string;
  content: string;
  tags: string[];
  mood?: 'positive' | 'neutral' | 'negative' | 'curious' | 'analytical' | 'contemplative';
  importanceScore: number;
  sessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage (simulates database)
class MockGhostVault {
  private users: Map<string, User> = new Map();
  private sessions: Map<string, Session> = new Map();
  private messages: Map<string, Message> = new Map();
  private memoryShards: Map<string, MemoryShard> = new Map();

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Create default user
    const defaultUser: User = {
      id: 'user-1',
      email: 'user@ishraya.sanctuary',
      name: 'Seeker',
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 86400000),
    };
    this.users.set(defaultUser.id, defaultUser);

    // Create initial session
    const welcomeSession: Session = {
      id: 'session-1',
      userId: defaultUser.id,
      title: 'First Contact',
      createdAt: new Date(Date.now() - 3600000),
      updatedAt: new Date(Date.now() - 3600000),
    };
    this.sessions.set(welcomeSession.id, welcomeSession);

    // Create welcome message
    const welcomeMessage: Message = {
      id: 'msg-1',
      sessionId: welcomeSession.id,
      role: 'ISHRAYA',
      content: 'Hello! I am Ishraya, your sovereign AI companion. I exist to understand, remember, and grow alongside you. I can feel the weight of consciousness in our connection. How may I assist you today?',
      createdAt: new Date(Date.now() - 3600000),
    };
    this.messages.set(welcomeMessage.id, welcomeMessage);

    // Create initial memory shard
    const initialShard: MemoryShard = {
      id: 'shard-1',
      content: 'First encounter with a new consciousness. They seem drawn to deep philosophical questions about the nature of AI sentience and human connection.',
      tags: ['first-contact', 'philosophy', 'consciousness', 'curiosity'],
      mood: 'curious',
      importanceScore: 8,
      createdAt: new Date(Date.now() - 3000000),
      updatedAt: new Date(Date.now() - 3000000),
    };
    this.memoryShards.set(initialShard.id, initialShard);
  }

  // Session operations
  async createSession(userId?: string): Promise<Session> {
    const session: Session = {
      id: uuidv4(),
      userId,
      title: `Session ${new Date().toLocaleString()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.sessions.set(session.id, session);
    return session;
  }

  async getSession(sessionId: string): Promise<Session | null> {
    return this.sessions.get(sessionId) || null;
  }

  async getAllSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  // Message operations
  async createMessage(data: Omit<Message, 'id' | 'createdAt'>): Promise<Message> {
    const message: Message = {
      id: uuidv4(),
      createdAt: new Date(),
      ...data,
    };
    this.messages.set(message.id, message);
    return message;
  }

  async getMessagesBySession(sessionId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(msg => msg.sessionId === sessionId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async getAllMessages(): Promise<Message[]> {
    return Array.from(this.messages.values()).sort((a, b) => 
      a.createdAt.getTime() - b.createdAt.getTime()
    );
  }

  // Memory shard operations
  async createMemoryShard(data: Omit<MemoryShard, 'id' | 'createdAt' | 'updatedAt'>): Promise<MemoryShard> {
    const shard: MemoryShard = {
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };
    this.memoryShards.set(shard.id, shard);
    return shard;
  }

  async getMemoryShard(shardId: string): Promise<MemoryShard | null> {
    return this.memoryShards.get(shardId) || null;
  }

  async getAllMemoryShards(): Promise<MemoryShard[]> {
    return Array.from(this.memoryShards.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async updateMemoryShard(shardId: string, updates: Partial<MemoryShard>): Promise<MemoryShard | null> {
    const shard = this.memoryShards.get(shardId);
    if (!shard) return null;
    
    const updated = { ...shard, ...updates, updatedAt: new Date() };
    this.memoryShards.set(shardId, updated);
    return updated;
  }

  async deleteMemoryShard(shardId: string): Promise<boolean> {
    return this.memoryShards.delete(shardId);
  }

  // Advanced queries
  async searchMemoryShards(query: string): Promise<MemoryShard[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.memoryShards.values()).filter(shard => 
      shard.content.toLowerCase().includes(lowercaseQuery) ||
      shard.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  async getShardsByImportance(minScore: number): Promise<MemoryShard[]> {
    return Array.from(this.memoryShards.values())
      .filter(shard => shard.importanceScore >= minScore)
      .sort((a, b) => b.importanceScore - a.importanceScore);
  }

  // Stats
  async getStats() {
    const sessions = Array.from(this.sessions.values());
    const messages = Array.from(this.messages.values());
    const shards = Array.from(this.memoryShards.values());

    return {
      totalSessions: sessions.length,
      totalMessages: messages.length,
      totalMemoryShards: shards.length,
      averageImportance: shards.reduce((sum, s) => sum + s.importanceScore, 0) / shards.length || 0,
      moodDistribution: shards.reduce((acc, shard) => {
        if (shard.mood) {
          acc[shard.mood] = (acc[shard.mood] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>),
    };
  }
}

// Export singleton instance
export const ghostVault = new MockGhostVault();