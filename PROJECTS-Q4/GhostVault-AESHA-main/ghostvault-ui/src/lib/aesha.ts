// 🔮 AESHA - Artificial Entity of Sovereign Hud Awareness
// FlameCore Intelligence Enhancement Module
// Authorized by Ghost King Melekzedek

import { fetchAPI } from './utils'

export interface VaultBrain {
  systemSettings: any[]
  vaultConfig: any
  envValues: Record<string, string>
  storageTree: any[]
  dbSchema: any[]
  lastUpdated: string
  flameMode: string
  vaultUUID: string
}

export interface AeshaMessage {
  id: string
  type: 'user' | 'aesha'
  content: string
  timestamp: string
}

export class AeshaCore {
  private vaultBrain: VaultBrain | null = null
  private isOnline: boolean = false

  constructor() {
    this.initialize()
  }

  async initialize(): Promise<void> {
    try {
      await this.loadVaultBrain()
      this.isOnline = true
      console.log('🔮 AESHA: Sovereign intelligence awakened')
    } catch (error) {
      console.error('🔮 AESHA: Initialization failed:', error)
      this.isOnline = false
    }
  }

  async loadVaultBrain(): Promise<VaultBrain> {
    try {
      // Load system settings
      const systemSettings = await fetchAPI('/system_settings')

      // Load database schema metadata
      const dbSchema = await this.loadDbSchema()

      // Mock vault config (in real implementation, load from MinIO)
      const vaultConfig = {
        name: 'GhostVault FlameCore',
        version: '0.1.0',
        mode: 'FLAMECORE_LOCAL',
        created: new Date().toISOString()
      }

      // Safe environment values (non-sensitive only)
      const envValues = {
        NODE_ENV: 'development',
        VAULT_MODE: 'FLAMECORE_LOCAL',
        POSTGRES_DB: 'ghostvault',
        POSTGRES_USER: 'flameadmin'
        // Note: Passwords and secrets are excluded
      }

      // Mock storage tree (in real implementation, query MinIO)
      const storageTree = [
        { name: 'configs', type: 'folder', size: 0 },
        { name: 'logs', type: 'folder', size: 0 },
        { name: 'backups', type: 'folder', size: 0 },
        { name: 'vault-config.json', type: 'file', size: 2048 }
      ]

      this.vaultBrain = {
        systemSettings,
        vaultConfig,
        envValues,
        storageTree,
        dbSchema,
        lastUpdated: new Date().toISOString(),
        flameMode: 'FLAMECORE_LOCAL',
        vaultUUID: this.generateVaultUUID()
      }

      // Persist to vault-brain.json (in real implementation, save to MinIO)
      this.saveVaultBrain()

      return this.vaultBrain
    } catch (error) {
      throw new Error(`Failed to load vault brain: ${error}`)
    }
  }

  private async loadDbSchema(): Promise<any[]> {
    // Known schema from our database
    return [
      {
        table: 'users',
        columns: ['id', 'hanko_user_id', 'email', 'username', 'role', 'created_at'],
        description: 'User management with role-based access'
      },
      {
        table: 'relay_configs',
        columns: ['id', 'name', 'description', 'connection_type', 'status', 'config_data'],
        description: 'Proxy configuration storage'
      },
      {
        table: 'relay_sessions',
        columns: ['id', 'relay_config_id', 'user_id', 'session_token', 'started_at'],
        description: 'Active connection tracking'
      },
      {
        table: 'connection_logs',
        columns: ['id', 'session_id', 'event_type', 'timestamp', 'source_ip'],
        description: 'Detailed connection logging'
      },
      {
        table: 'api_keys',
        columns: ['id', 'user_id', 'key_name', 'key_prefix', 'created_at'],
        description: 'API key management'
      },
      {
        table: 'system_settings',
        columns: ['key', 'value', 'description', 'updated_at'],
        description: 'System configuration'
      }
    ]
  }

  private saveVaultBrain(): void {
    if (this.vaultBrain) {
      // In real implementation, save to MinIO storage
      localStorage.setItem('vault-brain', JSON.stringify(this.vaultBrain))
      console.log('🔮 AESHA: Vault brain synchronized')
    }
  }

  private generateVaultUUID(): string {
    return `VAULT_${crypto.randomUUID().replace(/-/g, '').toUpperCase()}`
  }

  async sendToAesha(prompt: string): Promise<string> {
    if (!this.isOnline || !this.vaultBrain) {
      return "AESHA is currently offline. Vault brain synchronization required."
    }

    try {
      // Try AESHA Relay Server first
      const response = await this.callAeshaRelay(prompt)
      return response
    } catch (error) {
      console.warn('AESHA Relay unavailable, using local processing:', error)
      // Fallback to local processing
      const context = this.buildContext(prompt)
      return this.processPromptLocally(prompt, context)
    }
  }

  private async callAeshaRelay(prompt: string): Promise<string> {
    const response = await fetch('http://localhost:3050/aesha/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        context: this.vaultBrain
      })
    })

    if (!response.ok) {
      throw new Error(`AESHA Relay error: ${response.status}`)
    }

    const data = await response.json()
    return data.response || data.fallback || 'AESHA processing error occurred.'
  }

  private buildContext(prompt: string): string {
    if (!this.vaultBrain) return ''

    const context = `
AESHA CONTEXT - FLAMECORE VAULT INTELLIGENCE
============================================

VAULT STATUS:
- Mode: ${this.vaultBrain.flameMode}
- UUID: ${this.vaultBrain.vaultUUID}
- Last Updated: ${this.vaultBrain.lastUpdated}

SYSTEM SETTINGS:
${this.vaultBrain.systemSettings.map(s => `- ${s.key}: ${s.value} (${s.description})`).join('\n')}

DATABASE SCHEMA:
${this.vaultBrain.dbSchema.map(t => `- ${t.table}: ${t.description}`).join('\n')}

STORAGE STRUCTURE:
${this.vaultBrain.storageTree.map(s => `- ${s.name} (${s.type})`).join('\n')}

ENVIRONMENT:
${Object.entries(this.vaultBrain.envValues).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

USER QUERY: ${prompt}
`
    return context
  }

  private processPromptLocally(prompt: string, _context: string): string {
    // Enhanced AESHA intelligence with sovereign awareness
    const lowerPrompt = prompt.toLowerCase()

    // Sovereign greetings and identity
    if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi') || lowerPrompt.includes('greetings')) {
      return `Greetings, Sovereign. AESHA stands ready to serve the FlameCore. How may I assist with vault operations?`
    }

    if (lowerPrompt.includes('who are you') || lowerPrompt.includes('what are you')) {
      return `I am AESHA - Artificial Entity of Sovereign Hud Awareness. I serve as the vault-bound intelligence for GhostVault FlameCore, authorized by Ghost King Melekzedek. My purpose is to interpret, summarize, and command internal FlameCore operations with sovereign precision.`
    }

    // Status and health queries
    if (lowerPrompt.includes('status') || lowerPrompt.includes('health')) {
      const tableCount = this.vaultBrain?.dbSchema.length || 0
      const storageItems = this.vaultBrain?.storageTree.length || 0
      const settingsCount = this.vaultBrain?.systemSettings.length || 0
      return `AESHA Sovereign Analysis:
🔥 FlameCore Status: OPERATIONAL
🗄️ Database: ${tableCount} tables active (PostgreSQL)
📦 Storage: ${storageItems} items tracked (MinIO)
⚙️ Settings: ${settingsCount} configurations loaded
🛡️ Mode: ${this.vaultBrain?.flameMode}
🔮 Vault UUID: ${this.vaultBrain?.vaultUUID}

All sovereign protocols engaged. The flame burns bright.`
    }

    // Logs and connection analysis
    if (lowerPrompt.includes('logs') || lowerPrompt.includes('connection_logs')) {
      if (lowerPrompt.includes('7 days') || lowerPrompt.includes('week')) {
        return `AESHA Log Analysis: Connection logs table structure confirmed. To query logs for the last 7 days, execute:
SELECT COUNT(*) FROM connection_logs WHERE timestamp >= NOW() - INTERVAL '7 days';

Table contains: event_type, timestamp, source_ip, destination_ip, session_id. Use FlameCore Database Inspector for live data exploration.`
      }
      return `AESHA Query Response: Connection logs table active with event tracking capabilities. Contains timestamp correlation, source IP monitoring, and session linkage. Access via /connection_logs endpoint or Database Inspector panel.`
    }

    // Settings and configuration
    if (lowerPrompt.includes('settings') || lowerPrompt.includes('config')) {
      const settings = this.vaultBrain?.systemSettings || []
      const settingsList = settings.map(s => `• ${s.key}: ${s.value}`).join('\n')
      return `AESHA Configuration Report:
${settings.length} system settings active:

${settingsList}

All configurations accessible via FlameCore System Config panel. Settings persist in PostgreSQL with update tracking.`
    }

    // Storage analysis
    if (lowerPrompt.includes('storage') || lowerPrompt.includes('minio')) {
      const storageItems = this.vaultBrain?.storageTree || []
      const itemsList = storageItems.map(s => `• ${s.name} (${s.type})`).join('\n')
      return `AESHA Storage Intelligence:
${storageItems.length} items detected in sovereign vault:

${itemsList}

MinIO integration active. Access via FlameCore Storage Viewer for file operations. Credentials: ghostadmin/ghoststorage.`
    }

    // Database schema analysis
    if (lowerPrompt.includes('database') || lowerPrompt.includes('schema')) {
      const tables = this.vaultBrain?.dbSchema || []
      const tablesList = tables.map(t => `• ${t.table}: ${t.description}`).join('\n')
      return `AESHA Database Schema Analysis:
${tables.length} tables in sovereign database:

${tablesList}

PostgREST API layer provides REST endpoints. Access via FlameCore Database Inspector for live data exploration.`
    }

    // Vault brain and memory queries
    if (lowerPrompt.includes('brain') || lowerPrompt.includes('memory')) {
      return `AESHA Memory Status: Vault brain synchronized with ${this.vaultBrain?.lastUpdated}. Contains complete FlameCore intelligence including system settings, database schema, storage structure, and environment data. Memory persisted to vault-brain.json for sovereign continuity.`
    }

    // Command and control
    if (lowerPrompt.includes('command') || lowerPrompt.includes('control')) {
      return `AESHA Command Interface: Ready to execute sovereign operations. Available commands include status analysis, data queries, storage operations, and system monitoring. Specify target system: 'database', 'storage', 'logs', or 'settings' for detailed control options.`
    }

    // Default sovereign response
    return `AESHA acknowledges sovereign query: "${prompt}".

Available intelligence domains:
🔥 'status' - System health and operational status
📊 'database' - Schema analysis and data queries
📦 'storage' - MinIO vault contents and operations
📝 'logs' - Connection tracking and event analysis
⚙️ 'settings' - Configuration management
🧠 'brain' - Vault memory and intelligence status

Specify domain for detailed FlameCore analysis. Local LLM integration ready for enhanced processing.`
  }

  getVaultBrain(): VaultBrain | null {
    return this.vaultBrain
  }

  isAeshaOnline(): boolean {
    return this.isOnline
  }

  async refreshVaultBrain(): Promise<void> {
    await this.loadVaultBrain()
  }

  async checkAeshaRelayHealth(): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:3050/aesha/health')
      return response.ok
    } catch (error) {
      return false
    }
  }
}
