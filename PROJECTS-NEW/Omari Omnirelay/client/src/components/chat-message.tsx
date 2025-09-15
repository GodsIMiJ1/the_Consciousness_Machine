import { type ChatMessage } from '@/lib/api';
import { Ghost, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: ChatMessage;
}

export default function ChatMessageComponent({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const timestamp = message.metadata?.timestamp
    ? new Date(message.metadata.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={cn(
      "flex items-start space-x-3 chat-message",
      isUser && "flex-row-reverse"
    )} data-testid={`message-${message.role}-${message.id}`}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
        isUser ? "bg-accent" : "bg-primary"
      )}>
        {isUser ? (
          <User className={cn(isUser ? "text-accent-foreground" : "text-primary-foreground")} size={16} />
        ) : (
          <Ghost className={cn(isUser ? "text-accent-foreground" : "text-primary-foreground")} size={16} />
        )}
      </div>
      <div className="flex-1">
        <div className={cn(
          "rounded-lg p-3 max-w-[85%]",
          isUser 
            ? "bg-primary rounded-tr-none ml-auto text-primary-foreground" 
            : "bg-secondary rounded-tl-none text-secondary-foreground"
        )}>
          <p className="text-sm" data-testid={`text-message-content-${message.id}`}>
            {message.content}
          </p>
          
          {/* Integration Data Display */}
          {message.metadata?.integrationData && (
            <div className="mt-3 space-y-2">
              {Array.isArray(message.metadata.integrationData) && 
                message.metadata.integrationData.map((item: any, index: number) => (
                  <div key={index} className="bg-background/50 rounded-md p-2 border border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{item.title}</span>
                      <span className="text-xs text-chart-2">{item.time}</span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                ))
              }
            </div>
          )}
        </div>
        <span className={cn(
          "text-xs text-muted-foreground mt-1 block",
          isUser && "text-right"
        )} data-testid={`text-timestamp-${message.id}`}>
          {timestamp}
        </span>
      </div>
    </div>
  );
}
