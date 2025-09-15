// PROJECT FLAMEBRIDGE - ChatWindow Component
// Ghost's Domain: UI vision, memory handler, Flame calibration

import { useEffect, useRef } from 'react';
import { Flame, Crown, Zap, Archive, Trash2 } from 'lucide-react';
import { ChatSession, flameAPI } from '../utils/api.ts';
import { format } from 'date-fns';

interface ChatWindowProps {
  session: ChatSession;
  onNewSession: () => void;
}

export default function ChatWindow({ session, onNewSession }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages]);

  const clearSession = () => {
    if (confirm('Clear this flame session? This cannot be undone.')) {
      onNewSession();
    }
  };

  const exportSession = () => {
    const witnessLog = session.messages
      .map(msg => flameAPI.formatForWitness(msg))
      .join('\n');

    const blob = new Blob([witnessLog], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flame-session-${session.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-ember rounded-xl border border-flame-500/30 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-flame-500/30 bg-coal/50 rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-flame-500 rounded-lg animate-flame-flicker">
            <Flame size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-flame text-flame-500">
              {session.title || 'Flame Session'}
            </h2>
            <p className="text-xs text-ash font-mono">
              {session.messages.length} messages • {session.nodeSealed && '🔒 NODE SEALED'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Ghost King Indicator */}
          <div className="p-1 bg-ghost rounded-full animate-node-pulse" title="Ghost King Active">
            <Crown size={16} className="text-white" />
          </div>

          {/* Export */}
          <button
            onClick={exportSession}
            className="p-2 text-ash hover:text-node-500 transition-colors"
            title="Export as Witness Log"
          >
            <Archive size={16} />
          </button>

          {/* Clear */}
          <button
            onClick={clearSession}
            className="p-2 text-ash hover:text-flame-500 transition-colors"
            title="Clear Session"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {session.messages.length === 0 ? (
          <div className="text-center text-ash font-mono py-8">
            <Flame size={48} className="mx-auto mb-4 text-flame-500 animate-flame-flicker" />
            <p>The flame awaits your words...</p>
            <p className="text-xs mt-2">Speak, and let the ritual begin.</p>
          </div>
        ) : (
          session.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg font-mono text-sm ${
                  message.role === 'user'
                    ? message.isWhisper
                      ? 'bg-whisper text-white border border-whisper/50'
                      : 'bg-flame-500 text-white'
                    : 'bg-coal border border-node-500/30 text-white'
                }`}
              >
                {/* Message Header */}
                <div className="flex items-center gap-2 mb-2 text-xs opacity-70">
                  {message.role === 'user' ? (
                    <>
                      <Crown size={12} />
                      <span>Ghost King</span>
                      {message.isWhisper && <span className="text-whisper">• WHISPER</span>}
                    </>
                  ) : (
                    <>
                      <Zap size={12} />
                      <span>Claude</span>
                    </>
                  )}
                  <span className="ml-auto">
                    {format(message.timestamp, 'HH:mm:ss')}
                  </span>
                </div>

                {/* Message Content */}
                <div className="whitespace-pre-wrap break-words">
                  {message.content}
                </div>
              </div>
            </div>
          ))
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
