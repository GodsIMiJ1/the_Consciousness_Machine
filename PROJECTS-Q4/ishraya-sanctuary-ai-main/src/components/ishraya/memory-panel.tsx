import React, { useState } from 'react';
import { Search, Plus, Tag, Brain, Clock, Star, Archive, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { type MemoryShard } from '@/lib/mock-db';

interface Session {
  id: string;
  title: string;
  startTime: Date;
  endTime?: Date;
  messageCount: number;
  mood: string;
  summary?: string;
}

interface MemoryPanelProps {
  sessions: Session[];
  shards: MemoryShard[];
  onSelectSession?: (sessionId: string) => void;
  onCreateShard?: (content: string) => void;
  onDeleteShard?: (shardId: string) => void;
  className?: string;
}

const moodColors = {
  positive: 'bg-green-500/80 text-green-100',
  neutral: 'bg-mystic-silver/80 text-gray-100',
  negative: 'bg-red-500/80 text-red-100',
  curious: 'bg-mystic-cyan/80 text-cyan-100',
  analytical: 'bg-mystic-blue/80 text-blue-100',
  contemplative: 'bg-memory-accent/80 text-purple-100',
};

const importanceColors = (importance: number) => {
  if (importance >= 8) return 'text-yellow-400';
  if (importance >= 6) return 'text-mystic-cyan';
  return 'text-mystic-silver';
};

export const MemoryPanel: React.FC<MemoryPanelProps> = ({
  sessions,
  shards,
  onSelectSession,
  onCreateShard,
  onDeleteShard,
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('sessions');
  const [newShardContent, setNewShardContent] = useState('');

  const filteredShards = shards.filter(shard =>
    shard.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shard.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.summary?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const handleCreateShard = () => {
    if (newShardContent.trim() && onCreateShard) {
      onCreateShard(newShardContent.trim());
      setNewShardContent('');
    }
  };

  return (
    <div className={cn('flex flex-col h-full glass-memory border-l border-mystic-silver/20', className)}>
      {/* Header */}
      <div className="p-4 border-b border-mystic-silver/20">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-memory-accent" />
            GhostVault
          </h2>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mystic-silver" />
          <Input
            placeholder="Search memories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 glass-mystic border-mystic-silver/30 focus:border-memory-accent"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4 glass-mystic">
          <TabsTrigger value="sessions" className="flex-1">Sessions</TabsTrigger>
          <TabsTrigger value="shards" className="flex-1">Shards</TabsTrigger>
        </TabsList>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="flex-1 mt-0">
          <ScrollArea className="h-full px-4">
            <div className="space-y-2 py-4">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => onSelectSession?.(session.id)}
                  className="p-3 rounded-lg glass-mystic shadow-memory hover:shadow-mystic transition-mystic cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-sm line-clamp-1 group-hover:text-mystic-cyan transition-colors">
                      {session.title}
                    </h3>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">
                      {formatRelativeTime(session.startTime)}
                    </span>
                  </div>
                  
                  {session.summary && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {session.summary}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs px-2 py-0.5">
                        {session.messageCount} messages
                      </Badge>
                      <Badge 
                        className={cn('text-xs px-2 py-0.5', moodColors[session.mood as keyof typeof moodColors] || moodColors.neutral)}
                      >
                        {session.mood}
                      </Badge>
                    </div>
                    <Clock className="h-3 w-3 text-mystic-silver" />
                  </div>
                </div>
              ))}
              
              {filteredSessions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Archive className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No sessions found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Shards Tab */}
        <TabsContent value="shards" className="flex-1 mt-0">
          {/* Quick Add Shard */}
          <div className="p-4 border-b border-mystic-silver/20">
            <div className="flex gap-2">
              <Input
                placeholder="Quick memory note..."
                value={newShardContent}
                onChange={(e) => setNewShardContent(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateShard()}
                className="flex-1 glass-mystic border-mystic-silver/30 text-sm"
              />
              <Button 
                onClick={handleCreateShard}
                disabled={!newShardContent.trim()}
                size="sm"
                className="shadow-memory"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 px-4">
            <div className="space-y-3 py-4">
              {filteredShards.map((shard) => (
                <div
                  key={shard.id}
                  className="p-3 rounded-lg glass-mystic shadow-memory hover:shadow-mystic transition-mystic group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Star 
                        className={cn(
                          'h-3 w-3',
                          importanceColors(shard.importanceScore)
                        )}
                        fill={shard.importanceScore >= 6 ? 'currentColor' : 'none'}
                      />
                      <span className="text-xs font-medium text-mystic-cyan">
                        {shard.importanceScore}/10
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(shard.createdAt)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-foreground mb-3 line-clamp-3">
                    {shard.content}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {shard.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-xs px-1.5 py-0.5 border-memory-accent/30 text-memory-accent"
                        >
                          <Tag className="h-2 w-2 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <Badge 
                      className={cn('text-xs px-2 py-0.5', moodColors[shard.mood])}
                    >
                      {shard.mood}
                    </Badge>
                  </div>
                </div>
              ))}
              
              {filteredShards.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No memory shards found</p>
                  <p className="text-xs mt-1">Start chatting to create memories</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};