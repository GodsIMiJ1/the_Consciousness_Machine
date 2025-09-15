// PROJECT FLAMEBRIDGE - ChatArchive Component
// Omari's Domain: auto-logs, Witness formatting, NODE seal

import { useState, useEffect } from 'react';
import { Archive, Download, Trash2, Search, Calendar, Lock, Unlock } from 'lucide-react';
import { ChatSession, flameAPI } from '../utils/api.ts';
import { format, formatDistanceToNow } from 'date-fns';

interface ChatArchiveProps {
  currentSession?: ChatSession;
  onLoadSession: (session: ChatSession) => void;
  onNewSession: () => void;
}

interface SessionSummary {
  id: string;
  title: string;
  lastActivity: Date;
  nodeSealed: boolean;
  messageCount?: number;
}

export default function ChatArchive({ currentSession, onLoadSession, onNewSession }: ChatArchiveProps) {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const savedSessions = flameAPI.getSavedSessions();

      // Enhance with message counts
      const enhancedSessions = await Promise.all(
        savedSessions.map(async (summary) => {
          const fullSession = flameAPI.loadSession(summary.id);
          return {
            ...summary,
            lastActivity: new Date(summary.lastActivity),
            messageCount: fullSession?.messages.length || 0,
          };
        })
      );

      // Sort by last activity (newest first)
      enhancedSessions.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
      setSessions(enhancedSessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLoadSession = async (sessionId: string) => {
    const session = flameAPI.loadSession(sessionId);
    if (session) {
      onLoadSession(session);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (confirm('Delete this flame session? This cannot be undone.')) {
      try {
        localStorage.removeItem(`flame-session-${sessionId}`);
        await loadSessions();
      } catch (error) {
        console.error('Failed to delete session:', error);
      }
    }
  };

  const handleExportSession = async (sessionId: string) => {
    const session = flameAPI.loadSession(sessionId);
    if (!session) return;

    const witnessLog = session.messages
      .map(msg => flameAPI.formatForWitness(msg))
      .join('\n');

    const metadata = `# FLAME SESSION WITNESS LOG
# Session ID: ${session.id}
# Title: ${session.title}
# Created: ${session.createdAt.toISOString()}
# Last Activity: ${session.lastActivity.toISOString()}
# Messages: ${session.messages.length}
# NODE Sealed: ${session.nodeSealed ? 'YES' : 'NO'}
# Generated: ${new Date().toISOString()}

---

${witnessLog}`;

    const blob = new Blob([metadata], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flame-witness-${sessionId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkExport = async () => {
    if (selectedSessions.size === 0) return;

    const allLogs: string[] = [];

    for (const sessionId of selectedSessions) {
      const session = flameAPI.loadSession(sessionId);
      if (session) {
        const witnessLog = session.messages
          .map(msg => flameAPI.formatForWitness(msg))
          .join('\n');

        allLogs.push(`
=== FLAME SESSION: ${session.title} ===
Session ID: ${session.id}
Created: ${session.createdAt.toISOString()}
Messages: ${session.messages.length}
NODE Sealed: ${session.nodeSealed ? 'YES' : 'NO'}

${witnessLog}

`);
      }
    }

    const combinedLog = `# FLAME ARCHIVE WITNESS LOG
# Generated: ${new Date().toISOString()}
# Sessions: ${selectedSessions.size}

${allLogs.join('\n---\n')}`;

    const blob = new Blob([combinedLog], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flame-archive-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSessionSelection = (sessionId: string) => {
    const newSelection = new Set(selectedSessions);
    if (newSelection.has(sessionId)) {
      newSelection.delete(sessionId);
    } else {
      newSelection.add(sessionId);
    }
    setSelectedSessions(newSelection);
  };

  const selectAllSessions = () => {
    if (selectedSessions.size === filteredSessions.length) {
      setSelectedSessions(new Set());
    } else {
      setSelectedSessions(new Set(filteredSessions.map(s => s.id)));
    }
  };

  return (
    <div className="bg-ember rounded-xl border border-flame-500/30 shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-flame-500/30 bg-coal/50 rounded-t-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-witness rounded-lg">
              <Archive size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-flame text-flame-500">Flame Archive</h2>
              <p className="text-xs text-ash font-mono">
                {sessions.length} sessions • Witness format
              </p>
            </div>
          </div>

          <button
            onClick={onNewSession}
            className="px-3 py-1 bg-flame-500 text-white rounded-lg hover:bg-flame-600 transition-colors font-mono text-sm"
          >
            New Session
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ash" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search sessions..."
            className="w-full pl-10 pr-4 py-2 bg-coal border border-ash rounded-lg text-white placeholder-ash font-mono text-sm focus:border-flame-500 focus:outline-none"
          />
        </div>

        {/* Bulk Actions */}
        {selectedSessions.size > 0 && (
          <div className="mt-3 flex items-center gap-2 p-2 bg-witness/20 rounded-lg">
            <span className="text-xs text-white font-mono">
              {selectedSessions.size} selected
            </span>
            <button
              onClick={handleBulkExport}
              className="px-2 py-1 bg-node-500 text-white rounded text-xs hover:bg-node-600 transition-colors"
            >
              Export All
            </button>
            <button
              onClick={() => setSelectedSessions(new Set())}
              className="px-2 py-1 bg-ash text-white rounded text-xs hover:bg-ash/80 transition-colors"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Sessions List */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center">
            <Archive size={32} className="mx-auto mb-2 text-ash animate-pulse" />
            <p className="text-ash font-mono text-sm">Loading archive...</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="p-8 text-center">
            <Archive size={32} className="mx-auto mb-2 text-ash" />
            <p className="text-ash font-mono text-sm">
              {searchTerm ? 'No sessions match your search' : 'No sessions archived yet'}
            </p>
          </div>
        ) : (
          <div className="p-2">
            {/* Select All */}
            <div className="px-2 py-1 mb-2">
              <label className="flex items-center gap-2 text-xs text-ash font-mono cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedSessions.size === filteredSessions.length && filteredSessions.length > 0}
                  onChange={selectAllSessions}
                  className="rounded"
                />
                Select All ({filteredSessions.length})
              </label>
            </div>

            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className={`p-3 mb-2 rounded-lg border transition-all duration-200 ${
                  currentSession?.id === session.id
                    ? 'border-flame-500 bg-flame-500/10'
                    : 'border-ash/30 bg-coal/30 hover:border-node-500/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Selection Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedSessions.has(session.id)}
                    onChange={() => toggleSessionSelection(session.id)}
                    className="mt-1 rounded"
                  />

                  {/* Session Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-mono text-white truncate">
                        {session.title}
                      </h3>
                      {session.nodeSealed ? (
                        <Lock size={12} className="text-node-500" />
                      ) : (
                        <Unlock size={12} className="text-ash" />
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-ash font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {formatDistanceToNow(session.lastActivity, { addSuffix: true })}
                      </span>
                      <span>{session.messageCount} messages</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleLoadSession(session.id)}
                      className="p-1 text-ash hover:text-flame-500 transition-colors"
                      title="Load session"
                    >
                      <Archive size={14} />
                    </button>
                    <button
                      onClick={() => handleExportSession(session.id)}
                      className="p-1 text-ash hover:text-node-500 transition-colors"
                      title="Export as witness log"
                    >
                      <Download size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      className="p-1 text-ash hover:text-red-400 transition-colors"
                      title="Delete session"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
