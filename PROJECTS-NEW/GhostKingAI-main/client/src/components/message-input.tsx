import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSendMessage, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 128) + 'px';
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceInput = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      toast({
        title: "Voice Input",
        description: "Voice input feature coming soon!",
      });
    } else {
      // Check for speech recognition support
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        toast({
          title: "Not Supported",
          description: "Voice input is not supported in this browser.",
          variant: "destructive",
        });
        return;
      }

      // Start recording simulation
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        toast({
          title: "Voice Input",
          description: "Voice input feature coming soon!",
        });
      }, 2000);
    }
  };

  return (
    <div className="p-4 border-t border-border bg-card">
      <div className="flex items-end space-x-3">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            placeholder="Ask me anything..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full bg-input border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring min-h-[44px] max-h-32 pr-12"
            rows={1}
            disabled={disabled}
            data-testid="input-message"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleVoiceInput}
            className="absolute right-2 bottom-2 p-2 text-muted-foreground hover:text-foreground transition-colors touch-feedback"
            data-testid="button-voice-input"
          >
            {isRecording ? <Square size={16} /> : <Mic size={16} />}
          </Button>
        </div>
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="bg-primary text-primary-foreground rounded-lg p-3 hover:bg-primary/90 transition-colors touch-feedback disabled:opacity-50 disabled:cursor-not-allowed min-w-[44px] min-h-[44px] flex items-center justify-center"
          data-testid="button-send-message"
        >
          <Send size={16} />
        </Button>
      </div>

      {/* Recording Indicator */}
      {isRecording && (
        <div className="mt-2 flex items-center justify-center space-x-2 text-destructive" data-testid="recording-indicator">
          <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
          <span className="text-sm">Recording...</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsRecording(false)}
            className="text-destructive hover:text-destructive/80 transition-colors"
            data-testid="button-stop-recording"
          >
            <Square size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}
