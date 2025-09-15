import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import PTTButton from "@/components/PTTButton";
import { Send, Volume2 } from "lucide-react";
import { getDeviceId } from "@/lib/device";
import { loadMessages, saveMessages } from "@/lib/chatStorage";
import type { ChatMessage } from "@/lib/chatStorage";
import { getChatResponse, isOpenAIConfigured } from "@/lib/openai";


export default function Chat() {
  const [deviceId] = useState<string>(() => getDeviceId());
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm AURA-BREE, your therapeutic companion. How are you feeling today? You can type or use voice to talk with me.",
      timestamp: Date.now() - 5000
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

useEffect(() => {
  scrollToBottom();
}, [messages]);

useEffect(() => {
  const stored = loadMessages(deviceId);
  if (stored && stored.length) {
    setMessages(stored);
  } else {
    saveMessages(deviceId, messages);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [deviceId]);

useEffect(() => {
  if (deviceId) {
    saveMessages(deviceId, messages);
  }
}, [messages, deviceId]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Check if OpenAI is configured
    if (!isOpenAIConfigured()) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'OpenAI API key is not configured. Please add your VITE_OPENAI_API_KEY to the .env file.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

const userMessage: ChatMessage = {
  id: Date.now().toString(),
  role: 'user',
  content: content.trim(),
  timestamp: Date.now()
};

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages.slice(-15).map(m => ({ role: m.role, content: m.content }));
      const chatMessages = [...history, { role: 'user' as const, content: content.trim() }];

      const text = await getChatResponse(chatMessages);
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: text,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, assistantMessage]);
      speakMessage(assistantMessage.content);
    } catch (err: any) {
      console.error('AI chat error:', err);
      const fallback: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: err.message || 'I had trouble connecting to the AI just now. Please try again.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, fallback]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceResult = (text: string) => {
    sendMessage(text);
  };

  const speakMessage = (text: string) => {
    // Web Speech API - replace with better TTS implementation
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const generateTherapeuticResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('anxious') || input.includes('anxiety') || input.includes('panic')) {
      return "I hear that you're feeling anxious. That's completely valid. Let's try a grounding technique: Can you name 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste?";
    }
    
    if (input.includes('sad') || input.includes('depressed') || input.includes('down')) {
      return "I'm sorry you're feeling this way. Your feelings are valid, and it's okay to not be okay sometimes. What's one small thing that brought you even a moment of comfort today?";
    }
    
    if (input.includes('angry') || input.includes('frustrated') || input.includes('mad')) {
      return "Anger can be a difficult emotion to manage. It often signals that something important to us has been threatened or hurt. Would you like to talk about what's underneath that anger?";
    }
    
    if (input.includes('stressed') || input.includes('overwhelmed')) {
      return "Feeling overwhelmed is your mind's way of saying you're carrying a lot right now. Let's break things down: What feels most urgent to you right now, and what might be able to wait?";
    }
    
    if (input.includes('thank you') || input.includes('thanks')) {
      return "You're very welcome. Remember, seeking support is a sign of strength, not weakness. I'm here whenever you need to talk.";
    }
    
    // Default empathetic response
    const responses = [
      "I hear you. Tell me more about what you're experiencing right now.",
      "That sounds really challenging. How are you coping with all of this?",
      "Thank you for sharing that with me. What would feel most helpful right now?",
      "I'm listening. Take your time - there's no rush to figure everything out at once.",
      "What you're feeling is completely valid. How can I best support you in this moment?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <Card
              className={`
                max-w-[85%] p-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-flame text-white border-primary/20'
                    : 'bg-card border-border'
                }
              `}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
              {message.role === 'assistant' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => speakMessage(message.content)}
                  className="mt-2 h-6 p-1 text-xs opacity-70 hover:opacity-100"
                >
                  <Volume2 className="w-3 h-3 mr-1" />
                  Speak
                </Button>
              )}
            </Card>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <Card className="max-w-[85%] p-4 bg-card border-border">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </Card>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 p-4 border-t border-border bg-card space-y-4">
        {/* Voice Input */}
        <div className="flex justify-center">
          <PTTButton onResult={handleVoiceResult} disabled={isLoading} />
        </div>
        
        {/* Text Input */}
<div className="flex gap-2">
  <Textarea
    value={input}
    onChange={(e) => setInput(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(input);
      }
    }}
    placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
    disabled={isLoading}
    className="flex-1 h-24 resize-none overflow-y-auto"
  />
  <Button
    onClick={() => sendMessage(input)}
    disabled={isLoading || !input.trim()}
    size="icon"
    className="bg-primary hover:bg-primary/90"
  >
    <Send className="w-4 h-4" />
  </Button>
</div>
      </div>
    </div>
  );
}