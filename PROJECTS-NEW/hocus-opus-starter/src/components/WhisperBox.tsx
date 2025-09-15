// PROJECT FLAMEBRIDGE - WhisperBox Component
// Ghost's Domain: UI vision, Whisper Flow, Flame calibration

import { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, Send, Flame } from 'lucide-react';

interface WhisperBoxProps {
  onSendMessage: (content: string, isWhisper: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function WhisperBox({ onSendMessage, disabled = false, placeholder = "Speak to the flame..." }: WhisperBoxProps) {
  const [message, setMessage] = useState('');
  const [isWhisperMode, setIsWhisperMode] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim(), isWhisperMode);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleWhisperMode = () => {
    setIsWhisperMode(!isWhisperMode);
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="relative">
      {/* Visibility Toggle */}
      <button
        onClick={toggleVisibility}
        className="absolute -top-8 right-0 p-1 text-ash hover:text-flame-500 transition-colors"
        title={isVisible ? "Hide whisper box" : "Show whisper box"}
      >
        {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>

      {/* Main Whisper Box */}
      <div className={`transition-all duration-300 ${isVisible ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden'}`}>
        <form onSubmit={handleSubmit} className="relative">
          {/* Whisper Mode Indicator */}
          {isWhisperMode && (
            <div className="absolute -top-6 left-0 text-xs text-whisper font-mono animate-whisper-fade">
              🤫 WHISPER MODE ACTIVE
            </div>
          )}

          <div className={`relative rounded-xl border-2 transition-all duration-300 ${
            isWhisperMode
              ? 'border-whisper bg-whisper/10 shadow-lg shadow-whisper/20'
              : 'border-flame-500 bg-coal/50 shadow-lg shadow-flame-500/20'
          }`}>
            {/* Flame Decoration */}
            <div className={`absolute -top-2 -left-2 p-1 rounded-full transition-all duration-300 ${
              isWhisperMode ? 'bg-whisper text-white' : 'bg-flame-500 text-white animate-flame-flicker'
            }`}>
              <Flame size={12} />
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isWhisperMode ? "Whisper to the shadows..." : placeholder}
              disabled={disabled}
              className={`w-full p-4 pr-20 bg-transparent text-white placeholder-ash resize-none outline-none font-mono text-sm min-h-[60px] max-h-32 ${
                isWhisperMode ? 'text-whisper placeholder-whisper/60' : ''
              }`}
              rows={1}
            />

            {/* Controls */}
            <div className="absolute bottom-2 right-2 flex items-center gap-2">
              {/* Whisper Toggle */}
              <button
                type="button"
                onClick={toggleWhisperMode}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  isWhisperMode
                    ? 'bg-whisper text-white shadow-lg'
                    : 'bg-ash text-flame-500 hover:bg-flame-500 hover:text-white'
                }`}
                title={isWhisperMode ? "Exit whisper mode" : "Enter whisper mode"}
              >
                {isWhisperMode ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!message.trim() || disabled}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  message.trim() && !disabled
                    ? isWhisperMode
                      ? 'bg-whisper text-white hover:bg-whisper/80 shadow-lg'
                      : 'bg-flame-500 text-white hover:bg-flame-600 shadow-lg animate-flame-flicker'
                    : 'bg-ash text-ash cursor-not-allowed'
                }`}
                title="Send message"
              >
                <Send size={16} />
              </button>
            </div>
          </div>

          {/* Character Count */}
          <div className="mt-1 text-xs text-ash text-right font-mono">
            {message.length} chars {isWhisperMode && '• WHISPERED'}
          </div>
        </form>
      </div>
    </div>
  );
}
