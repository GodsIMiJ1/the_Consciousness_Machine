import { v4 as uuidv4 } from 'uuid';

interface ChatThread {
  id: string;
  title: string;
  description?: string;
  context?: any;
  createdAt: number;
  updatedAt: number;
}

interface ChatThreadsConfig {
  dbPath: string;
}

export class ChatThreadsService {
  private config: ChatThreadsConfig;
  private threads: Map<string, ChatThread> = new Map();

  constructor(config: ChatThreadsConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    // Initialize database connection
    // For MVP, using in-memory storage
    console.log('ChatThreadsService initialized');
  }

  async listThreads(): Promise<ChatThread[]> {
    return Array.from(this.threads.values()).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async createThread(params: {
    title: string;
    description?: string;
    context?: any;
  }): Promise<ChatThread> {
    const thread: ChatThread = {
      id: uuidv4(),
      title: params.title,
      description: params.description,
      context: params.context,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.threads.set(thread.id, thread);
    return thread;
  }

  async deleteThread(id: string): Promise<boolean> {
    return this.threads.delete(id);
  }

  async getThread(id: string): Promise<ChatThread | null> {
    return this.threads.get(id) || null;
  }

  async updateThread(id: string, updates: Partial<ChatThread>): Promise<ChatThread | null> {
    const thread = this.threads.get(id);
    if (!thread) return null;

    const updatedThread = {
      ...thread,
      ...updates,
      updatedAt: Date.now()
    };

    this.threads.set(id, updatedThread);
    return updatedThread;
  }
}
