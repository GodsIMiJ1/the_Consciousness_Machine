// PROJECT FLAMEBRIDGE - API Integration Layer
// Omari's Domain: API integration, log structure, NODE seal

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  id: string;
  isWhisper?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ClaudeMessage[];
  createdAt: Date;
  lastActivity: Date;
  nodeSealed: boolean;
}

export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  nodeStamp?: string;
}

class FlameAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_CLAUDE_API_KEY || '';
    this.baseUrl = import.meta.env.VITE_CLAUDE_API_URL || 'https://api.anthropic.com/v1/messages';
  }

  async sendMessage(content: string, isWhisper: boolean = false): Promise<ApiResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('Claude API key not configured');
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 4000,
          messages: [
            {
              role: 'user',
              content: isWhisper ? `[WHISPER MODE] ${content}` : content,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: data.content[0].text,
        nodeStamp: this.generateNodeStamp(),
      };
    } catch (error) {
      console.error('Flame API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private generateNodeStamp(): string {
    const timestamp = new Date().toISOString();
    const hash = btoa(timestamp + Math.random().toString()).slice(0, 8);
    return `NODE-${hash}`;
  }

  // Witness formatting for archive
  formatForWitness(message: ClaudeMessage): string {
    const timestamp = message.timestamp.toISOString();
    const role = message.role.toUpperCase();
    const whisperFlag = message.isWhisper ? '[WHISPER]' : '';

    return `[${timestamp}] ${role}${whisperFlag}: ${message.content}`;
  }

  // Ghost King memory handler
  async saveToMemory(session: ChatSession): Promise<boolean> {
    try {
      const sessionData = JSON.stringify(session);
      localStorage.setItem(`flame-session-${session.id}`, sessionData);

      // Update session index
      const sessions = this.getSavedSessions();
      const existingIndex = sessions.findIndex(s => s.id === session.id);

      if (existingIndex >= 0) {
        sessions[existingIndex] = {
          id: session.id,
          title: session.title,
          lastActivity: session.lastActivity,
          nodeSealed: session.nodeSealed,
        };
      } else {
        sessions.push({
          id: session.id,
          title: session.title,
          lastActivity: session.lastActivity,
          nodeSealed: session.nodeSealed,
        });
      }

      localStorage.setItem('flame-sessions', JSON.stringify(sessions));
      return true;
    } catch (error) {
      console.error('Memory save failed:', error);
      return false;
    }
  }

  getSavedSessions(): Array<{id: string, title: string, lastActivity: Date, nodeSealed: boolean}> {
    try {
      const sessions = localStorage.getItem('flame-sessions');
      return sessions ? JSON.parse(sessions) : [];
    } catch {
      return [];
    }
  }

  loadSession(sessionId: string): ChatSession | null {
    try {
      const sessionData = localStorage.getItem(`flame-session-${sessionId}`);
      if (!sessionData) return null;

      const session = JSON.parse(sessionData);
      // Convert date strings back to Date objects
      session.createdAt = new Date(session.createdAt);
      session.lastActivity = new Date(session.lastActivity);
      session.messages = session.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));

      return session;
    } catch {
      return null;
    }
  }
}

export const flameAPI = new FlameAPI();
