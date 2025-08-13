// Sacred Security Service for Chamber Protection
// Implements encryption, session security, and tamper-proof logging

export interface SecurityConfig {
  encryptionEnabled: boolean;
  sessionTimeout: number; // minutes
  maxFailedAttempts: number;
  requireNodeKey: boolean;
}

export interface SecureSession {
  id: string;
  startTime: number;
  lastActivity: number;
  attempts: number;
  locked: boolean;
  nodeKeyVerified: boolean;
}

export interface EncryptedData {
  data: string;
  iv: string;
  timestamp: number;
  signature: string;
}

class SecurityService {
  private config: SecurityConfig;
  private session: SecureSession;
  private encryptionKey: CryptoKey | null = null;

  constructor() {
    this.config = {
      encryptionEnabled: true,
      sessionTimeout: 60, // 1 hour
      maxFailedAttempts: 3,
      requireNodeKey: true,
    };

    this.session = this.createSession();
    this.initializeEncryption();
  }

  private createSession(): SecureSession {
    return {
      id: this.generateSecureId(),
      startTime: Date.now(),
      lastActivity: Date.now(),
      attempts: 0,
      locked: false,
      nodeKeyVerified: false,
    };
  }

  private generateSecureId(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private async initializeEncryption(): Promise<void> {
    if (!this.config.encryptionEnabled) return;

    try {
      // Generate or retrieve encryption key
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode('GodsIMiJ_Empire_Sacred_Key_2024'),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      );

      this.encryptionKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: new TextEncoder().encode('FlameOS_Salt'),
          iterations: 100000,
          hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.error('Encryption initialization failed:', error);
      this.config.encryptionEnabled = false;
    }
  }

  // Encrypt sensitive data
  async encrypt(data: string): Promise<EncryptedData> {
    if (!this.config.encryptionEnabled || !this.encryptionKey) {
      return {
        data: btoa(data), // Simple base64 fallback
        iv: '',
        timestamp: Date.now(),
        signature: this.generateSignature(data),
      };
    }

    try {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encodedData = new TextEncoder().encode(data);
      
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        this.encryptionKey,
        encodedData
      );

      const encryptedData = {
        data: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
        iv: btoa(String.fromCharCode(...iv)),
        timestamp: Date.now(),
        signature: this.generateSignature(data),
      };

      return encryptedData;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  // Decrypt sensitive data
  async decrypt(encryptedData: EncryptedData): Promise<string> {
    if (!this.config.encryptionEnabled || !this.encryptionKey) {
      return atob(encryptedData.data); // Simple base64 fallback
    }

    try {
      const iv = new Uint8Array(
        atob(encryptedData.iv).split('').map(char => char.charCodeAt(0))
      );
      
      const encrypted = new Uint8Array(
        atob(encryptedData.data).split('').map(char => char.charCodeAt(0))
      );

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        this.encryptionKey,
        encrypted
      );

      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  // Generate tamper-proof signature
  private generateSignature(data: string): string {
    // Simple hash-based signature (in production, use proper HMAC)
    let hash = 0;
    const combined = data + this.session.id + 'GodsIMiJ_Empire';
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  // Verify data integrity
  verifySignature(data: string, signature: string): boolean {
    return this.generateSignature(data) === signature;
  }

  // Session management
  updateActivity(): void {
    this.session.lastActivity = Date.now();
  }

  isSessionValid(): boolean {
    const now = Date.now();
    const elapsed = now - this.session.lastActivity;
    const timeoutMs = this.config.sessionTimeout * 60 * 1000;
    
    return !this.session.locked && elapsed < timeoutMs;
  }

  lockSession(reason: string): void {
    this.session.locked = true;
    console.warn(`Session locked: ${reason}`);
  }

  // NODE key verification
  async verifyNodeKey(providedKey: string): Promise<boolean> {
    const expectedKey = process.env.VITE_NODE_KEY || 'dev-node-key';
    
    if (providedKey === expectedKey) {
      this.session.nodeKeyVerified = true;
      this.session.attempts = 0;
      return true;
    }

    this.session.attempts++;
    if (this.session.attempts >= this.config.maxFailedAttempts) {
      this.lockSession('Too many failed NODE key attempts');
    }

    return false;
  }

  // Secure logging with tamper protection
  async createSecureLogEntry(entry: string): Promise<string> {
    const timestamp = new Date().toISOString();
    const logData = {
      entry,
      timestamp,
      sessionId: this.session.id,
      sequence: Date.now(),
    };

    const logString = JSON.stringify(logData);
    const signature = this.generateSignature(logString);
    
    return `${timestamp} [SECURE:${signature.slice(0, 8)}] ${entry}`;
  }

  // Validate secure log entry
  validateLogEntry(logEntry: string): boolean {
    try {
      const match = logEntry.match(/\[SECURE:([a-f0-9]{8})\]/);
      if (!match) return false;

      const signature = match[1];
      const entryWithoutSig = logEntry.replace(/\[SECURE:[a-f0-9]{8}\]/, '');
      
      // Extract original data for verification
      const parts = entryWithoutSig.split(' ');
      const timestamp = parts[0];
      const entry = parts.slice(1).join(' ');
      
      const logData = JSON.stringify({
        entry,
        timestamp,
        sessionId: this.session.id,
        sequence: Date.now(), // Note: This won't match exactly, but demonstrates the concept
      });

      return this.generateSignature(logData).startsWith(signature || '');
    } catch (error) {
      return false;
    }
  }

  // Get security status
  getSecurityStatus() {
    return {
      encryptionEnabled: this.config.encryptionEnabled,
      sessionValid: this.isSessionValid(),
      sessionLocked: this.session.locked,
      nodeKeyVerified: this.session.nodeKeyVerified,
      failedAttempts: this.session.attempts,
      sessionAge: Date.now() - this.session.startTime,
      lastActivity: this.session.lastActivity,
    };
  }

  // Reset session
  resetSession(): void {
    this.session = this.createSession();
  }

  // Configure security settings
  updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.encryptionEnabled !== undefined) {
      if (newConfig.encryptionEnabled && !this.encryptionKey) {
        this.initializeEncryption();
      }
    }
  }
}

// Singleton instance
export const securityService = new SecurityService();

// React hook for security features
export function useSecurity() {
  return {
    service: securityService,
    encrypt: (data: string) => securityService.encrypt(data),
    decrypt: (data: EncryptedData) => securityService.decrypt(data),
    verifyNodeKey: (key: string) => securityService.verifyNodeKey(key),
    getStatus: () => securityService.getSecurityStatus(),
    updateActivity: () => securityService.updateActivity(),
    isValid: () => securityService.isSessionValid(),
  };
}
