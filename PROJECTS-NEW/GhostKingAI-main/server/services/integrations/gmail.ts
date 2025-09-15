export interface GmailConfig {
  accessToken: string;
  refreshToken?: string;
  clientId?: string;
  clientSecret?: string;
}

export class GmailIntegration {
  private config: GmailConfig;
  private baseUrl = 'https://gmail.googleapis.com/gmail/v1';

  constructor(config: GmailConfig) {
    this.config = config;
  }

  private async apiRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Gmail API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getMessages(maxResults = 10, query = '') {
    const response = await this.apiRequest(`/users/me/messages?maxResults=${maxResults}&q=${encodeURIComponent(query)}`);
    
    if (!response.messages) return [];

    const messages = await Promise.all(
      response.messages.slice(0, 5).map(async (msg: any) => {
        const detail = await this.apiRequest(`/users/me/messages/${msg.id}`);
        return this.parseMessage(detail);
      })
    );

    return messages;
  }

  async getUnreadCount() {
    const response = await this.apiRequest('/users/me/labels/INBOX');
    return response.messagesUnread || 0;
  }

  async markAsRead(messageId: string) {
    return await this.apiRequest(`/users/me/messages/${messageId}/modify`, {
      method: 'POST',
      body: JSON.stringify({
        removeLabelIds: ['UNREAD']
      })
    });
  }

  async sendMessage(to: string, subject: string, body: string) {
    const message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      body
    ].join('\n');

    const encoded = btoa(message).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    return await this.apiRequest('/users/me/messages/send', {
      method: 'POST',
      body: JSON.stringify({ raw: encoded })
    });
  }

  async searchEmails(query: string, maxResults = 10) {
    return await this.getMessages(maxResults, query);
  }

  private parseMessage(message: any) {
    const headers = message.payload.headers;
    const getHeader = (name: string) => headers.find((h: any) => h.name === name)?.value;

    let body = '';
    if (message.payload.body?.data) {
      body = atob(message.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
    } else if (message.payload.parts) {
      const textPart = message.payload.parts.find((part: any) => part.mimeType === 'text/plain');
      if (textPart?.body?.data) {
        body = atob(textPart.body.data.replace(/-/g, '+').replace(/_/g, '/'));
      }
    }

    return {
      id: message.id,
      threadId: message.threadId,
      subject: getHeader('Subject') || 'No Subject',
      from: getHeader('From') || 'Unknown',
      to: getHeader('To') || 'Unknown',
      date: getHeader('Date'),
      body: body.substring(0, 500), // Truncate for summary
      isUnread: message.labelIds?.includes('UNREAD') || false,
      snippet: message.snippet
    };
  }

  async testConnection() {
    try {
      await this.apiRequest('/users/me/profile');
      return { success: true, message: 'Gmail connection successful' };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Connection failed' };
    }
  }
}