export interface TerminalOutput {
  id: string;
  command: string;
  output: string;
  exitCode: number;
  timestamp: number;
  duration: number;
  workingDirectory: string;
}

export interface TerminalSession {
  id: string;
  name: string;
  workingDirectory: string;
  environment: Record<string, string>;
  history: TerminalOutput[];
  isActive: boolean;
}

export class TerminalService {
  private static instance: TerminalService;
  private sessions = new Map<string, TerminalSession>();
  private activeSessionId: string | null = null;
  private outputListeners: Array<(output: TerminalOutput) => void> = [];
  private commandHistory: string[] = [];
  
  // Safe commands that can be executed
  private readonly SAFE_COMMANDS = new Set([
    'ls', 'dir', 'pwd', 'echo', 'cat', 'head', 'tail', 'grep',
    'find', 'which', 'whoami', 'date', 'uptime', 'ps',
    'npm', 'yarn', 'pnpm', 'node', 'deno', 'bun',
    'git', 'tsc', 'eslint', 'prettier', 'jest', 'vitest',
    'mkdir', 'touch', 'cp', 'mv', 'chmod', 'chown',
    'curl', 'wget', 'ping', 'nslookup',
  ]);

  // Dangerous commands that should be blocked
  private readonly DANGEROUS_COMMANDS = new Set([
    'rm', 'rmdir', 'del', 'format', 'fdisk', 'dd',
    'sudo', 'su', 'chmod 777', 'chown root',
    'killall', 'pkill', 'kill -9',
    'shutdown', 'reboot', 'halt', 'poweroff',
    'mkfs', 'fsck', 'mount', 'umount',
  ]);

  static getInstance(): TerminalService {
    if (!TerminalService.instance) {
      TerminalService.instance = new TerminalService();
    }
    return TerminalService.instance;
  }

  async initialize(): Promise<void> {
    // Create default terminal session
    const defaultSession = await this.createSession('main', process.cwd ? process.cwd() : '/');
    this.activeSessionId = defaultSession.id;
    
    console.log('🥷 Terminal service initialized');
  }

  async createSession(name: string, workingDirectory: string): Promise<TerminalSession> {
    const session: TerminalSession = {
      id: `terminal-${Date.now()}`,
      name,
      workingDirectory,
      environment: this.getEnvironmentVariables(),
      history: [],
      isActive: false,
    };

    this.sessions.set(session.id, session);
    console.log(`🥷 Created terminal session: ${name}`);
    
    return session;
  }

  async executeCommand(command: string, sessionId?: string): Promise<TerminalOutput> {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error('No active terminal session');
    }

    // Validate command safety
    if (!this.isCommandSafe(command)) {
      throw new Error(`🛡️ Command blocked for security: ${command.split(' ')[0]}`);
    }

    const startTime = Date.now();
    const outputId = `output-${startTime}`;

    try {
      // Add to command history
      this.commandHistory.push(command);
      if (this.commandHistory.length > 100) {
        this.commandHistory.shift();
      }

      let result: { output: string; exitCode: number };

      // Check if we're in a browser environment
      if (typeof window !== 'undefined') {
        // Browser execution - limited capabilities
        result = await this.executeBrowserCommand(command, session);
      } else {
        // Node.js execution - full capabilities
        result = await this.executeNodeCommand(command, session);
      }

      const output: TerminalOutput = {
        id: outputId,
        command,
        output: result.output,
        exitCode: result.exitCode,
        timestamp: startTime,
        duration: Date.now() - startTime,
        workingDirectory: session.workingDirectory,
      };

      // Add to session history
      session.history.push(output);
      
      // Limit history size
      if (session.history.length > 1000) {
        session.history.shift();
      }

      // Notify listeners
      this.outputListeners.forEach(listener => listener(output));

      return output;

    } catch (error) {
      const output: TerminalOutput = {
        id: outputId,
        command,
        output: `Error: ${error.message}`,
        exitCode: 1,
        timestamp: startTime,
        duration: Date.now() - startTime,