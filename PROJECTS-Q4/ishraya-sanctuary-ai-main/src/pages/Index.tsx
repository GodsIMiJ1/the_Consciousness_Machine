import React, { useState, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { SidebarProvider } from '@/components/ui/sidebar';
import { GlyphBackground } from '@/components/ishraya/glyph-background';
import { ChatInterface } from '@/components/ishraya/chat-interface';
import { MemoryPanel } from '@/components/ishraya/memory-panel';
import { ModelSwitcher } from '@/components/ishraya/model-switcher';
import { ReflectionPanel } from '@/components/ishraya/reflection-panel';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';
import { Brain, MessageSquare, RotateCcw, Plus } from 'lucide-react';
import { useIshraya } from '@/hooks/useIshraya';
import { toast } from '@/hooks/use-toast';
// Import demo data seeder
import '@/lib/demo-seeder';

const Index = () => {
  const {
    currentSession,
    messages,
    memoryShards,
    sessions,
    isGenerating,
    isLoadingSessions,
    isLoadingShards,
    error,
    createNewSession,
    loadSession,
    sendMessage,
    createMemoryShard,
    deleteMemoryShard,
  } = useIshraya();

  const [showMemoryPanel, setShowMemoryPanel] = useState(true);
  const [showReflection, setShowReflection] = useState(false);
  const [selectedModel, setSelectedModel] = useState('hermes-3-llama-3.1-8b');

  const handleSendMessage = async (content: string) => {
    await sendMessage(content, selectedModel);
  };

  const handleCreateShard = (content: string) => {
    createMemoryShard(content, ['manual'], 'neutral', 5);
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    toast({
      title: "Model Changed",
      description: `Switched to ${modelId.replace('-', ' ').toUpperCase()}`
    });
  };

  const handleSelectSession = (sessionId: string) => {
    loadSession(sessionId);
  };

  // Convert sessions to the format expected by MemoryPanel
  const formattedSessions = sessions.map(session => ({
    id: session.id,
    title: session.title || 'Untitled Session',
    startTime: typeof session.createdAt === 'string' ? new Date(session.createdAt) : session.createdAt,
    messageCount: messages.filter(msg => msg.sessionId === session.id).length,
    mood: 'curious',
    summary: `Session started ${new Date(session.createdAt).toLocaleDateString()}`
  }));

  // Convert memory shards to the format expected by MemoryPanel  
  const formattedShards = memoryShards.map(shard => ({
    ...shard,
    updatedAt: shard.updatedAt || shard.createdAt,
  }));

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-gradient-mystic relative overflow-hidden">
        <GlyphBackground />
        
        {/* Header */}
        <header className="relative z-10 h-14 glass-mystic border-b border-mystic-silver/20 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Brain className="h-6 w-6 text-mystic-cyan" />
            <h1 className="text-lg font-semibold bg-gradient-to-r from-mystic-cyan to-memory-accent bg-clip-text text-transparent">
              Ishraya
            </h1>
            <span className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-mystic-cyan/10">
              Hermes Sanctuary
            </span>
            {currentSession && (
              <span className="text-xs text-mystic-silver">
                {currentSession.title || 'Active Session'}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={createNewSession}
              className="glass-mystic transition-mystic border-mystic-silver/30 hover:shadow-soul text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              New Session
            </Button>
            <ModelSwitcher 
              selectedModel={selectedModel}
              onModelChange={handleModelChange}
              className="w-64"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowMemoryPanel(!showMemoryPanel)}
              className={`glass-mystic transition-mystic ${showMemoryPanel ? 'bg-mystic-cyan/10 border-mystic-cyan/30' : ''}`}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            <ThemeToggle />
          </div>
        </header>

        {/* Loading States */}
        {(isLoadingSessions || isLoadingShards) && (
          <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
              <Brain className="h-8 w-8 text-mystic-cyan animate-pulse mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Initializing Ishraya...</p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-destructive/90 backdrop-blur-sm text-destructive-foreground px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Main Content */}
        <div className="relative z-10 h-[calc(100vh-3.5rem)]">
          <PanelGroup direction="horizontal">
            {/* Chat Area */}
            <Panel defaultSize={showMemoryPanel ? 70 : 100} minSize={50}>
              <div className="h-full">
                {showReflection ? (
                  <PanelGroup direction="vertical">
                    {/* Main Chat */}
                    <Panel defaultSize={70} minSize={40}>
                      <ChatInterface
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        isGenerating={isGenerating}
                        showReflection={showReflection}
                        onToggleReflection={() => setShowReflection(!showReflection)}
                      />
                    </Panel>
                    
                    <PanelResizeHandle className="h-2 bg-mystic-silver/10 hover:bg-mystic-cyan/20 transition-colors" />
                    
                    {/* Reflection Panel */}
                    <Panel defaultSize={30} minSize={20}>
                      <ReflectionPanel
                        sessionId={currentSession?.id || null}
                        memoryShards={memoryShards}
                        enabled={showReflection}
                      />
                    </Panel>
                  </PanelGroup>
                ) : (
                  <ChatInterface
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isGenerating={isGenerating}
                    showReflection={showReflection}
                    onToggleReflection={() => setShowReflection(!showReflection)}
                  />
                )}
              </div>
            </Panel>

            {/* Memory Panel */}
            {showMemoryPanel && (
              <>
                <PanelResizeHandle className="w-2 bg-mystic-silver/10 hover:bg-mystic-cyan/20 transition-colors" />
                <Panel defaultSize={30} minSize={20} maxSize={50}>
                  <MemoryPanel
                    sessions={formattedSessions}
                    shards={formattedShards}
                    onSelectSession={handleSelectSession}
                    onCreateShard={handleCreateShard}
                    onDeleteShard={deleteMemoryShard}
                  />
                </Panel>
              </>
            )}
          </PanelGroup>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;