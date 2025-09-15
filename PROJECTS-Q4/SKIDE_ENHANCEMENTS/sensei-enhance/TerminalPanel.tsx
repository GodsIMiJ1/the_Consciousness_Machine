import React, { useState, useEffect, useRef } from 'react';
import { TerminalService, TerminalOutput, TerminalSession } from '../../services/TerminalService';

export interface TerminalPanelProps {
  height?: string;
  onCommandExecute?: (command: string, output: TerminalOutput) => void;
}

export const TerminalPanel: React.FC<TerminalPanelProps> = ({
  height = '300px',
  onCommandExecute,
}) => {
  const [sessions, setSessions] = useState<TerminalSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isExecuting, setIsExecuting] = useState(false);
  const [output, setOutput] = useState<TerminalOutput[]>([]);
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalService = TerminalService.getInstance();

  useEffect(() => {
    initializeTerminal();
    
    // Listen for terminal output
    const unsubscribe = terminalService.onOutput((output) => {
      setOutput(prev => [...prev, output]);
      onCommandExecute?.(output.command, output);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new output is added
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  const initializeTerminal = async () => {
    try {
      await terminalService.initialize();
      const allSessions = terminalService.getAllSessions();
      setSessions(allSessions);
      
      const activeSession = terminalService.getActiveSession();
      if (activeSession) {
        setActiveSessionId(activeSession.id);
        setOutput(activeSession.history);
      }
    } catch (error) {
      console.error('Failed to initialize terminal:', error);
    }
  };

  const executeCommand = async () => {
    if (!currentCommand.trim() || isExecuting) return;

    setIsExecuting(true);
    
    try {
      // Add to command history
      const newHistory = [...commandHistory, currentCommand];
      setCommandHistory(newHistory);
      setHistoryIndex(-1);

      // Execute the command
      const result = await terminalService.executeCommand(currentCommand, activeSessionId || undefined);
      
      // Clear input
      setCurrentCommand('');
      
    } catch (error) {
      console.error('Command execution failed:', error);
      
      // Add error to output
      const errorOutput: TerminalOutput = {
        id: `error-${Date.now()}`,
        command: currentCommand,
        output: `Error: ${error.message}`,
        exitCode: 1,
        timestamp: Date.now(),
        duration: 0,
        workingDirectory: sessions.find(s => s.id === activeSessionId)?.workingDirectory || '/',
      };
      
      setOutput(prev => [...prev, errorOutput]);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        executeCommand();
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        navigateHistory('up');
        break;
        
      case 'ArrowDown':
        e.preventDefault();
        navigateHistory('down');
        break;
        
      case 'Tab':
        e.preventDefault();
        autocompleteCommand();
        break;
        
      case 'c':
        if (e.ctrlKey) {
          e.preventDefault();
          cancelCommand();
        }
        break;
        
      case 'l':
        if (e.ctrlKey) {
          e.preventDefault();
          clearTerminal();
        }
        break;
    }
  };

  const navigateHistory = (direction: 'up' | 'down') => {
    if (commandHistory.length === 0) return;

    let newIndex = historyIndex;
    
    if (direction === 'up') {
      newIndex = historyIndex >= commandHistory.length - 1 ? commandHistory.length - 1 : historyIndex + 1;
    } else {
      newIndex = historyIndex <= 0 ? -1 : historyIndex - 1;
    }
    
    setHistoryIndex(newIndex);
    setCurrentCommand(newIndex === -1 ? '' : commandHistory[commandHistory.length - 1 - newIndex]);
  };

  const autocompleteCommand = () => {
    // Simple autocomplete for common commands
    const commonCommands = [
      'ls', 'cd', 'pwd', 'mkdir', 'touch', 'cat', 'echo',
      'npm install', 'npm run dev', 'npm run build', 'npm test',
      'git status', 'git add', 'git commit', 'git push', 'git pull',
      'pnpm install', 'pnpm dev', 'pnpm build', 'pnpm test',
    ];

    const matches = commonCommands.filter(cmd => 
      cmd.startsWith(currentCommand.toLowerCase())
    );

    if (matches.length === 1) {
      setCurrentCommand(matches[0]);
    } else if (matches.length > 1) {
      // Show matches in terminal
      const matchesOutput: TerminalOutput = {
        id: `autocomplete-${Date.now()}`,
        command: 'autocomplete',
        output: `Matches: ${matches.join(', ')}`,
        exitCode: 0,
        timestamp: Date.now(),
        duration: 0,
        workingDirectory: sessions.find(s => s.id === activeSessionId)?.workingDirectory || '/',
      };
      setOutput(prev => [...prev, matchesOutput]);
    }
  };

  const cancelCommand = () => {
    setCurrentCommand('');
    setIsExecuting(false);
  };

  const clearTerminal = () => {
    setOutput([]);
    terminalService.clearHistory(activeSessionId || undefined);
  };

  const createNewSession = async () => {
    const sessionName = prompt('🥷 Enter session name:') || `Session ${sessions.length + 1}`;
    const workingDir = prompt('🥷 Enter working directory:') || '/';
    
    try {
      const newSession = await terminalService.createSession(sessionName, workingDir);
      setSessions(prev => [...prev, newSession]);
      setActiveSessionId(newSession.id);
      setOutput([]);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const switchSession = (sessionId: string) => {
    const success = terminalService.switchSession(sessionId);
    if (success) {
      setActiveSessionId(sessionId);
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        setOutput(session.history);
      }
    }
  };

  const closeSession = (sessionId: string) => {
    const success = terminalService.closeSession(sessionId);
    if (success) {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      if (sessionId === activeSessionId) {
        const remainingSessions = sessions.filter(s => s.id !== sessionId);
        if (remainingSessions.length > 0) {
          switchSession(remainingSessions[0].id);
        } else {
          setActiveSessionId(null);
          setOutput([]);
        }
      }
    }
  };

  const getPrompt = () => {
    const activeSession = sessions.find(s => s.id === activeSessionId);
    const workingDir = activeSession?.workingDirectory || '/';
    const shortDir = workingDir.split('/').pop() || '/';
    return `ghost-king@skide:${shortDir}import React, { useState, useEffect, useRef } from 'react';
import { TerminalService, TerminalOutput, TerminalSession } from '../../services/TerminalService';

export interface TerminalPanelProps {
  height?: string;
  onCommandExecute?: (command: string, output: TerminalOutput) => void;
}

export const TerminalPanel: React.FC<TerminalPanelProps> = ({
  height = '300px',
  onCommandExecute,
}) => {
  const [sessions, setSessions] = useState<TerminalSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isExecuting, setIsExecuting] = useState(false);
  const [output, setOutput] = useState<TerminalOutput[]>([]);
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalService = TerminalService.getInstance();

  useEffect(() => {
    initializeTerminal();
    
    // Listen for terminal output
    const unsubscribe = terminalService.onOutput((output) => {
      setOutput(prev => [...prev, output]);
      onCommandExecute?.(output.command, output);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new output is added
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  const initializeTerminal = async () => {
    try {
      await terminalService.initialize();
      const allSessions = terminalService.getAllSessions();
      setSessions(allSessions);
      
      const activeSession = terminalService.getActiveSession();
      if (activeSession) {
        setActiveSessionId(activeSession.id);
        setOutput(activeSession.history);
      }
    } catch (error) {
      console.error('Failed to initialize terminal:', error);
    }
  };

  const executeCommand = async () => {
    if (!currentCommand.trim() || isExecuting) return;

    setIsExecuting(true);
    
    try {
      // Add to command history
      const newHistory = [...commandHistory, currentCommand];
      setCommandHistory(newHistory);
      setHistoryIndex(-1);

      // Execute the command
      const result = await terminalService.executeCommand(currentCommand, activeSessionId || undefined);
      
      // Clear input
      setCurrentCommand('');
      
    } catch (error) {
      console.error('Command execution failed:', error);
      
      // Add error to output
      const errorOutput: TerminalOutput = {
        id: `error-${Date.now()}`,
        command: currentCommand,
        output: `Error: ${error.message}`,
        exitCode: 1,
        timestamp: Date.now(),
        duration: 0,
        workingDirectory: sessions.find(s => s.id === activeSessionId)?.workingDirectory || '/',
      };
      
      setOutput(prev => [...prev, errorOutput]);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        executeCommand();
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        navigateHistory('up');
        break;
        
      case 'ArrowDown':
        e.preventDefault();
        navigateHistory('down');
        break;
        
      case 'Tab':
        e.preventDefault();
        autocompleteCommand();
        break;
        
      case 'c':
        if (e.ctrlKey) {
          e.preventDefault();
          cancelCommand();
        }
        break;
        
      case 'l':
        if (e.ctrlKey) {
          e.preventDefault();
          clearTerminal();
        }
        break;
    }
  };

  const navigateHistory = (direction: 'up' | 'down') => {
    if (commandHistory.length === 0) return;

    let newIndex = historyIndex;
    
    if (direction === 'up') {
      newIndex = historyIndex >= commandHistory.length - 1 ? commandHistory.length - 1 : historyIndex + 1;
    } else {
      newIndex = historyIndex <= 0 ? -1 : historyIndex - 1;
    }
    
    setHistoryIndex(newIndex);
    setCurrentCommand(newIndex === -1 ? '' : commandHistory[commandHistory.length - 1 - newIndex]);
  };

  const autocompleteCommand = () => {
    // Simple autocomplete for common commands
    const commonCommands = [
      'ls', 'cd', 'pwd', 'mkdir', 'touch', 'cat', 'echo',
      'npm install', 'npm run dev', 'npm run build', 'npm test',
      'git status', 'git add', 'git commit', 'git push', 'git pull',
      'pnpm install', 'pnpm dev', 'pnpm build', 'pnpm test',
    ];

    const matches = commonCommands.filter(cmd => 
      cmd.startsWith(currentCommand.toLowerCase())
    );

    if (matches.length === 1) {
      setCurrentCommand(matches[0]);
    } else if (matches.length > 1) {
      // Show matches in terminal
      const matchesOutput: TerminalOutput = {
        id: `autocomplete-${Date.now()}`,
        command: 'autocomplete',
        output: `Matches: ${matches.join(', ')}`,
        exitCode: 0,
        timestamp: Date.now(),
        duration: 0,
;
  };

  const formatOutput = (output: TerminalOutput) => {
    const timestamp = new Date(output.timestamp).toLocaleTimeString();
    const exitCodeColor = output.exitCode === 0 ? '#4ade80' : '#ef4444';
    
    return (
      <div key={output.id} className="terminal-output-block">
        <div className="command-line">
          <span className="prompt">{getPrompt()}</span>
          <span className="command">{output.command}</span>
          <span className="metadata">
            [{timestamp}] [{output.duration}ms] [exit: <span style={{ color: exitCodeColor }}>{output.exitCode}</span>]
          </span>
        </div>
        <pre className="output-content">{output.output}</pre>
      </div>
    );
  };

  const executeKodiiSuggestion = (command: string, description: string) => {
    setCurrentCommand(command);
    // Auto-execute after a brief delay to show the command
    setTimeout(() => {
      executeCommand();
    }, 1000);
  };

  // Listen for Kodii terminal suggestions
  useEffect(() => {
    const handleKodiiTerminalRequest = (event: CustomEvent) => {
      const { command, description } = event.detail;
      executeKodiiSuggestion(command, description);
    };

    window.addEventListener('kodii-terminal-request', handleKodiiTerminalRequest as EventListener);
    
    return () => {
      window.removeEventListener('kodii-terminal-request', handleKodiiTerminalRequest as EventListener);
    };
  }, []);

  return (
    <div className="terminal-panel" style={{ height }}>
      {/* Terminal Header */}
      <div className="terminal-header">
        <div className="session-tabs">
          {sessions.map(session => (
            <div
              key={session.id}
              className={`session-tab ${session.id === activeSessionId ? 'active' : ''}`}
              onClick={() => switchSession(session.id)}
            >
              <span className="session-name">{session.name}</span>
              <button
                className="close-session"
                onClick={(e) => {
                  e.stopPropagation();
                  closeSession(session.id);
                }}
              >
                ✕
              </button>
            </div>
          ))}
          <button className="new-session" onClick={createNewSession}>
            +
          </button>
        </div>
        
        <div className="terminal-actions">
          <button onClick={clearTerminal} title="Clear terminal (Ctrl+L)">
            🧹
          </button>
          <button onClick={() => setOutput([])} title="Clear output">
            🗑️
          </button>
        </div>
      </div>

      {/* Terminal Output */}
      <div className="terminal-output" ref={terminalRef}>
        {output.map(formatOutput)}
        
        {/* Current input line */}
        <div className="current-line">
          <span className="prompt">{getPrompt()}</span>
          <input
            ref={inputRef}
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isExecuting}
            className="command-input"
            placeholder={isExecuting ? 'Executing...' : 'Enter command...'}
            autoFocus
          />
          {isExecuting && <span className="executing-indicator">⏳</span>}
        </div>
      </div>

      {/* Terminal Styles */}
      <style jsx>{`
        .terminal-panel {
          display: flex;
          flex-direction: column;
          background: #1e1e1e;
          border: 1px solid #464647;
          border-radius: 6px;
          font-family: 'Fira Code', Monaco, monospace;
          font-size: 14px;
          color: #cccccc;
          overflow: hidden;
        }

        .terminal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #2d2d30;
          border-bottom: 1px solid #464647;
          padding: 8px 12px;
        }

        .session-tabs {
          display: flex;
          gap: 4px;
          align-items: center;
        }

        .session-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: #3c3c3c;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: background-color 0.2s;
        }

        .session-tab:hover {
          background: #464647;
        }

        .session-tab.active {
          background: #007acc;
          color: white;
        }

        .session-name {
          white-space: nowrap;
        }

        .close-session {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          padding: 2px;
          border-radius: 2px;
          font-size: 10px;
        }

        .close-session:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .new-session {
          background: #4ade80;
          color: #1e1e1e;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          font-size: 12px;
        }

        .terminal-actions {
          display: flex;
          gap: 8px;
        }

        .terminal-actions button {
          background: none;
          border: none;
          color: #cccccc;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 14px;
        }

        .terminal-actions button:hover {
          background: #464647;
        }

        .terminal-output {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
          line-height: 1.4;
        }

        .terminal-output-block {
          margin-bottom: 12px;
        }

        .command-line {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
          font-weight: 500;
        }

        .prompt {
          color: #4ade80;
          font-weight: bold;
        }

        .command {
          color: #fbbf24;
        }

        .metadata {
          color: #6b7280;
          font-size: 11px;
          margin-left: auto;
        }

        .output-content {
          background: #0d1117;
          border: 1px solid #30363d;
          border-radius: 4px;
          padding: 8px;
          margin: 4px 0;
          white-space: pre-wrap;
          font-family: inherit;
          font-size: 13px;
          color: #e6edf3;
          overflow-x: auto;
        }

        .current-line {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 0;
          border-top: 1px solid #464647;
          background: #252526;
          margin: 0 -12px -12px -12px;
          padding-left: 12px;
          padding-right: 12px;
        }

        .command-input {
          flex: 1;
          background: transparent;
          border: none;
          color: #cccccc;
          font-family: inherit;
          font-size: inherit;
          outline: none;
        }

        .command-input::placeholder {
          color: #6b7280;
        }

        .command-input:disabled {
          opacity: 0.6;
        }

        .executing-indicator {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Scrollbar styling */
        .terminal-output::-webkit-scrollbar {
          width: 6px;
        }

        .terminal-output::-webkit-scrollbar-track {
          background: #2d2d30;
        }

        .terminal-output::-webkit-scrollbar-thumb {
          background: #464647;
          border-radius: 3px;
        }

        .terminal-output::-webkit-scrollbar-thumb:hover {
          background: #5a5a5a;
        }
      `}</style>
    </div>
  );
};