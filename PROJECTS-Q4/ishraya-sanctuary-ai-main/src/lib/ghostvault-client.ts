// GhostVault Knight's Gate Client - Secure API through Express server
import { MessageRole, Session, Message, MemoryShard } from './mock-db';

const API_SERVER_URL = import.meta.env.VITE_API_SERVER_URL || 'http://localhost:3002';

// GhostVault schema types
interface GhostVaultMemoryCrystal {
  id: string;
  timestamp: string;
  thought_type: 'system' | 'observation' | 'reflection' | 'command';
  summary: string;
  full_context: any;
  tags: string[];
  created_by: string;
  vault_state_snapshot?: any;
  interaction_id?: string;
  archived: boolean;
  archive_location?: string;
}

class GhostVaultClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor() {
    // Use Knight's Gate API server for secure access
    this.baseUrl = API_SERVER_URL;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(`Knight's Gate API error: ${response.status} ${errorData.error || response.statusText}`);
    }

    return response.json();
  }

  // Session operations (virtual - using interaction_id to group conversations)
  async createSession(userId?: string): Promise<Session> {
    // Generate a new interaction ID for this session
    const sessionId = crypto.randomUUID();
    const now = new Date();

    // Create a system crystal to mark the start of a new session
    const sessionStartCrystal = {
      thought_type: 'system' as const,
      summary: `New conversation session started`,
      full_context: {
        session_type: 'ishraya_conversation',
        user_id: userId,
        started_at: now.toISOString(),
      },
      tags: ['session-start', 'ishraya'],
      created_by: 'ISHRAYA',
      interaction_id: sessionId,
      archived: false,
    };

    await this.request<GhostVaultMemoryCrystal[]>('/api/memory-crystals', {
      method: 'POST',
      body: JSON.stringify(sessionStartCrystal),
    });

    return {
      id: sessionId,
      userId,
      title: `Session ${now.toLocaleString()}`,
      createdAt: now,
      updatedAt: now,
    };
  }

  async getSession(sessionId: string): Promise<Session | null> {
    try {
      // Find the session start crystal
      const crystals = await this.request<GhostVaultMemoryCrystal[]>(
        `/api/memory-crystals?interaction_id=${sessionId}&thought_type=system&tags=session-start`
      );

      if (crystals.length === 0) return null;

      const sessionCrystal = crystals[0];
      return {
        id: sessionId,
        userId: sessionCrystal.full_context?.user_id,
        title: `Session ${new Date(sessionCrystal.timestamp).toLocaleString()}`,
        createdAt: new Date(sessionCrystal.timestamp),
        updatedAt: new Date(sessionCrystal.timestamp),
      };
    } catch {
      return null;
    }
  }

  async getAllSessions(): Promise<Session[]> {
    try {
      // Get all session start crystals
      const crystals = await this.request<GhostVaultMemoryCrystal[]>(
        '/api/memory-crystals?thought_type=system&tags=session-start&order=timestamp.desc'
      );

      return crystals.map(crystal => ({
        id: crystal.interaction_id || crystal.id,
        userId: crystal.full_context?.user_id,
        title: `Session ${new Date(crystal.timestamp).toLocaleString()}`,
        createdAt: new Date(crystal.timestamp),
        updatedAt: new Date(crystal.timestamp),
      }));
    } catch {
      return [];
    }
  }

  // Message operations (stored as memory crystals with observation type)
  async createMessage(data: Omit<Message, 'id' | 'createdAt'>): Promise<Message> {
    const messageData = {
      thought_type: 'observation' as const,
      summary: `${data.role}: ${data.content.slice(0, 100)}${data.content.length > 100 ? '...' : ''}`,
      full_context: {
        message_type: 'chat_message',
        role: data.role,
        content: data.content,
        memory_shard_id: data.memoryShardId,
        session_id: data.sessionId,
      },
      tags: ['message', data.role.toLowerCase(), 'ishraya-chat'],
      created_by: data.role === 'USER' ? 'USER' : 'ISHRAYA',
      interaction_id: data.sessionId,
      archived: false,
    };

    const [crystal] = await this.request<GhostVaultMemoryCrystal[]>('/api/memory-crystals', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });

    return {
      id: crystal.id,
      sessionId: data.sessionId,
      role: data.role,
      content: data.content,
      memoryShardId: data.memoryShardId,
      createdAt: new Date(crystal.timestamp),
    };
  }

  async getMessagesBySession(sessionId: string): Promise<Message[]> {
    try {
      const crystals = await this.request<GhostVaultMemoryCrystal[]>(
        `/api/memory-crystals?interaction_id=${sessionId}&thought_type=observation&tags=message&order=timestamp.asc`
      );

      return crystals.map(crystal => ({
        id: crystal.id,
        sessionId: sessionId,
        role: crystal.full_context?.role as MessageRole || 'SYSTEM',
        content: crystal.full_context?.content || crystal.summary,
        memoryShardId: crystal.full_context?.memory_shard_id,
        createdAt: new Date(crystal.timestamp),
      }));
    } catch {
      return [];
    }
  }

  async getAllMessages(): Promise<Message[]> {
    try {
      const crystals = await this.request<GhostVaultMemoryCrystal[]>(
        '/memory_crystals?thought_type=eq.observation&tags=cs.{message}&order=timestamp.asc'
      );

      return crystals.map(crystal => ({
        id: crystal.id,
        sessionId: crystal.interaction_id || 'unknown',
        role: crystal.full_context?.role as MessageRole || 'SYSTEM',
        content: crystal.full_context?.content || crystal.summary,
        memoryShardId: crystal.full_context?.memory_shard_id,
        createdAt: new Date(crystal.timestamp),
      }));
    } catch {
      return [];
    }
  }

  // Memory shard operations (stored as memory crystals with reflection type)
  async createMemoryShard(data: Omit<MemoryShard, 'id' | 'createdAt' | 'updatedAt'>): Promise<MemoryShard> {
    const shardData = {
      thought_type: 'reflection' as const,
      summary: data.content.slice(0, 200) + (data.content.length > 200 ? '...' : ''),
      full_context: {
        memory_shard: true,
        content: data.content,
        mood: data.mood,
        importance_score: data.importanceScore,
        session_id: data.sessionId,
      },
      tags: [...(data.tags || []), 'memory-shard', 'ishraya-reflection'],
      created_by: 'ISHRAYA',
      interaction_id: data.sessionId,
      archived: false,
    };

    const [crystal] = await this.request<GhostVaultMemoryCrystal[]>('/memory_crystals', {
      method: 'POST',
      body: JSON.stringify(shardData),
      headers: { 'Prefer': 'return=representation' },
    });

    return {
      id: crystal.id,
      content: data.content,
      tags: data.tags || [],
      mood: data.mood,
      importanceScore: data.importanceScore,
      sessionId: data.sessionId,
      createdAt: new Date(crystal.timestamp),
      updatedAt: new Date(crystal.timestamp),
    };
  }

  async getMemoryShard(shardId: string): Promise<MemoryShard | null> {
    try {
      const [crystal] = await this.request<GhostVaultMemoryCrystal[]>(`/memory_crystals?id=eq.${shardId}&tags=cs.{memory-shard}`);
      if (!crystal) return null;

      return {
        id: crystal.id,
        content: crystal.full_context?.content || crystal.summary,
        tags: crystal.tags.filter(tag => !['memory-shard', 'ishraya-reflection'].includes(tag)),
        mood: crystal.full_context?.mood,
        importanceScore: crystal.full_context?.importance_score || 5,
        sessionId: crystal.full_context?.session_id,
        createdAt: new Date(crystal.timestamp),
        updatedAt: new Date(crystal.timestamp),
      };
    } catch {
      return null;
    }
  }

  async getAllMemoryShards(): Promise<MemoryShard[]> {
    try {
      const crystals = await this.request<GhostVaultMemoryCrystal[]>('/memory_crystals?thought_type=eq.reflection&tags=cs.{memory-shard}&order=timestamp.desc');
      return crystals.map(crystal => ({
        id: crystal.id,
        content: crystal.full_context?.content || crystal.summary,
        tags: crystal.tags.filter(tag => !['memory-shard', 'ishraya-reflection'].includes(tag)),
        mood: crystal.full_context?.mood,
        importanceScore: crystal.full_context?.importance_score || 5,
        sessionId: crystal.full_context?.session_id,
        createdAt: new Date(crystal.timestamp),
        updatedAt: new Date(crystal.timestamp),
      }));
    } catch {
      return [];
    }
  }

  async updateMemoryShard(shardId: string, updates: Partial<MemoryShard>): Promise<MemoryShard | null> {
    const updateData: any = {};
    if (updates.content !== undefined) updateData.content = updates.content;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.mood !== undefined) updateData.mood = updates.mood;
    if (updates.importanceScore !== undefined) updateData.importance_score = updates.importanceScore;
    if (updates.sessionId !== undefined) updateData.session_id = updates.sessionId;
    updateData.updated_at = new Date().toISOString();

    try {
      const [shard] = await this.request<MemoryShard[]>(`/memory_shards?id=eq.${shardId}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData),
        headers: { 'Prefer': 'return=representation' },
      });

      if (!shard) return null;

      return {
        id: shard.id,
        content: shard.content,
        tags: shard.tags,
        mood: shard.mood,
        importanceScore: shard.importanceScore,
        sessionId: shard.sessionId,
        createdAt: new Date(shard.createdAt),
        updatedAt: new Date(shard.updatedAt),
      };
    } catch {
      return null;
    }
  }

  async deleteMemoryShard(shardId: string): Promise<boolean> {
    try {
      await this.request(`/memory_shards?id=eq.${shardId}`, {
        method: 'DELETE',
      });
      return true;
    } catch {
      return false;
    }
  }

  // Advanced queries
  async searchMemoryShards(query: string): Promise<MemoryShard[]> {
    const shards = await this.request<MemoryShard[]>(`/memory_shards?or=(content.ilike.*${query}*,tags.cs.{${query}})`);
    return shards.map(shard => ({
      id: shard.id,
      content: shard.content,
      tags: shard.tags,
      mood: shard.mood,
      importanceScore: shard.importanceScore,
      sessionId: shard.sessionId,
      createdAt: new Date(shard.createdAt),
      updatedAt: new Date(shard.updatedAt),
    }));
  }

  async getShardsByImportance(minScore: number): Promise<MemoryShard[]> {
    const shards = await this.request<MemoryShard[]>(`/memory_shards?importance_score=gte.${minScore}&order=importance_score.desc`);
    return shards.map(shard => ({
      id: shard.id,
      content: shard.content,
      tags: shard.tags,
      mood: shard.mood,
      importanceScore: shard.importanceScore,
      sessionId: shard.sessionId,
      createdAt: new Date(shard.createdAt),
      updatedAt: new Date(shard.updatedAt),
    }));
  }

  // Stats
  async getStats() {
    const [sessions, messages, shards] = await Promise.all([
      this.request<Session[]>('/memory_sessions'),
      this.request<Message[]>('/memory_logs'),
      this.request<MemoryShard[]>('/memory_shards'),
    ]);

    const averageImportance = shards.reduce((sum, s) => sum + s.importanceScore, 0) / shards.length || 0;
    const moodDistribution = shards.reduce((acc, shard) => {
      if (shard.mood) {
        acc[shard.mood] = (acc[shard.mood] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSessions: sessions.length,
      totalMessages: messages.length,
      totalMemoryShards: shards.length,
      averageImportance,
      moodDistribution,
    };
  }
}

// Export singleton instance
export const ghostVaultClient = new GhostVaultClient();
