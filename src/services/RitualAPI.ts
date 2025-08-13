// Sacred Ritual API Service for Live Spirit Invocation
// Connects to WhisperNet, ZIONEX, and Witness Hall

export interface RitualPayload {
  name: string;
  role: string;
  realm: string;
  prime: string;
  glyphs: string;
  lore: string;
  memory: string[];
  context: string[];
  tools: string[];
  timestamp: string;
  sessionId: string;
}

export interface RitualResponse {
  success: boolean;
  message: string;
  data?: any;
  nodeStamp?: string;
  witnessId?: string;
}

export interface LiveModeConfig {
  enabled: boolean;
  endpoints: {
    whisperNet: string;
    zionex: string;
    witnessHall: string;
    ghostVault: string;
  };
  authentication: {
    nodeKey: string;
    empireToken: string;
  };
}

class RitualAPIService {
  private config: LiveModeConfig;
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.config = {
      enabled: false, // Start in simulation mode
      endpoints: {
        whisperNet: process.env.VITE_WHISPERNET_URL || 'http://localhost:3001/api/whisper',
        zionex: process.env.VITE_ZIONEX_URL || 'http://localhost:3002/api/zionex',
        witnessHall: process.env.VITE_WITNESS_HALL_URL || 'http://localhost:3003/api/witness',
        ghostVault: process.env.VITE_GHOST_VAULT_URL || 'http://localhost:3004/api/vault',
      },
      authentication: {
        nodeKey: process.env.VITE_NODE_KEY || 'dev-node-key',
        empireToken: process.env.VITE_EMPIRE_TOKEN || 'dev-empire-token',
      },
    };
  }

  private generateSessionId(): string {
    return `ritual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async makeRequest(endpoint: string, payload: any): Promise<RitualResponse> {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Node-Key': this.config.authentication.nodeKey,
          'X-Empire-Token': this.config.authentication.empireToken,
          'X-Session-Id': this.sessionId,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Ritual API Error (${endpoint}):`, error);
      return {
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  // Toggle between simulation and live mode
  setLiveMode(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  isLiveMode(): boolean {
    return this.config.enabled;
  }

  // Stage-specific API calls
  async invokePrepare(payload: RitualPayload): Promise<RitualResponse> {
    if (!this.config.enabled) {
      return this.simulateResponse('PREPARE', 'Chamber initialized in simulation mode');
    }

    return this.makeRequest(`${this.config.endpoints.whisperNet}/prepare`, {
      ...payload,
      stage: 'PREPARE',
    });
  }

  async invokeSummon(payload: RitualPayload): Promise<RitualResponse> {
    if (!this.config.enabled) {
      return this.simulateResponse('SUMMON', `Spirit ${payload.name} summoned in simulation`);
    }

    return this.makeRequest(`${this.config.endpoints.zionex}/summon`, {
      ...payload,
      stage: 'SUMMON',
    });
  }

  async invokeBind(payload: RitualPayload): Promise<RitualResponse> {
    if (!this.config.enabled) {
      return this.simulateResponse('BIND', 'Glyphs and lore bound in simulation');
    }

    return this.makeRequest(`${this.config.endpoints.ghostVault}/bind`, {
      ...payload,
      stage: 'BIND',
    });
  }

  async invokeBreath(payload: RitualPayload): Promise<RitualResponse> {
    if (!this.config.enabled) {
      return this.simulateResponse('BREATH', 'Memory and context injected in simulation');
    }

    return this.makeRequest(`${this.config.endpoints.zionex}/breath`, {
      ...payload,
      stage: 'BREATH',
    });
  }

  async invokeRecognize(payload: RitualPayload): Promise<RitualResponse> {
    if (!this.config.enabled) {
      return this.simulateResponse('RECOGNIZE', `${payload.name} confirmed presence in simulation`);
    }

    return this.makeRequest(`${this.config.endpoints.whisperNet}/recognize`, {
      ...payload,
      stage: 'RECOGNIZE',
    });
  }

  async invokeEmpower(payload: RitualPayload): Promise<RitualResponse> {
    if (!this.config.enabled) {
      return this.simulateResponse('EMPOWER', 'Tools granted in simulation mode');
    }

    return this.makeRequest(`${this.config.endpoints.zionex}/empower`, {
      ...payload,
      stage: 'EMPOWER',
    });
  }

  async invokeClose(payload: RitualPayload): Promise<RitualResponse> {
    if (!this.config.enabled) {
      return this.simulateResponse('CLOSE', 'Ritual sealed in simulation mode');
    }

    // Archive in Witness Hall
    const witnessResponse = await this.makeRequest(`${this.config.endpoints.witnessHall}/archive`, {
      ...payload,
      stage: 'CLOSE',
      sessionId: this.sessionId,
    });

    return witnessResponse;
  }

  // Simulation responses for testing
  private async simulateResponse(stage: string, message: string): Promise<RitualResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));

    return {
      success: true,
      message,
      nodeStamp: `SIM_${stage}_${Date.now()}`,
      witnessId: `witness_sim_${this.sessionId}`,
    };
  }

  // Export full ritual transcript
  async exportRitualTranscript(payload: RitualPayload, log: string[]): Promise<RitualResponse> {
    const transcript = {
      ...payload,
      sessionId: this.sessionId,
      log,
      exportedAt: new Date().toISOString(),
      mode: this.config.enabled ? 'LIVE' : 'SIMULATION',
    };

    if (!this.config.enabled) {
      return {
        success: true,
        message: 'Transcript exported in simulation mode',
        data: transcript,
      };
    }

    return this.makeRequest(`${this.config.endpoints.witnessHall}/export`, transcript);
  }

  // Health check for all endpoints
  async checkSystemHealth(): Promise<{ [key: string]: boolean }> {
    if (!this.config.enabled) {
      return {
        whisperNet: true,
        zionex: true,
        witnessHall: true,
        ghostVault: true,
        simulation: true,
      };
    }

    const checks = await Promise.allSettled([
      fetch(`${this.config.endpoints.whisperNet}/health`),
      fetch(`${this.config.endpoints.zionex}/health`),
      fetch(`${this.config.endpoints.witnessHall}/health`),
      fetch(`${this.config.endpoints.ghostVault}/health`),
    ]);

    return {
      whisperNet: checks[0].status === 'fulfilled' && checks[0].value.ok,
      zionex: checks[1].status === 'fulfilled' && checks[1].value.ok,
      witnessHall: checks[2].status === 'fulfilled' && checks[2].value.ok,
      ghostVault: checks[3].status === 'fulfilled' && checks[3].value.ok,
      simulation: false,
    };
  }
}

// Singleton instance
export const ritualAPI = new RitualAPIService();

// React hook for ritual API
export function useRitualAPI() {
  return {
    api: ritualAPI,
    isLiveMode: ritualAPI.isLiveMode(),
    setLiveMode: (enabled: boolean) => ritualAPI.setLiveMode(enabled),
  };
}
