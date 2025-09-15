import { useState, useEffect, useCallback, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';

export interface TerminalSession {
  id: string;
  name: string;
  cwd: string;
  terminal: Terminal;
  fitAddon: FitAddon;
  isActive: boolean;
  pid?: number;
  status: 'running' | 'exited' | 'error';
  exitCode?: number;
}

export interface TerminalState {
  sessions: TerminalSession[];
  activeSessionId: string | null;
  isInitialized: boolean;
}

export interface TerminalActions {
  createSession: (name?: string, cwd?: string) => Promise<string>;
  closeSession: (sessionId: string) => Promise<void>;
  switchToSession: (sessionId: string) => void;
  renameSession: (sessionId: string, newName: string) => void;
  executeCommand: (sessionId: string, command: string) => Promise<void>;
  sendInput: (sessionId: string, input: string) => Promise<void>;
  clear: (sessionId: string) => void;
  resize: (sessionId: string, cols: number, rows: number) => Promise<void>;
  attachToElement: (sessionId: string, element: HTMLElement) => void;
  detachFromElement: (sessionId: string) => void;
  getSessionOutput: (sessionId: string, lines?: number) => string[];
}

export interface UseTerminalOptions {
  onSessionCreate?: (session: TerminalSession) => void;
  onSessionClose?: (sessionId: string) => void;
  onSessionSwitch?: (sessionId: string) => void;
  onOutput?: (sessionId: string, data: string) => void;
  onProcessExit?: (sessionId: string, exitCode: number) => void;
  defaultCwd?: string;
  theme?: {
    background?: string;
    foreground?: string;
    cursor?: string;
    selection?: string;
  };
  fontSize?: number;
  fontFamily?: string;
  maxSessions?: number;
}

export const useTerminal = (
  options: UseTerminalOptions = {}
): [TerminalState, TerminalActions] => {
  const [state, setState] = useState<TerminalState>({
    sessions: [],
    activeSessionId: null,
    isInitialized: false
  });

  const sessionsRef = useRef<Map<string, TerminalSession>>(new Map());
  const outputBufferRef = useRef<Map<string, string[]>>(new Map());

  const {
    onSessionCreate,
    onSessionClose,
    onSessionSwitch,
    onOutput,
    onProcessExit,
    defaultCwd,
    theme = {
      background: '#1e1e1e',
      foreground: '#ffffff',
      cursor: '#ffffff',
      selection: '#264f78'
    },
    fontSize = 14,
    fontFamily = 'Monaco, Menlo, "Ubuntu Mono", monospace',
    maxSessions = 10
  } = options;

  // Initialize terminal system
  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize terminal backend
        await window.electronAPI.initializeTerminal?.();
        setState(prev => ({ ...prev, isInitialized: true }));
      } catch (error) {
        console.error('Failed to initialize terminal:', error);
      }
    };

    initialize();
  }, []);

  // Create new terminal session
  const createSession = useCallback(async (
    name?: string, 
    cwd = defaultCwd || process.cwd?.() || '/'
  ): Promise<string> => {
    if (state.sessions.length >= maxSessions) {
      throw new Error(`Maximum number of sessions (${maxSessions}) reached`);
    }

    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const sessionName = name || `Terminal ${state.sessions.length + 1}`;

    try {
      // Create xterm instance
      const terminal = new Terminal({
        theme,
        fontSize,
        fontFamily,
        cursorBlink: true,
        allowTransparency: true,
        scrollback: 1000
      });

      // Add addons
      const fitAddon = new FitAddon();
      const webLinksAddon = new WebLinksAddon();
      
      terminal.loadAddon(fitAddon);
      terminal.loadAddon(webLinksAddon);

      // Initialize output buffer
      outputBufferRef.current.set(sessionId, []);

      // Handle terminal output
      terminal.onData((data) => {
        // Send input to backend
        window.electronAPI.sendTerminalInput?.(sessionId, data);
      });

      // Create session object
      const session: TerminalSession = {
        id: sessionId,
        name: sessionName,
        cwd,
        terminal,
        fitAddon,
        isActive: false,
        status: 'running'
      };

      // Start backend session
      const result = await window.electronAPI.createTerminalSession?.(sessionId, cwd);
      if (result?.pid) {
        session.pid = result.pid;
      }

      // Store session
      sessionsRef.current.set(sessionId, session);

      // Update state
      setState(prev => {
        const newSessions = [...prev.sessions, session];
        return {
          ...prev,
          sessions: newSessions,
          activeSessionId: prev.activeSessionId || sessionId
        };
      });

      // Set up backend event listeners for this session
      setupSessionListeners(sessionId);

      onSessionCreate?.(session);
      return sessionId;

    } catch (error) {
      console.error('Error creating terminal session:', error);
      throw error;
    }
  }, [state.sessions.length, maxSessions, defaultCwd, theme, fontSize, fontFamily, onSessionCreate]);

  // Set up event listeners for a session
  const setupSessionListeners = useCallback((sessionId: string) => {
    // Listen for output from backend
    window.electronAPI.onTerminalOutput?.(sessionId, (data: string) => {
      const session = sessionsRef.current.get(sessionId);
      if (session) {
        session.terminal.write(data);
        
        // Update output buffer
        const buffer = outputBufferRef.current.get(sessionId) || [];
        buffer.push(data);
        // Keep only last 1000 lines
        if (buffer.length > 1000) {
          buffer.splice(0, buffer.length - 1000);
        }
        outputBufferRef.current.set(sessionId, buffer);

        onOutput?.(sessionId, data);
      }
    });

    // Listen for process exit
    window.electronAPI.onTerminalExit?.(sessionId, (exitCode: number) => {
      const session = sessionsRef.current.get(sessionId);
      if (session) {
        session.status = 'exited';
        session.exitCode = exitCode;
        
        setState(prev => ({
          ...prev,
          sessions: prev.sessions.map(s => 
            s.id === sessionId ? { ...s, status: 'exited', exitCode } : s
          )
        }));

        onProcessExit?.(sessionId, exitCode);
      }
    });
  }, [onOutput, onProcessExit]);

  // Close terminal session
  const closeSession = useCallback(async (sessionId: string) => {
    const session = sessionsRef.current.get(sessionId);
    if (!session) return;

    try {
      // Close backend session
      await window.electronAPI.closeTerminalSession?.(sessionId);

      // Dispose terminal
      session.terminal.dispose();

      // Remove from maps
      sessionsRef.current.delete(sessionId);
      outputBufferRef.current.delete(sessionId);

      // Update state
      setState(prev => {
        const newSessions = prev.sessions.filter(s => s.id !== sessionId);
        const newActiveId = prev.activeSessionId === sessionId 
          ? (newSessions.length > 0 ? newSessions[0].id : null)
          : prev.activeSessionId;

        return {
          ...prev,
          sessions: newSessions,
          activeSessionId: newActiveId
        };
      });

      onSessionClose?.(sessionId);

    } catch (error) {
      console.error('Error closing terminal session:', error);
      throw error;
    }
  }, [onSessionClose]);

  // Switch to session
  const switchToSession = useCallback((sessionId: string) => {
    const session = sessionsRef.current.get(sessionId);
    if (!session) return;

    // Update active status
    setState(prev => ({
      ...prev,
      activeSessionId: sessionId,
      sessions: prev.sessions.map(s => ({
        ...s,
        isActive: s.id === sessionId
      }))
    }));

    onSessionSwitch?.(sessionId);
  }, [onSessionSwitch]);

  // Rename session
  const renameSession = useCallback((sessionId: string, newName: string) => {
    setState(prev => ({
      ...prev,
      sessions: prev.sessions.map(s => 
        s.id === sessionId ? { ...s, name: newName } : s
      )
    }));

    const session = sessionsRef.current.get(sessionId);
    if (session) {
      session.name = newName;
    }
  }, []);

  // Execute command
  const executeCommand = useCallback(async (sessionId: string, command: string) => {
    try {
      await window.electronAPI.executeTerminalCommand?.(sessionId, command);
    } catch (error) {
      console.error('Error executing command:', error);
      throw error;
    }
  }, []);

  // Send input
  const sendInput = useCallback(async (sessionId: string, input: string) => {
    try {
      await window.electronAPI.sendTerminalInput?.(sessionId, input);
    } catch (error) {
      console.error('Error sending input:', error);
      throw error;
    }
  }, []);

  // Clear terminal
  const clear = useCallback((sessionId: string) => {
    const session = sessionsRef.current.get(sessionId);
    if (session) {
      session.terminal.clear();
      outputBufferRef.current.set(sessionId, []);
    }
  }, []);

  // Resize terminal
  const resize = useCallback(async (sessionId: string, cols: number, rows: number) => {
    const session = sessionsRef.current.get(sessionId);
    if (session) {
      session.terminal.resize(cols, rows);
      try {
        await window.electronAPI.resizeTerminal?.(sessionId, cols, rows);
      } catch (error) {
        console.error('Error resizing terminal:', error);
      }
    }
  }, []);

  // Attach terminal to DOM element
  const attachToElement = useCallback((sessionId: string, element: HTMLElement) => {
    const session = sessionsRef.current.get(sessionId);
    if (session) {
      session.terminal.open(element);
      session.fitAddon.fit();
    }
  }, []);

  // Detach terminal from DOM
  const detachFromElement = useCallback((sessionId: string) => {
    const session = sessionsRef.current.get(sessionId);
    if (session && session.terminal.element) {
      session.terminal.element.remove();
    }
  }, []);

  // Get session output
  const getSessionOutput = useCallback((sessionId: string, lines?: number): string[] => {
    const buffer = outputBufferRef.current.get(sessionId) || [];
    return lines ? buffer.slice(-lines) : buffer;
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      sessionsRef.current.forEach(session => {
        if (session.terminal.element) {
          session.fitAddon.fit();
        }
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      sessionsRef.current.forEach(session => {
        session.terminal.dispose();
      });
      sessionsRef.current.clear();
      outputBufferRef.current.clear();
    };
  }, []);

  const actions: TerminalActions = {
    createSession,
    closeSession,
    switchToSession,
    renameSession,
    executeCommand,
    sendInput,
    clear,
    resize,
    attachToElement,
    detachFromElement,
    getSessionOutput
  };

  return [state, actions];
};