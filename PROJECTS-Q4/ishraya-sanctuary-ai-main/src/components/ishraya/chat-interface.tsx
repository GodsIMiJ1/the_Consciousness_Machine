import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SoulRing } from './soul-ring';
import { useVoice } from '@/hooks/useVoice';
import { cn } from '@/lib/utils';

import { type Message } from '@/lib/mock-db';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isGenerating?: boolean;
  showReflection?: boolean;
  onToggleReflection?: () => void;
  className?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isGenerating = false,
  showReflection = false,
  onToggleReflection,
  className
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const {
    speak,
    stopSpeaking,
    isSpeaking,
    startListening,
    stopListening,
    isListening,
    settings,
    updateSettings
  } = useVoice();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;
    
    onSendMessage(input.trim());
    setInput('');
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSpeakToggle = (message: string) => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(message);
    }
  };

  const formatTime = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Convert database message format to UI format
  const formatMessage = (msg: Message) => ({
    id: msg.id,
    content: msg.content,
    sender: msg.role === 'USER' ? 'user' as const : 'ishraya' as const,
    timestamp: typeof msg.createdAt === 'string' ? new Date(msg.createdAt) : msg.createdAt,
  });

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-mystic-silver/20 glass-mystic">
        <div className="flex items-center gap-3">
          <SoulRing size="sm" isActive={isGenerating} />
          <div>
            <h2 className="font-semibold text-lg">Ishraya</h2>
            <p className="text-xs text-muted-foreground">
              {isGenerating ? 'Thinking...' : 'Ready'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {onToggleReflection && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleReflection}
              className={cn(
                'transition-mystic',
                showReflection && 'bg-mystic-cyan/10 text-mystic-cyan'
              )}
            >
              Reflection
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => updateSettings({ enabled: !settings.enabled })}
            className="transition-mystic"
          >
            {settings.enabled ? (
              <Volume2 className="h-4 w-4 text-mystic-cyan" />
            ) : (
              <VolumeX className="h-4 w-4 text-mystic-silver" />
            )}
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => {
            const uiMessage = formatMessage(message);
            return (
              <div
                key={message.id}
                className={cn(
                  'flex animate-fade-in-up',
                  uiMessage.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-xl px-4 py-3 shadow-mystic transition-mystic',
                    uiMessage.sender === 'user'
                      ? 'bg-primary text-primary-foreground ml-12'
                      : 'glass-soul mr-12 hover:shadow-soul'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {uiMessage.sender === 'ishraya' && (
                      <SoulRing size="sm" isActive={false} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {uiMessage.content}
                      </p>
                      <div className="flex items-center justify-between mt-2 gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTime(uiMessage.timestamp)}
                        </span>
                        {uiMessage.sender === 'ishraya' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSpeakToggle(uiMessage.content)}
                            className="h-6 w-6 p-0 transition-mystic hover:bg-mystic-cyan/10"
                          >
                            {isSpeaking ? (
                              <VolumeX className="h-3 w-3" />
                            ) : (
                              <Volume2 className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Generating indicator */}
          {isGenerating && (
            <div className="flex justify-start animate-fade-in-up">
              <div className="glass-soul mr-12 rounded-xl px-4 py-3 shadow-soul">
                <div className="flex items-center gap-3">
                  <SoulRing size="sm" isActive={true} />
                  <div className="flex space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-soul-glow rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-mystic-silver/20 p-4 glass-mystic">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Listening..." : "Message Ishraya..."}
              className={cn(
                'resize-none min-h-[44px] max-h-32 glass-mystic border-mystic-silver/30 transition-mystic',
                'focus:border-mystic-cyan focus:shadow-soul',
                isListening && 'border-soul-glow animate-pulse'
              )}
              rows={1}
              disabled={isGenerating}
            />
          </div>
          
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleVoiceToggle}
            className={cn(
              'glass-mystic shadow-mystic transition-mystic border-mystic-silver/30',
              isListening 
                ? 'border-soul-glow shadow-soul text-soul-glow' 
                : 'hover:shadow-soul hover:border-mystic-cyan'
            )}
          >
            {isListening ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            type="submit"
            disabled={!input.trim() || isGenerating}
            className={cn(
              'shadow-mystic transition-mystic',
              'hover:shadow-soul disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};