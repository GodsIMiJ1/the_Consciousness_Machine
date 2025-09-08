import React, { useState, useEffect } from 'react';

interface Thread {
  id: string;
  title: string;
  description?: string;
  updatedAt: number;
}

interface ThreadSidebarProps {
  activeThread: string | null;
  onThreadSelect: (threadId: string) => void;
  onToggleChat: () => void;
}

export const ThreadSidebar: React.FC<ThreadSidebarProps> = ({
  activeThread,
  onThreadSelect,
  onToggleChat
}) => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');

  useEffect(() => {
    loadThreads();
  }, []);

  const loadThreads = async () => {
    try {
      const threadList = await (window as any).skide.threads.list();
      setThreads(threadList);
    } catch (error) {
      console.error('Failed to load threads:', error);
    }
  };

  const handleCreateThread = async () => {
    if (!newThreadTitle.trim()) return;

    try {
      const newThread = await (window as any).skide.threads.create({
        title: newThreadTitle,
        description: 'New conversation with Kodii'
      });

      setThreads(prev => [newThread, ...prev]);
      onThreadSelect(newThread.id);
      setNewThreadTitle('');
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create thread:', error);
    }
  };

  const handleDeleteThread = async (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await (window as any).skide.threads.delete(threadId);
      setThreads(prev => prev.filter(t => t.id !== threadId));
      
      if (activeThread === threadId) {
        const remainingThreads = threads.filter(t => t.id !== threadId);
        if (remainingThreads.length > 0) {
          onThreadSelect(remainingThreads[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to delete thread:', error);
    }
  };

  return (
    <div className="thread-sidebar bg-gray-800 border-t border-gray-700 flex flex-col h-64">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-white">Chat Threads</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsCreating(true)}
            className="text-gray-400 hover:text-white text-sm"
            title="New Thread"
          >
            +
          </button>
          <button
            onClick={onToggleChat}
            className="text-gray-400 hover:text-white text-sm"
            title="Toggle Chat"
          >
            💬
          </button>
        </div>
      </div>

      {/* New Thread Input */}
      {isCreating && (
        <div className="p-3 border-b border-gray-700">
          <input
            type="text"
            value={newThreadTitle}
            onChange={(e) => setNewThreadTitle(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleCreateThread();
              if (e.key === 'Escape') setIsCreating(false);
            }}
            placeholder="Thread title..."
            className="w-full bg-gray-700 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
          <div className="flex space-x-2 mt-2">
            <button
              onClick={handleCreateThread}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded"
            >
              Create
            </button>
            <button
              onClick={() => setIsCreating(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-2 py-1 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto">
        {threads.length === 0 ? (
          <div className="p-3 text-center text-gray-400 text-sm">
            No threads yet. Create one to start chatting with Kodii!
          </div>
        ) : (
          threads.map((thread) => (
            <div
              key={thread.id}
              onClick={() => onThreadSelect(thread.id)}
              className={`p-3 cursor-pointer border-b border-gray-700 hover:bg-gray-700 ${
                activeThread === thread.id ? 'bg-gray-700' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-white truncate">
                    {thread.title}
                  </h4>
                  {thread.description && (
                    <p className="text-xs text-gray-400 truncate mt-1">
                      {thread.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(thread.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDeleteThread(thread.id, e)}
                  className="text-gray-400 hover:text-red-400 ml-2"
                  title="Delete Thread"
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
