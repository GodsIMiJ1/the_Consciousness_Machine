import { useEffect, useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDeviceId } from '@/lib/device-id';
import { api, type ChatMessage, type Conversation } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import ChatMessageComponent from '@/components/chat-message';
import MessageInput from '@/components/message-input';
import QuickActions from '@/components/quick-actions';
import SettingsPanel from '@/components/settings-panel';
import IntegrationsPanel from '@/components/integrations-panel';
import { Ghost, Settings, Plug, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Chat() {
  const [deviceId] = useState(() => getDeviceId());
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get device info
  const { data: device } = useQuery({
    queryKey: ['/api/device', deviceId],
    queryFn: () => api.getDevice(deviceId),
  });

  // Get conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ['/api/conversations', deviceId],
    queryFn: () => api.getConversations(deviceId),
  });

  // Get integrations
  const { data: integrations = [] } = useQuery({
    queryKey: ['/api/integrations', deviceId],
    queryFn: () => api.getIntegrations(deviceId),
  });

  // Get messages for current conversation
  const { data: messages = [] } = useQuery({
    queryKey: ['/api/messages', currentConversationId],
    queryFn: () => currentConversationId ? api.getMessages(currentConversationId) : [],
    enabled: !!currentConversationId,
  });

  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: (title?: string) => api.createConversation(deviceId, title),
    onSuccess: (conversation) => {
      setCurrentConversationId(conversation.id);
      queryClient.invalidateQueries({ queryKey: ['/api/conversations', deviceId] });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ conversationId, message }: { conversationId: string; message: string }) =>
      api.sendMessage(conversationId, message, deviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages', currentConversationId] });
      queryClient.invalidateQueries({ queryKey: ['/api/conversations', deviceId] });
      setIsTyping(false);
    },
    onError: (error) => {
      setIsTyping(false);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Initialize conversation if none exists
  useEffect(() => {
    if (conversations.length > 0 && !currentConversationId) {
      setCurrentConversationId(conversations[0].id);
    } else if (conversations.length === 0 && !createConversationMutation.isPending) {
      createConversationMutation.mutate("New Chat");
    }
  }, [conversations, currentConversationId, createConversationMutation]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (message: string) => {
    if (!currentConversationId || !message.trim()) return;

    setIsTyping(true);
    sendMessageMutation.mutate({ conversationId: currentConversationId, message });
  };

  const handleQuickAction = (action: string) => {
    const actionMessages = {
      schedule: "Check my schedule for today",
      tasks: "Show me my current tasks",
      email: "Give me a summary of my recent emails",
      weather: "What's the weather like today?",
    };

    const message = actionMessages[action as keyof typeof actionMessages];
    if (message) {
      handleSendMessage(message);
    }
  };

  const activeIntegrations = integrations.filter(i => i.isActive);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-card border-x border-border">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-card border-b border-border sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <Ghost className="text-primary-foreground" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Omari, Spirit of Old</h1>
            <div className="flex items-center space-x-2">
              <Circle className="w-2 h-2 fill-chart-1 text-chart-1" />
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowIntegrations(!showIntegrations)}
            className="text-muted-foreground hover:text-foreground transition-colors touch-feedback"
            data-testid="button-toggle-integrations"
          >
            <Plug size={18} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(true)}
            className="text-muted-foreground hover:text-foreground transition-colors touch-feedback"
            data-testid="button-open-settings"
          >
            <Settings size={18} />
          </Button>
        </div>
      </header>

      {/* Integrations Panel */}
      <IntegrationsPanel
        isVisible={showIntegrations}
        integrations={activeIntegrations}
        onClose={() => setShowIntegrations(false)}
      />

      {/* Main Chat */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar hide-scrollbar"
          data-testid="chat-container"
        >
          {messages.length === 0 && (
            <div className="flex items-start space-x-3 chat-message">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Ghost className="text-primary-foreground" size={16} />
              </div>
              <div className="flex-1">
                <div className="bg-secondary rounded-lg rounded-tl-none p-3 max-w-[85%]">
                  <p className="text-secondary-foreground text-sm">
                    Hello! I'm your AI personal assistant. I can help you with daily tasks, manage your calendar, and coordinate with your other apps. What would you like me to help you with today?
                  </p>
                </div>
                <span className="text-xs text-muted-foreground mt-1 block">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <ChatMessageComponent key={message.id} message={message} />
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start space-x-3 typing-indicator" data-testid="typing-indicator">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Ghost className="text-primary-foreground" size={16} />
              </div>
              <div className="bg-secondary rounded-lg rounded-tl-none p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <QuickActions onAction={handleQuickAction} />

        {/* Message Input */}
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={sendMessageMutation.isPending}
        />
      </main>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        device={device}
        integrations={integrations}
        deviceId={deviceId}
      />
    </div>
  );
}
