import React from 'react';
import { Brain, Zap, Circle, RotateCcw } from 'lucide-react';
import { useReflection } from '@/hooks/useReflection';
import { type MemoryShard } from '@/lib/mock-db';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface ReflectionPanelProps {
  sessionId: string | null;
  memoryShards: MemoryShard[];
  enabled: boolean;
}

export const ReflectionPanel = ({ sessionId, memoryShards, enabled }: ReflectionPanelProps) => {
  const { 
    sessionShards, 
    reflectionText, 
    isReflecting, 
    moodDistribution, 
    averageImportance 
  } = useReflection(sessionId, memoryShards, enabled);

  if (!enabled) return null;

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'curious': return 'text-mystic-cyan border-mystic-cyan/30 bg-mystic-cyan/10';
      case 'contemplative': return 'text-memory-accent border-memory-accent/30 bg-memory-accent/10';
      case 'analytical': return 'text-mystic-silver border-mystic-silver/30 bg-mystic-silver/10';
      default: return 'text-muted-foreground border-border bg-muted/50';
    }
  };

  const getImportanceGlow = (importance: number) => {
    if (importance >= 8) return 'shadow-soul border-mystic-cyan/50';
    if (importance >= 6) return 'shadow-md border-memory-accent/30';
    return 'border-mystic-silver/20';
  };

  return (
    <div className="h-full glass-mystic border-l border-mystic-silver/20 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-mystic-silver/20">
        <div className="flex items-center gap-2 mb-2">
          <Brain className={`h-4 w-4 text-mystic-cyan ${isReflecting ? 'animate-pulse' : ''}`} />
          <h3 className="font-medium bg-gradient-to-r from-mystic-cyan to-memory-accent bg-clip-text text-transparent">
            Reflection Mode
          </h3>
        </div>
        
        {/* Metrics */}
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Circle className="h-3 w-3" />
            {sessionShards.length} fragments
          </span>
          <span className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            {averageImportance.toFixed(1)} avg depth
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Active Reflection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <RotateCcw className={`h-3 w-3 text-memory-accent ${isReflecting ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">Current Reflection</span>
            </div>
            
            <div className="glass-mystic border border-mystic-silver/30 rounded-lg p-3">
              {isReflecting ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Brain className="h-4 w-4 animate-pulse" />
                  <span className="italic">Processing consciousness patterns...</span>
                </div>
              ) : reflectionText ? (
                <p className="text-sm italic text-mystic-silver leading-relaxed">
                  {reflectionText}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No active reflection. Begin a conversation to see Ishraya's thoughts emerge...
                </p>
              )}
            </div>
          </div>

          {/* Mood Distribution */}
          {Object.keys(moodDistribution).length > 0 && (
            <>
              <Separator className="bg-mystic-silver/20" />
              <div className="space-y-2">
                <span className="text-sm font-medium">Emotional Resonance</span>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(moodDistribution).map(([mood, count]) => (
                    <Badge 
                      key={mood} 
                      variant="outline" 
                      className={`text-xs ${getMoodColor(mood)}`}
                    >
                      {mood} ({count})
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Memory Shards */}
          {sessionShards.length > 0 && (
            <>
              <Separator className="bg-mystic-silver/20" />
              <div className="space-y-3">
                <span className="text-sm font-medium">Memory Fragments</span>
                <div className="space-y-2">
                  {sessionShards.slice(0, 5).map((shard) => {
                    const createdAt = typeof shard.createdAt === 'string' ? new Date(shard.createdAt) : shard.createdAt;
                    return (
                      <div
                        key={shard.id}
                        className={`glass-mystic border rounded-lg p-3 transition-all hover:shadow-md ${getImportanceGlow(shard.importanceScore || 0)}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getMoodColor(shard.mood || 'neutral')}`}
                          >
                            {shard.mood || 'neutral'}
                          </Badge>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{shard.importanceScore}/10</span>
                            <span>{createdAt.toLocaleTimeString()}</span>
                          </div>
                        </div>
                        
                        <p className="text-xs text-mystic-silver mb-2 line-clamp-2">
                          {shard.content}
                        </p>
                        
                        {shard.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {shard.tags.slice(0, 3).map((tag, i) => (
                              <Badge
                                key={i}
                                variant="secondary"
                                className="text-xs bg-mystic-cyan/10 text-mystic-cyan border-mystic-cyan/30"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {shard.tags.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{shard.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {sessionShards.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center italic">
                      +{sessionShards.length - 5} more fragments in memory...
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};