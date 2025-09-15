import React, { useState, useEffect, useRef } from 'react';
import {
  XMarkIcon,
  ArrowPathIcon,
  ClipboardDocumentIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

export interface OutputMessage {
  id: string;
  timestamp: Date;
  type: 'info' | 'warning' | 'error' | 'success' | 'command' | 'output';
  source: string; // 'terminal', 'kodii', 'system', etc.
  content: string;
  metadata?: Record<string, any>;
}

interface OutputPanelProps {
  messages: OutputMessage[];
  onClear: () => void;
  onClose?: () => void;
  title?: string;
  allowCopy?: boolean;
  maxHeight?: string;
}

export const OutputPanel: React.FC<OutputPanelProps> = ({
  messages,
  onClear,
  onClose,
  title = "Output",
  allowCopy = true,
  maxHeight = "300px"
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Filter messages based on type and search query
  const filteredMessages = messages.filter(msg => {
    // Type filter
    if (filter !== 'all' && msg.type !== filter) return false;
    
    // Search filter
    if (searchQuery && !msg.content.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  // Handle scroll to detect if user scrolled up (disable auto-scroll)
  const handleScroll = () => {
    if (!outputRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = outputRef.current;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
    
    setAutoScroll(isAtBottom);
  };

  // Copy all output to clipboard
  const copyToClipboard = async () => {
    const text = filteredMessages
      .map(msg => `[${msg.timestamp.toLocaleTimeString()}] ${msg.source}: ${msg.content}`)
      .join('\n');
    
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  // Get icon for message type
  const getMessageIcon = (type: OutputMessage['type']) => {
    switch (type) {
      case 'error':
        return <XCircleIcon className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />;
      case 'success':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'info':
        return <InformationCircleIcon className="w-4 h-4 text-blue-500" />;
      case 'command':
        return <span className="w-4 h-4 text-purple-500 font-mono text-sm">$</span>;
      default:
        return <span className="w-4 h-4 text-gray-500">•</span>;
    }
  };

  // Get color classes for message type
  const getMessageColor = (type: OutputMessage['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-800 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-800 bg-yellow-50 border-yellow-200';
      case 'success':
        return 'text-green-800 bg-green-50 border-green-200';
      case 'info':
        return 'text-blue-800 bg-blue-50 border-blue-200';
      case 'command':
        return 'text-purple-800 bg-purple-50 border-purple-200 font-mono';
      default:
        return 'text-gray-800 bg-white border-gray-200';
    }
  };

  // Get count for each message type
  const getTypeCounts = () => {
    const counts = { all: messages.length, error: 0, warning: 0, info: 0, success: 0, command: 0, output: 0 };
    messages.forEach(msg => {
      counts[msg.type]++;
    });
    return counts;
  };

  const counts = getTypeCounts();

  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium text-gray-900">{title}</h3>
          <span className="text-sm text-gray-500">
            ({filteredMessages.length} of {messages.length})
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Search */}
          <input
            type="text"
            placeholder="Search output..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs border border-gray-300 rounded px-2 py-1 w-32 focus:outline-none focus:border-blue-500"
          />
          
          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All ({counts.all})</option>
            <option value="error">Errors ({counts.error})</option>
            <option value="warning">Warnings ({counts.warning})</option>
            <option value="info">Info ({counts.info})</option>
            <option value="success">Success ({counts.success})</option>
            <option value="command">Commands ({counts.command})</option>
            <option value="output">Output ({counts.output})</option>
          </select>

          {/* Auto-scroll toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1 rounded text-xs ${
              autoScroll ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
            }`}
            title="Auto-scroll"
          >
            ↓
          </button>

          {/* Copy */}
          {allowCopy && (
            <button
              onClick={copyToClipboard}
              className="p-1 hover:bg-gray-200 rounded"
              title="Copy to clipboard"
            >
              <ClipboardDocumentIcon className="w-4 h-4 text-gray-600" />
            </button>
          )}

          {/* Clear */}
          <button
            onClick={onClear}
            className="p-1 hover:bg-gray-200 rounded"
            title="Clear output"
          >
            <ArrowPathIcon className="w-4 h-4 text-gray-600" />
          </button>

          {/* Close */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded"
              title="Close panel"
            >
              <XMarkIcon className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={outputRef}
        className="flex-1 overflow-y-auto p-2 font-mono text-sm"
        style={{ maxHeight }}
        onScroll={handleScroll}
      >
        {filteredMessages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <InformationCircleIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No output to display</p>
            {searchQuery && (
              <p className="text-xs mt-1">Try adjusting your search or filter</p>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-2 p-2 rounded border text-xs ${getMessageColor(message.type)}`}
              >
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {getMessageIcon(message.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-600">
                      {message.source}
                    </span>
                    <span className="text-gray-500">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    {message.metadata && Object.keys(message.metadata).length > 0 && (
                      <details className="text-gray-500">
                        <summary className="cursor-pointer text-xs">metadata</summary>
                        <pre className="mt-1 text-xs bg-gray-100 p-1 rounded">
                          {JSON.stringify(message.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                  
                  <div className="whitespace-pre-wrap break-words">
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Footer Status */}
      <div className="px-3 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {counts.error > 0 && (
              <span className="text-red-600">{counts.error} errors</span>
            )}
            {counts.warning > 0 && (
              <span className="text-yellow-600">{counts.warning} warnings</span>
            )}
            <span>{counts.all} total messages</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {!autoScroll && (
              <span className="text-yellow-600">Auto-scroll disabled</span>
            )}
            <span>Updated {messages.length > 0 ? messages[messages.length - 1]?.timestamp.toLocaleTimeString() : 'never'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};