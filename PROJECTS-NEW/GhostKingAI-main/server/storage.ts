import { 
  type User, 
  type InsertUser, 
  type Device, 
  type InsertDevice,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type Integration,
  type InsertIntegration,
  type ApiKey,
  type InsertApiKey,
  type MemoryBlock,
  type InsertMemoryBlock,
  type PersonalitySettings,
  type InsertPersonalitySettings
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Device methods
  getDevice(id: string): Promise<Device | undefined>;
  createOrUpdateDevice(device: InsertDevice): Promise<Device>;
  updateDeviceSettings(deviceId: string, settings: any): Promise<Device | undefined>;
  
  // Conversation methods
  getConversationsByDevice(deviceId: string): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversationTitle(id: string, title: string): Promise<Conversation | undefined>;
  deleteConversation(id: string): Promise<boolean>;
  
  // Message methods
  getMessagesByConversation(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  deleteMessagesByConversation(conversationId: string): Promise<boolean>;
  
  // Integration methods
  getIntegrationsByDevice(deviceId: string): Promise<Integration[]>;
  getIntegration(id: string): Promise<Integration | undefined>;
  createIntegration(integration: InsertIntegration): Promise<Integration>;
  updateIntegration(id: string, updates: Partial<Integration>): Promise<Integration | undefined>;
  deleteIntegration(id: string): Promise<boolean>;
  
  // API Key methods
  getApiKeysByDevice(deviceId: string): Promise<ApiKey[]>;
  getApiKeyByHash(keyHash: string): Promise<ApiKey | undefined>;
  createApiKey(apiKey: InsertApiKey & { keyHash: string }): Promise<ApiKey>;
  updateApiKeyLastUsed(id: string): Promise<void>;
  deleteApiKey(id: string): Promise<boolean>;
  
  // Memory Block methods
  getMemoryBlocksByDevice(deviceId: string): Promise<MemoryBlock[]>;
  getMemoryBlock(id: string): Promise<MemoryBlock | undefined>;
  createMemoryBlock(memoryBlock: InsertMemoryBlock): Promise<MemoryBlock>;
  updateMemoryBlock(id: string, updates: Partial<MemoryBlock>): Promise<MemoryBlock | undefined>;
  deleteMemoryBlock(id: string): Promise<boolean>;
  
  // Personality Settings methods
  getPersonalitySettings(deviceId: string): Promise<PersonalitySettings | undefined>;
  createOrUpdatePersonalitySettings(settings: InsertPersonalitySettings): Promise<PersonalitySettings>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private devices: Map<string, Device>;
  private conversations: Map<string, Conversation>;
  private messages: Map<string, Message>;
  private integrations: Map<string, Integration>;
  private apiKeys: Map<string, ApiKey>;
  private memoryBlocks: Map<string, MemoryBlock>;
  private personalitySettings: Map<string, PersonalitySettings>;

  constructor() {
    this.users = new Map();
    this.devices = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.integrations = new Map();
    this.apiKeys = new Map();
    this.memoryBlocks = new Map();
    this.personalitySettings = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getDevice(id: string): Promise<Device | undefined> {
    return this.devices.get(id);
  }

  async createOrUpdateDevice(device: InsertDevice): Promise<Device> {
    const existing = this.devices.get(device.id);
    const now = new Date();
    
    if (existing) {
      const updated: Device = {
        ...existing,
        ...device,
        lastActive: now,
      };
      this.devices.set(device.id, updated);
      return updated;
    } else {
      const newDevice: Device = {
        ...device,
        lastActive: now,
        settings: device.settings || {
          autoSave: true,
          voiceEnabled: true,
          integrations: [],
          memoryLimit: 35
        }
      };
      this.devices.set(device.id, newDevice);
      return newDevice;
    }
  }

  async updateDeviceSettings(deviceId: string, settings: any): Promise<Device | undefined> {
    const device = this.devices.get(deviceId);
    if (device) {
      const updated = { ...device, settings };
      this.devices.set(deviceId, updated);
      return updated;
    }
    return undefined;
  }

  async getConversationsByDevice(deviceId: string): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .filter(conv => conv.deviceId === deviceId)
      .sort((a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0));
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const now = new Date();
    const conversation: Conversation = {
      ...insertConversation,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async updateConversationTitle(id: string, title: string): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(id);
    if (conversation) {
      const updated = { ...conversation, title, updatedAt: new Date() };
      this.conversations.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async deleteConversation(id: string): Promise<boolean> {
    const deleted = this.conversations.delete(id);
    if (deleted) {
      // Also delete associated messages
      await this.deleteMessagesByConversation(id);
    }
    return deleted;
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    
    // Update conversation's updatedAt
    const conversation = this.conversations.get(insertMessage.conversationId);
    if (conversation) {
      const updated = { ...conversation, updatedAt: new Date() };
      this.conversations.set(insertMessage.conversationId, updated);
    }
    
    return message;
  }

  async deleteMessagesByConversation(conversationId: string): Promise<boolean> {
    const messagesToDelete = Array.from(this.messages.entries())
      .filter(([_, msg]) => msg.conversationId === conversationId);
    
    messagesToDelete.forEach(([id]) => this.messages.delete(id));
    return messagesToDelete.length > 0;
  }

  async getIntegrationsByDevice(deviceId: string): Promise<Integration[]> {
    return Array.from(this.integrations.values())
      .filter(integration => integration.deviceId === deviceId);
  }

  async getIntegration(id: string): Promise<Integration | undefined> {
    return this.integrations.get(id);
  }

  async createIntegration(insertIntegration: InsertIntegration): Promise<Integration> {
    const id = randomUUID();
    const integration: Integration = {
      ...insertIntegration,
      id,
      createdAt: new Date(),
    };
    this.integrations.set(id, integration);
    return integration;
  }

  async updateIntegration(id: string, updates: Partial<Integration>): Promise<Integration | undefined> {
    const integration = this.integrations.get(id);
    if (integration) {
      const updated = { ...integration, ...updates };
      this.integrations.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async deleteIntegration(id: string): Promise<boolean> {
    return this.integrations.delete(id);
  }

  // API Key methods
  async getApiKeysByDevice(deviceId: string): Promise<ApiKey[]> {
    return Array.from(this.apiKeys.values())
      .filter(apiKey => apiKey.deviceId === deviceId);
  }

  async getApiKeyByHash(keyHash: string): Promise<ApiKey | undefined> {
    return Array.from(this.apiKeys.values())
      .find(apiKey => apiKey.keyHash === keyHash);
  }

  async createApiKey(insertApiKey: InsertApiKey & { keyHash: string }): Promise<ApiKey> {
    const id = randomUUID();
    const apiKey: ApiKey = {
      ...insertApiKey,
      id,
      isActive: true,
      lastUsed: null,
      createdAt: new Date(),
    };
    this.apiKeys.set(id, apiKey);
    return apiKey;
  }

  async updateApiKeyLastUsed(id: string): Promise<void> {
    const apiKey = this.apiKeys.get(id);
    if (apiKey) {
      const updated = { ...apiKey, lastUsed: new Date() };
      this.apiKeys.set(id, updated);
    }
  }

  async deleteApiKey(id: string): Promise<boolean> {
    return this.apiKeys.delete(id);
  }

  // Memory Block methods
  async getMemoryBlocksByDevice(deviceId: string): Promise<MemoryBlock[]> {
    return Array.from(this.memoryBlocks.values())
      .filter(block => block.deviceId === deviceId && block.isActive)
      .sort((a, b) => b.importance - a.importance || (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0));
  }

  async getMemoryBlock(id: string): Promise<MemoryBlock | undefined> {
    return this.memoryBlocks.get(id);
  }

  async createMemoryBlock(insertMemoryBlock: InsertMemoryBlock): Promise<MemoryBlock> {
    const id = randomUUID();
    const now = new Date();
    const memoryBlock: MemoryBlock = {
      ...insertMemoryBlock,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.memoryBlocks.set(id, memoryBlock);
    return memoryBlock;
  }

  async updateMemoryBlock(id: string, updates: Partial<MemoryBlock>): Promise<MemoryBlock | undefined> {
    const memoryBlock = this.memoryBlocks.get(id);
    if (memoryBlock) {
      const updated = { ...memoryBlock, ...updates, updatedAt: new Date() };
      this.memoryBlocks.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async deleteMemoryBlock(id: string): Promise<boolean> {
    return this.memoryBlocks.delete(id);
  }

  // Personality Settings methods
  async getPersonalitySettings(deviceId: string): Promise<PersonalitySettings | undefined> {
    return Array.from(this.personalitySettings.values())
      .find(settings => settings.deviceId === deviceId);
  }

  async createOrUpdatePersonalitySettings(insertSettings: InsertPersonalitySettings): Promise<PersonalitySettings> {
    const existing = await this.getPersonalitySettings(insertSettings.deviceId);
    
    if (existing) {
      const updated: PersonalitySettings = {
        ...existing,
        ...insertSettings,
        updatedAt: new Date(),
      };
      this.personalitySettings.set(existing.id, updated);
      return updated;
    } else {
      const id = randomUUID();
      const settings: PersonalitySettings = {
        ...insertSettings,
        id,
        updatedAt: new Date(),
      };
      this.personalitySettings.set(id, settings);
      return settings;
    }
  }
}

export const storage = new MemStorage();
