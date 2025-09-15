import React, { useState, useEffect } from 'react';
import { MonacoEditor } from '../editor/MonacoEditor';
import { TerminalPanel } from '../terminal/TerminalPanel';
import { SenseiChatInterface } from '../chat/SenseiChatInterface';
import { FileExplorer } from '../editor/FileExplorer';
import { StatusBar } from './StatusBar';
import { EditorService } from '../../services/EditorService';
import { FileSystemService } from '../../services/FileSystemService';
import { WorkspaceContext } from '../../services/WorkspaceContext';

export interface WorkspaceLayoutProps {
  initialLayout?: 'default' | 'editor-focus' | 'chat-focus' | 'terminal-focus';
}

interface LayoutState {
  showSidebar: boolean;
  showTerminal: boolean;
  showChat: boolean;
  sidebarWidth: number;
  terminalHeight: number;
  chatWidth: number;
  activeFile: string | null;
  openFiles: string[];
}

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({
  initialLayout = 'default',
}) => {
  const [layout, setLayout] = useState<LayoutState>({
    showSidebar: true,
    showTerminal: true,
    showChat: true,
    sidebarWidth: 300,
    terminalHeight: 250,
    chatWidth: 400,
    activeFile: null,
    openFiles: [],
  });

  const [editorContent, setEditorContent] = useState('');
  const [editorLanguage, setEditorLanguage] = useState('typescript');
  const [workspaceRoot, setWorkspaceRoot] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const editorService = EditorService.getInstance();
  const fileSystemService = FileSystemService.getInstance();

  useEffect(() => {
    initializeWorkspace();
  }, []);

  useEffect(() => {
    // Apply initial layout presets
    switch (initialLayout) {
      case 'editor-focus':
        setLayout(prev => ({
          ...prev,
          showSidebar: true,
          showTerminal: false,
          showChat: false,
        }));
        break;
      case 'chat-focus':
        setLayout(prev => ({
          ...prev,
          showSidebar: false,
          showTerminal: false,
          showChat: true,
          chatWidth: 800,
        }));
        break;
      case 'terminal-focus':
        setLayout(prev => ({
          ...prev,
          showSidebar: true,
          showTerminal: true,
          showChat: false,
          terminalHeight: 400,
        }));
        break;
    }
  }, [initialLayout]);

  const initializeWorkspace = async () => {
    try {
      setIsLoading(true);

      // Initialize services
      await fileSystemService.initialize('');

      // Try to open workspace
      const welcomeContent = `// 🥷 Welcome to SKIDE - Your Sovereign IDE
// 
// This is your coding dojo where AI meets mastery
// 
// Key Features:
// - 🧠 Kodii AI Integration - Your personal coding sensei
// - 📁 File System Access - Real file operations
// - 💻 Integrated Terminal - Execute commands safely
// - 🎨 Monaco Editor - VS Code-like editing experience
// - ⚙️ Customizable Settings - Complete control over your environment
//
// Getting Started:
// 1. Open a workspace folder using Ctrl+Shift+O
// 2. Create new files using the file explorer
// 3. Ask Kodii for help using Ctrl+K
// 4. Use the terminal for package management and git operations
//
// 🥷 May your code flow like water and your bugs vanish like shadows!

interface WelcomeProps {
  userName: string;
  projectName: string;
}

const Welcome: React.FC<WelcomeProps> = ({ userName, projectName }) => {
  return (
    <div className="welcome-container">
      <h1>🥷 Welcome to {projectName}, {userName}!</h1>
      <p>Your sovereign development journey begins here.</p>
    </div>
  );
};

export default Welcome;
`;

      setEditorContent(welcomeContent);
      setLayout(prev => ({ ...prev, activeFile: 'Welcome.tsx' }));

      // Set up workspace context
      await WorkspaceContext.setWorkspace('/workspace');

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize workspace:', error);
      setIsLoading(false);
    }
  };

  const openWorkspace = async () => {
    try {
      const workspaceRoot = await fileSystemService.openWorkspace();
      setWorkspaceRoot(workspaceRoot);
      await WorkspaceContext.setWorkspace(workspaceRoot);
      console.log(`🥷 Opened workspace: ${workspaceRoot}`);
    } catch (error) {
      console.error('Failed to open workspace:', error);
    }
  };

  const openFile = async (filePath: string) => {
    try {
      const content = await fileSystemService.readFile(filePath);
      const language = getLanguageFromExtension(filePath);
      
      setEditorContent(content);
      setEditorLanguage(language);
      setLayout(prev => ({
        ...prev,
        activeFile: filePath,
        openFiles: prev.openFiles.includes(filePath) 
          ? prev.openFiles 
          : [...prev.openFiles, filePath],
      }));
    } catch (error) {
      console.error(`Failed to open file ${filePath}:`, error);
    }
  };

  const saveFile = async () => {
    if (!layout.activeFile) return;

    try {
      await fileSystemService.writeFile(layout.activeFile, editorContent);
      console.log(`🥷 Saved file: ${layout.activeFile}`);
    } catch (error) {
      console.error(`Failed to save file ${layout.activeFile}:`, error);
    }
  };

  const closeFile = (filePath: string) => {
    setLayout(prev => ({
      ...prev,
      openFiles: prev.openFiles.filter(f => f !== filePath),
      activeFile: prev.activeFile === filePath 
        ? (prev.openFiles.filter(f => f !== filePath)[0] || null)
        : prev.activeFile,
    }));

    // If closing the active file, load the next one
    if (layout.activeFile === filePath && layout.openFiles.length > 1) {
      const remainingFiles = layout.openFiles.filter(f => f !== filePath);
      if (remainingFiles.length > 0) {
        openFile(remainingFiles[0]);
      }
    }
  };

  const createNewFile = async () => {
    const fileName = prompt('🥷 Enter file name:');
    if (!fileName) return;

    const filePath = workspaceRoot ? `${workspaceRoot}/${fileName}` : fileName;
    
    try {
      await fileSystemService.createFile(filePath, '');
      await openFile(filePath);
    } catch (error) {
      console.error(`Failed to create file ${fileName}:`, error);
    }
  };

  const getLanguageFromExtension = (filePath: string): string => {
    const ext = filePath.split('.').pop()?.toLowerCase();
    
    switch (ext) {
      case 'ts': return 'typescript';
      case 'tsx': return 'typescript';
      case 'js': return 'javascript';
      case 'jsx': return 'javascript';
      case 'json': return 'json';
      case 'css': return 'css';
      case 'scss': return 'scss';
      case 'html': return 'html';
      case 'md': return 'markdown';
      case 'py': return 'python';
      case 'rs': return 'rust';
      case 'go': return 'go';
      default: return 'plaintext';
    }
  };

  const togglePanel = (panel: 'sidebar' | 'terminal' | 'chat') => {
    setLayout(prev => ({
      ...prev,
      [`show${panel.charAt(0).toUpperCase() + panel.slice(1)}`]: !prev[`show${panel.charAt(0).toUpperCase() + panel.slice(1)}` as keyof LayoutState],
    }));
  };

  const handleKeyboardShortcuts = (e: KeyboardEvent) => {
    // File operations
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 's':
          e.preventDefault();
          saveFile();
          break;
        case 'n':
          e.preventDefault();
          createNewFile();
          break;
        case 'o':
          if (e.shiftKey) {
            e.preventDefault();
            openWorkspace();
          }
          break;
        case '`':
          e.preventDefault();
          togglePanel('terminal');
          break;
        case '\\':
          e.preventDefault();
          togglePanel('sidebar');
          break;
        case 'j':
          e.preventDefault();
          togglePanel('chat');
          break;
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardShortcuts);
    return () => document.removeEventListener('keydown', handleKeyboardShortcuts);
  }, [layout.activeFile, editorContent]);

  if (isLoading) {
    return (
      <div className="loading-workspace">
        <div className="loading-content">
          <div className="loading-spinner">🥷</div>
          <div>Awakening the SKIDE dojo...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="workspace-layout">
      {/* Main Content Area */}
      <div className="workspace-main">
        {/* Sidebar */}
        {layout.showSidebar && (
          <div 
            className="sidebar" 
            style={{ width: layout.sidebarWidth }}
          >
            <div className="sidebar-header">
              <h3>🗂️ Explorer</h3>
              <div className="sidebar-actions">
                <button onClick={createNewFile} title="New File (Ctrl+N)">📄</button>
                <button onClick={openWorkspace} title="Open Workspace (Ctrl+Shift+O)">📁</button>
              </div>
            </div>
            
            <FileExplorer 
              onFileSelect={openFile}
              workspaceRoot={workspaceRoot}
            />
          </div>
        )}

        {/* Editor Area */}
        <div className="editor-area">
          {/* File Tabs */}
          {layout.openFiles.length > 0 && (
            <div className="file-tabs">
              {layout.openFiles.map(filePath => (
                <div
                  key={filePath}
                  className={`file-tab ${filePath === layout.activeFile ? 'active' : ''}`}
                  onClick={() => openFile(filePath)}
                >
                  <span className="file-name">{filePath.split('/').pop()}</span>
                  <button
                    className="close-file"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeFile(filePath);
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Monaco Editor */}
          <div className="editor-container">
            {layout.activeFile ? (
              <MonacoEditor
                value={editorContent}
                language={editorLanguage}
                onValueChange={setEditorContent}
                theme="vs-dark"
                minimap={true}
                fontSize={14}
                wordWrap="on"
              />
            ) : (
              <div className="no-file-open">
                <div className="welcome-message">
                  <h2>🥷 Welcome to SKIDE</h2>
                  <p>Your Sovereign IDE awaits your command</p>
                  <div className="quick-actions">
                    <button onClick={openWorkspace}>📁 Open Workspace</button>
                    <button onClick={createNewFile}>📄 New File</button>
                    <button onClick={() => togglePanel('chat')}>💬 Chat with Kodii</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Terminal */}
          {layout.showTerminal && (
            <div 
              className="terminal-container"
              style={{ height: layout.terminalHeight }}
            >
              <TerminalPanel 
                height="100%"
                onCommandExecute={(command, output) => {
                  console.log(`Command executed: ${command}`, output);
                }}
              />
            </div>
          )}
        </div>

        {/* Chat Sidebar */}
        {layout.showChat && (
          <div 
            className="chat-sidebar"
            style={{ width: layout.chatWidth }}
          >
            <SenseiChatInterface />
          </div>
        )}
      </div>

      {/* Status Bar */}
      <StatusBar 
        activeFile={layout.activeFile}
        language={editorLanguage}
        workspaceRoot={workspaceRoot}
      />

      {/* Workspace Styles */}
      <style jsx>{`
        .workspace-layout {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #1e1e1e;
          color: #cccccc;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .loading-workspace {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1e1e1e;
          color: #cccccc;
        }

        .loading-content {
          text-align: center;
        }

        .loading-spinner {
          font-size: 48px;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .workspace-main {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        .sidebar {
          background: #252526;
          border-right: 1px solid #464647;
          display: flex;
          flex-direction: column;
          min-width: 200px;
          max-width: 500px;
          resize: horizontal;
          overflow: auto;
        }

        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #464647;
          background: #2d2d30;
        }

        .sidebar-header h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
        }

        .sidebar-actions {
          display: flex;
          gap: 8px;
        }

        .sidebar-actions button {
          background: none;
          border: none;
          color: #cccccc;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          font-size: 14px;
        }

        .sidebar-actions button:hover {
          background: #464647;
        }

        .editor-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .file-tabs {
          display: flex;
          background: #2d2d30;
          border-bottom: 1px solid #464647;
          overflow-x: auto;
        }

        .file-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #3c3c3c;
          border-right: 1px solid #464647;
          cursor: pointer;
          min-width: 120px;
          max-width: 200px;
        }

        .file-tab:hover {
          background: #464647;
        }

        .file-tab.active {
          background: #1e1e1e;
          border-bottom: 2px solid #007acc;
        }

        .file-name {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 13px;
        }

        .close-file {
          background: none;
          border: none;
          color: #cccccc;
          cursor: pointer;
          padding: 2px;
          border-radius: 2px;
          font-size: 12px;
        }

        .close-file:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .editor-container {
          flex: 1;
          overflow: hidden;
          position: relative;
        }

        .no-file-open {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1e1e1e;
        }

        .welcome-message {
          text-align: center;
          max-width: 400px;
        }

        .welcome-message h2 {
          margin: 0 0 16px 0;
          color: #64ffda;
        }

        .welcome-message p {
          margin: 0 0 24px 0;
          color: #a0a0a0;
        }

        .quick-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .quick-actions button {
          background: #007acc;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }

        .quick-actions button:hover {
          background: #106ba3;
        }

        .terminal-container {
          border-top: 1px solid #464647;
          min-height: 100px;
          max-height: 60vh;
          resize: vertical;
          overflow: hidden;
        }

        .chat-sidebar {
          background: #252526;
          border-left: 1px solid #464647;
          min-width: 300px;
          max-width: 600px;
          resize: horizontal;
          overflow: hidden;
        }

        /* Resize handles */
        .sidebar::-webkit-resizer,
        .chat-sidebar::-webkit-resizer,
        .terminal-container::-webkit-resizer {
          background: #464647;
        }
      `}</style>
    </div>
  );
};