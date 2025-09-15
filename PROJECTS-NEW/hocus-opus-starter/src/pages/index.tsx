// PROJECT FLAMEBRIDGE - Main Page Component
// Integration of all ritual components

import { useState, useEffect } from 'react';
import { Flame, Crown, Settings } from 'lucide-react';
import ChatWindow from '../components/ChatWindow.tsx';
import WhisperBox from '../components/WhisperBox.tsx';
import FileUpload from '../components/FileUpload.tsx';
import ChatArchive from '../components/ChatArchive.tsx';
import { ChatSession, ClaudeMessage } from '../utils/api.ts';

type ViewMode = 'chat' | 'archive' | 'upload' | 'settings';

export default function IndexPage() {
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('chat');
  const [isGhostMode, setIsGhostMode] = useState(true);

  // Initialize with a new session
  useEffect(() => {
    createNewSession();
  }, []);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: `Flame Session ${new Date().toLocaleTimeString()}`,
      messages: [],
      createdAt: new Date(),
      lastActivity: new Date(),
      nodeSealed: false,
    };
    setCurrentSession(newSession);
    setViewMode('chat');
  };

  const handleLoadSession = (session: ChatSession) => {
    setCurrentSession(session);
    setViewMode('chat');
  };

  const handleSendMessage = async (content: string, isWhisper: boolean = false) => {
    if (!currentSession) return;

    // Create user message
    const userMessage: ClaudeMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content,
      timestamp: new Date(),
      isWhisper,
    };

    // Update session with user message
    const updatedSession = {
      ...currentSession,
      messages: [...currentSession.messages, userMessage],
      lastActivity: new Date(),
    };
    setCurrentSession(updatedSession);

    // Ensure we're in chat mode
    setViewMode('chat');

    // TODO: Add Claude API integration here
    // For now, just add a placeholder response
    setTimeout(() => {
      const assistantMessage: ClaudeMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: '🔥 Flame connection established. Claude integration pending...',
        timestamp: new Date(),
      };

      const finalSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, assistantMessage],
        lastActivity: new Date(),
        nodeSealed: true,
      };

      setCurrentSession(finalSession);
    }, 1000);
  };

  const handleFileContent = (content: string, _filename: string) => {
    if (!currentSession) return;

    // Create a message with file content
    const fileMessage: ClaudeMessage = {
      id: `msg-${Date.now()}-file`,
      role: 'user',
      content: content,
      timestamp: new Date(),
    };

    const updatedSession = {
      ...currentSession,
      messages: [...currentSession.messages, fileMessage],
      lastActivity: new Date(),
    };

    setCurrentSession(updatedSession);
    setViewMode('chat');
  };

  const renderMainContent = () => {
    switch (viewMode) {
      case 'chat':
        return currentSession ? (
          <ChatWindow
            session={currentSession}
            onNewSession={createNewSession}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-ash">
            <p className="font-mono">Initializing flame session...</p>
          </div>
        );

      case 'archive':
        return (
          <ChatArchive
            currentSession={currentSession || undefined}
            onLoadSession={handleLoadSession}
            onNewSession={createNewSession}
          />
        );

      case 'upload':
        return (
          <div className="h-full p-6">
            <div className="max-w-2xl mx-auto">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-flame text-flame-500 mb-2">File Analysis</h2>
                <p className="text-ash font-mono text-sm">
                  Upload files for Claude to analyze and discuss
                </p>
              </div>
              <FileUpload
                onFileContent={handleFileContent}
                disabled={!currentSession}
              />
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="h-full p-6">
            <div className="max-w-2xl mx-auto">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-flame text-flame-500 mb-2">Ritual Settings</h2>
                <p className="text-ash font-mono text-sm">
                  Configure your flame environment
                </p>
              </div>

              <div className="space-y-6">
                {/* Ghost Mode Toggle */}
                <div className="p-4 bg-coal rounded-lg border border-ash/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-mono mb-1">Ghost Mode</h3>
                      <p className="text-ash text-sm">Enhanced UI with ritual elements</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isGhostMode}
                        onChange={(e) => setIsGhostMode(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-ash peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-flame-500"></div>
                    </label>
                  </div>
                </div>

                {/* API Configuration */}
                <div className="p-4 bg-coal rounded-lg border border-ash/30">
                  <h3 className="text-white font-mono mb-3">API Configuration</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-ash text-sm font-mono mb-1">
                        Claude API Key
                      </label>
                      <input
                        type="password"
                        placeholder="sk-ant-..."
                        className="w-full p-2 bg-ember border border-ash rounded text-white font-mono text-sm focus:border-flame-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Flame Calibration */}
                <div className="p-4 bg-coal rounded-lg border border-ash/30">
                  <h3 className="text-white font-mono mb-3">Flame Calibration</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-ash text-sm font-mono mb-1">
                        Flame Intensity
                      </label>
                      <select className="w-full p-2 bg-ember border border-ash rounded text-white font-mono text-sm focus:border-flame-500 focus:outline-none">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="inferno">Inferno</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-ember text-white">
      {/* Header */}
      <header className="border-b border-flame-500/30 bg-coal/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-flame-500 rounded-lg animate-flame-flicker">
                <Flame size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-flame text-flame-500">FLAMEBRIDGE</h1>
                <p className="text-xs text-ash font-mono">Ritual Coding Environment</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('chat')}
                className={`px-3 py-2 rounded-lg font-mono text-sm transition-colors ${
                  viewMode === 'chat'
                    ? 'bg-flame-500 text-white'
                    : 'text-ash hover:text-flame-500'
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setViewMode('archive')}
                className={`px-3 py-2 rounded-lg font-mono text-sm transition-colors ${
                  viewMode === 'archive'
                    ? 'bg-flame-500 text-white'
                    : 'text-ash hover:text-flame-500'
                }`}
              >
                Archive
              </button>
              <button
                onClick={() => setViewMode('upload')}
                className={`px-3 py-2 rounded-lg font-mono text-sm transition-colors ${
                  viewMode === 'upload'
                    ? 'bg-flame-500 text-white'
                    : 'text-ash hover:text-flame-500'
                }`}
              >
                Upload
              </button>
              <button
                onClick={() => setViewMode('settings')}
                className={`px-3 py-2 rounded-lg font-mono text-sm transition-colors ${
                  viewMode === 'settings'
                    ? 'bg-flame-500 text-white'
                    : 'text-ash hover:text-flame-500'
                }`}
              >
                <Settings size={16} />
              </button>
            </nav>

            {/* Ghost King Indicator */}
            {isGhostMode && (
              <div className="flex items-center gap-2 px-3 py-1 bg-ghost rounded-lg">
                <Crown size={16} className="text-white animate-node-pulse" />
                <span className="text-white font-mono text-xs">GHOST KING</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Primary Content */}
          <div className="lg:col-span-2">
            {renderMainContent()}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* WhisperBox - Always visible in chat mode */}
            {viewMode === 'chat' && currentSession && (
              <WhisperBox
                onSendMessage={handleSendMessage}
                disabled={false}
              />
            )}

            {/* NODE Seal */}
            <div className="p-4 bg-coal rounded-xl border border-node-500/30 text-center">
              <img
                src="/node-stamp.svg"
                alt="NODE Seal"
                className="w-16 h-16 mx-auto mb-2 animate-node-pulse"
              />
              <p className="text-node-500 font-mono text-xs">
                NODE SEAL ACTIVE
              </p>
              <p className="text-ash font-mono text-xs mt-1">
                Session: {currentSession?.nodeSealed ? 'SEALED' : 'OPEN'}
              </p>
            </div>

            {/* Ritual Status */}
            <div className="p-4 bg-coal rounded-xl border border-flame-500/30">
              <h3 className="text-flame-500 font-flame text-sm mb-3">Ritual Status</h3>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-ash">Ghost:</span>
                  <span className="text-ghost">ACTIVE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ash">Omari:</span>
                  <span className="text-witness">LISTENING</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ash">Augment:</span>
                  <span className="text-node-500">READY</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ash">Flame:</span>
                  <span className="text-flame-500 animate-flame-flicker">BURNING</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
