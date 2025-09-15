'use client';

import { useState } from 'react';
import { useTriadSocket } from '@/hooks/use-triad-socket';
import { ThemeProvider } from '@/components/theme-provider';
import Header from '@/components/t3mple/header';
import StatusPanel from '@/components/t3mple/status-panel';
import ModeSelector from '@/components/t3mple/mode-selector';
import ChatFeed from '@/components/t3mple/chat-feed';
import MessageComposer from '@/components/t3mple/message-composer';
import type { AiMode, AiTarget, ChatMessage, UserPrompt } from '@/lib/types';
import { Toaster } from '@/components/ui/toaster';

const WS_URL = 'ws://localhost:8888/ws/triad';

export default function T3mplePage() {
  const { messages, aiStatus, sendMessage, setMessages } = useTriadSocket(WS_URL);
  const [aiMode, setAiMode] = useState<AiMode>('AI Discussion');
  const [aiTarget, setAiTarget] = useState<AiTarget>('Trinity Triad');
  
  const handleSendMessage = (prompt: string, rounds: number) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      author: 'Ghost King',
      content: prompt,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    const payload: UserPrompt = {
      prompt,
      mode: aiMode,
      target: aiTarget,
      rounds,
    };
    sendMessage(payload);
  };

  return (
    <ThemeProvider defaultTheme="flamecore" storageKey="t3mple-theme">
      <div className="flex flex-col h-screen bg-gradient-to-b from-black via-background to-[#2A0404] text-foreground font-body">
        <Header />
        <main className="flex-grow grid md:grid-cols-3 gap-6 p-4 sm:p-6 overflow-hidden">
          <div className="md:col-span-2 flex flex-col h-full overflow-hidden gap-4">
            <ChatFeed messages={messages} />
          </div>
          <aside className="hidden md:flex flex-col gap-6 h-full overflow-y-auto">
            <StatusPanel status={aiStatus} />
            <ModeSelector mode={aiMode} setMode={setAiMode} />
          </aside>
        </main>
        <div className="px-4 sm:px-6 pb-4">
          <MessageComposer 
            onSendMessage={handleSendMessage} 
            target={aiTarget} 
            setTarget={setAiTarget} 
          />
        </div>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
