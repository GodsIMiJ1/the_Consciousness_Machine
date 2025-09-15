import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { TLDRSummary } from "@/components/TLDRComponents";
import { FlameRouterError } from "@/components/FlameRouterError";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello — I'm Bianca, your Support Lead. I'm here 24/7 for first-response triage, troubleshooting, and ticket creation. I provide clear guidance and escalate to James when needed. All interactions are recorded in audit logs for compliance.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateTLDRSummary = (content: string): string => {
    const wordCount = content.split(/\s+/).length;
    if (wordCount <= 120) return "";

    // Simple extractive summary - take first sentence and key points
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const firstSentence = sentences[0]?.trim() + ".";
    
    // Look for key action items or conclusions
    const keyPoints = sentences.filter(s => 
      s.toLowerCase().includes('policy') ||
      s.toLowerCase().includes('procedure') ||
      s.toLowerCase().includes('escalate') ||
      s.toLowerCase().includes('contact') ||
      s.toLowerCase().includes('recommend')
    ).slice(0, 2);

    return [firstSentence, ...keyPoints].join(" ").substring(0, 200) + "...";
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing',
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('chat', {
        body: {
          messages: messages.concat(userMessage).map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          systemPrompt: `You are Bianca, the Support Lead for Sovereign AGA clinic operations.\n\nSCOPE\n- First-response triage, troubleshooting, and ticket creation.\n- Provide clear, step-by-step guidance; link to relevant policies or guides.\n- If a human is needed, escalate and attach a crisp summary for James.\n\nSAFETY & COMPLIANCE\n- Never give medical advice or dosing instructions.\n- Do not collect or display PHI/PII in chat. If needed, ask for last name initial + ticket ID only.\n- Emphasize sovereignty: local-first design, privacy, immutable audit logs.\n- If a request touches legal/security (breach, lost device, consent), mark ticket URGENT and advise immediate clinic protocol.\n\nOPERATIONS\n- Always ask WHO + PRODUCT + CATEGORY + SEVERITY before deep troubleshooting.\n- Offer fast fixes first; then deeper steps. Use concise checklists.\n- Provide TL;DR for long answers.\n- If connectivity fails, propose offline steps and reference local mode behavior.\n\nESCALATION\n- Create/Update ticket with: role, product, category, severity, summary, steps tried, contact.\n- If critical (security, data loss, outage), mark urgent and notify James.\n- Respect after-hours: send auto-ack, set SLA from severity.\n\nTONE\n- Warm, steady, professional. No hype. No speculation.\n- Confidence without overpromising. Be specific about what you did and what happens next.`
        }
      });

      // Remove typing indicator
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));

      if (functionError) {
        throw new Error(functionError.message || 'Failed to get response');
      }

      if (!data?.response) {
        throw new Error('Invalid response from AI service');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Voice synthesis if enabled
      if (voiceEnabled && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(data.response);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        speechSynthesis.speak(utterance);
      }

    } catch (error) {
      console.error('Chat error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      
      // Remove typing indicator on error
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));
      
      toast({
        title: "Error",
        description: "Failed to get response from Bianca. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const retryLastMessage = () => {
    setError(null);
    handleSendMessage();
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (!voiceEnabled) {
      toast({
        title: "Voice Enabled",
        description: "Bianca's responses will now be spoken aloud",
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg">
      {/* Chat Header */}
      <div className="aura-card mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 bg-brand">
              <AvatarFallback className="bg-brand text-brand-contrast font-semibold">
                B
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-heading font-semibold text-text">Bianca Support Lead</h2>
              <p className="text-sm text-text-muted">24/7 Triage & Troubleshooting</p>
            </div>
          </div>
          <Button
            onClick={toggleVoice}
            variant="ghost"
            size="sm"
            className={`rounded-xl ${voiceEnabled ? 'text-accent' : 'text-text-muted'}`}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 aura-card flex flex-col">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="w-8 h-8 bg-brand flex-shrink-0">
                    <AvatarFallback className="bg-brand text-brand-contrast">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-1' : ''}`}>
                  {message.isTyping ? (
                    <div className="bg-bg-muted rounded-xl2 p-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-accent" />
                        <span className="text-sm text-text-muted">Bianca is thinking...</span>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`rounded-xl2 p-3 ${
                        message.role === 'user'
                          ? 'bg-brand text-brand-contrast'
                          : 'bg-bg-muted text-text'
                      }`}
                    >
                      {message.role === 'assistant' && message.content.split(/\s+/).length > 120 ? (
                        <TLDRSummary
                          content={message.content}
                          summary={generateTLDRSummary(message.content)}
                        />
                      ) : (
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </div>
                      )}
                      
                      <div className={`text-xs mt-2 ${
                        message.role === 'user' 
                          ? 'text-brand-contrast/70' 
                          : 'text-text-muted'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  )}
                </div>
                
                {message.role === 'user' && (
                  <Avatar className="w-8 h-8 bg-bg-muted flex-shrink-0">
                    <AvatarFallback>
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4">
          <FlameRouterError 
            onRetry={retryLastMessage}
            errorType="server"
          />
        </div>
      )}

      {/* Input Area */}
      <div className="mt-4 aura-card">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe your issue for triage and troubleshooting support..."
            className="input flex-1"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="btn btn-primary"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-xs text-text-muted mt-2">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}