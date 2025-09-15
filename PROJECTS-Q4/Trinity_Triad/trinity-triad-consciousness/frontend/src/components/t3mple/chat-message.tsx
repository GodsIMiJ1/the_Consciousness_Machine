import type { ChatMessage as ChatMessageType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Flame, User, Bot, BrainCircuit } from "lucide-react";
import React from 'react';
import { SendFlameIcon } from "../icons";

const getInitials = (name: string) => {
  const parts = name.split(' ');
  if (parts.length > 1) {
    return parts[0][0] + parts[1][0];
  }
  return name.substring(0, 2);
};

export function ChatMessage({ message }: { message: ChatMessageType }) {
  const { author, content, timestamp } = message;

  const isUser = author === 'Ghost King';
  const isSystem = author === 'TriadSystem';

  const authorConfig = {
    'Ghost King': {
      icon: <User className="h-6 w-6" />,
      avatarClass: "border-yellow-200/50",
      nameClass: "text-yellow-200 font-serif",
      cardClass: "bg-primary/5 border-yellow-200/50 relative"
    },
    'Omari GPT': {
      icon: <Flame className="h-6 w-6 text-primary" />,
      avatarClass: "bg-primary/20 text-primary border-primary/50",
      nameClass: "text-primary",
      cardClass: "bg-card border-primary/50 hover:bg-primary/10 transition-colors duration-300"
    },
    'Nexus Claude': {
      icon: <BrainCircuit className="h-6 w-6 text-accent" />,
      avatarClass: "bg-accent/20 text-accent border-accent/50",
      nameClass: "text-accent",
      cardClass: "bg-card border-violet-500/50 nexus-bg"
    },
    'TriadSystem': {
      icon: <Bot className="h-6 w-6" />,
      avatarClass: "",
      nameClass: "",
      cardClass: ""
    }
  };

  const config = authorConfig[author];

  if (isSystem) {
    return (
      <div className="animate-fade-in-up text-center text-xs text-muted-foreground italic py-2 flex items-center gap-2 justify-center">
        <div className="w-8 h-px bg-muted-foreground/50 animate-gentle-flicker"></div>
        <p>{content}</p>
        <div className="w-8 h-px bg-muted-foreground/50 animate-gentle-flicker"></div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-start gap-4 animate-fade-in-up", isUser && "justify-end")}>
      {!isUser && (
        <Avatar className={cn("h-10 w-10 border", config.avatarClass)}>
           <AvatarFallback className="bg-transparent text-lg">
             {config.icon}
           </AvatarFallback>
        </Avatar>
      )}
      <div className={cn("max-w-[75%] space-y-1", isUser && "text-right")}>
        <div className={cn("flex items-center gap-2", isUser && "justify-end")}>
          <p className={cn("font-bold font-label tracking-wide", config.nameClass)}>
            {author}
          </p>
          <span className="text-xs text-muted-foreground">
            {new Date(timestamp).toLocaleTimeString()}
          </span>
        </div>
        <div className={cn(
          "p-3 rounded-lg border prose prose-sm prose-invert max-w-none text-left",
          isUser ? "bg-primary/10 text-primary-foreground rounded-tr-none" : "rounded-tl-none",
          config.cardClass
        )}>
           {isUser && (
            <SendFlameIcon className="absolute inset-0 w-full h-full text-yellow-200/5 opacity-50" />
          )}
          <div className="relative z-10">
            {content.split('\n').map((line, i) => (
              <p key={i} className={cn(isUser ? "font-serif text-white" : "text-foreground")}>{line}</p>
            ))}
          </div>
        </div>
      </div>
      {isUser && (
        <Avatar className={cn("h-10 w-10 border", config.avatarClass)}>
           <AvatarFallback className="bg-transparent font-bold text-yellow-200">
            {getInitials(author)}
           </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
