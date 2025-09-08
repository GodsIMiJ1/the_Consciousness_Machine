import React, { useState, useEffect } from 'react';
import { Monaco } from '@monaco-editor/react';
import { ChatInterface } from './components/ChatInterface';
import { ThreadSidebar } from './components/ThreadSidebar';
import { TerminalPanel } from './components/TerminalPanel';
import { FileExplorer } from './components/FileExplorer';

interface SKIDEWindow extends Window {
  skide: any;
}

declare let window: SKIDEWindow;

export const App: React.FC = () => {
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState('');

  const [projectContext, setProjectContext] = useState({
    currentFile,
    selection: '',
    openFiles: [],
    gitStatus: null
  });

  useEffect(() => {
    // Initialize default thread
    const initializeThread = async () => {
      const threads = await window.skide.threads.list();
      if (threads.length === 0) {
        const defaultThread = await window.skide.threads.create({
          title: 'General Chat',
          description: 'Main conversation with Kodii',
          context: { isDefault: true }
        });
        setActiveThread(defaultThread.id);
      } else {
        setActiveThread(threads[0].id);
      }
    };

    initializeThread();
  }, []);

  const handleEditorSelectionChange = (selection: string) => {
    setProjectContext(prev => ({ ...prev, selection }));
  };

  return (
    <div className="app h-screen flex bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-700 flex flex-col">
        <FileExplorer onFileSelect={setCurrentFile} />
        <ThreadSidebar 
          activeThread={activeThread}
          onThreadSelect={setActiveThread}
          onToggleChat={() => setShowChat(!showChat)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Editor */}
        <div className="flex-1 flex">
          <div className="flex-1">
            <Monaco
              height="100%"
              language="typescript"
              theme="vs-dark"
              value={editorContent}
              onChange={(value) => setEditorContent(value || '')}
              onSelectionChange={handleEditorSelectionChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                automaticLayout: true
              }}
            />
          </div>

          {/* Chat Panel */}
          {showChat && activeThread && (
            <div className="w-96 border-l border-gray-700">
              <ChatInterface 
                threadId={activeThread}
                context={projectContext}
                onClose={() => setShowChat(false)}
              />
            </div>
          )}
        </div>

        {/* Terminal */}
        <TerminalPanel height={200} />
      </div>
    </div>
  );
};
