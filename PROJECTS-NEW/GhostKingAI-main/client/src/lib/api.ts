import { apiRequest } from './queryClient';

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: {
    timestamp: string;
    integrationData?: any;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  };
  createdAt?: Date;
}

export interface Conversation {
  id: string;
  deviceId: string;
  title?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Device {
  id: string;
  lastActive?: Date;
  settings?: {
    autoSave: boolean;
    voiceEnabled: boolean;
    integrations: string[];
  };
}

export interface Integration {
  id: string;
  deviceId: string;
  name: string;
  type: string;
  isActive?: boolean;
  apiEndpoint?: string;
  apiKey?: string;
  settings?: any;
  createdAt?: Date;
}

export interface IntegrationTemplate {
  type: string;
  name: string;
  description: string;
  icon: string;
  configFields: Array<{
    key: string;
    label: string;
    type: 'text' | 'password' | 'url' | 'select';
    required: boolean;
    placeholder?: string;
    options?: string[];
  }>;
  capabilities: string[];
}

export const api = {
  // Device methods
  async getDevice(deviceId: string): Promise<Device> {
    const res = await apiRequest('GET', `/api/device/${deviceId}`);
    return res.json();
  },

  async updateDeviceSettings(deviceId: string, settings: any): Promise<Device> {
    const res = await apiRequest('PUT', `/api/device/${deviceId}/settings`, { settings });
    return res.json();
  },

  // Conversation methods
  async getConversations(deviceId: string): Promise<Conversation[]> {
    const res = await apiRequest('GET', `/api/conversations/${deviceId}`);
    return res.json();
  },

  async createConversation(deviceId: string, title?: string): Promise<Conversation> {
    const res = await apiRequest('POST', '/api/conversations', { deviceId, title });
    return res.json();
  },

  async deleteConversation(conversationId: string): Promise<void> {
    await apiRequest('DELETE', `/api/conversations/${conversationId}`);
  },

  // Message methods
  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    const res = await apiRequest('GET', `/api/messages/${conversationId}`);
    return res.json();
  },

  async sendMessage(conversationId: string, message: string, deviceId: string): Promise<{
    userMessage: ChatMessage;
    assistantMessage: ChatMessage;
    usage?: any;
  }> {
    const res = await apiRequest('POST', '/api/chat', { conversationId, message, deviceId });
    return res.json();
  },

  // Integration methods
  async getIntegrationTemplates(): Promise<IntegrationTemplate[]> {
    const res = await apiRequest('GET', '/api/integrations/templates');
    return res.json();
  },

  async getIntegrations(deviceId: string): Promise<Integration[]> {
    const res = await apiRequest('GET', `/api/integrations/${deviceId}`);
    return res.json();
  },

  async createIntegration(integration: Omit<Integration, 'id' | 'createdAt'>): Promise<Integration> {
    const res = await apiRequest('POST', '/api/integrations', integration);
    return res.json();
  },

  async updateIntegration(integrationId: string, updates: Partial<Integration>): Promise<Integration> {
    const res = await apiRequest('PUT', `/api/integrations/${integrationId}`, updates);
    return res.json();
  },

  async deleteIntegration(integrationId: string): Promise<void> {
    await apiRequest('DELETE', `/api/integrations/${integrationId}`);
  },

  async testIntegration(type: string, config: any): Promise<{ success: boolean; message: string }> {
    const res = await apiRequest('POST', '/api/integrations/test', { type, config });
    return res.json();
  },

  async executeIntegration(integrationId: string, operation: string, params: any = {}): Promise<{ success: boolean; data?: any; message?: string }> {
    const res = await apiRequest('POST', `/api/integrations/${integrationId}/execute`, { operation, params });
    return res.json();
  },

  // API Key methods
  async getApiKeys(deviceId: string): Promise<any[]> {
    const res = await apiRequest('GET', `/api/external/keys/${deviceId}`);
    return res.json();
  },

  async createApiKey(deviceId: string, name: string, permissions: any): Promise<any> {
    const res = await apiRequest('POST', '/api/external/create-key', { deviceId, name, permissions });
    return res.json();
  },

  async deleteApiKey(keyId: string): Promise<void> {
    await apiRequest('DELETE', `/api/external/keys/${keyId}`);
  },

  // Export
  async exportChatHistory(deviceId: string): Promise<Blob> {
    const res = await apiRequest('GET', `/api/export/${deviceId}`);
    return res.blob();
  },
};
