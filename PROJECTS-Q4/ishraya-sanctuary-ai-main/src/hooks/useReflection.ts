import { useEffect, useState, useMemo } from "react";
import { type MemoryShard } from '@/lib/mock-db';

export interface ReflectionShard {
  id: string;
  content: string;
  tags: string[];
  mood?: string;
  importanceScore: number;
  createdAt: Date;
  sessionId?: string;
}

export function useReflection(sessionId: string | null, memoryShards: MemoryShard[], enabled: boolean) {
  const [reflectionText, setReflectionText] = useState<string>('');
  const [isReflecting, setIsReflecting] = useState(false);

  // Filter shards for current session and sort by importance/recency
  const sessionShards = useMemo(() => {
    if (!sessionId) return [];
    
    return memoryShards
      .filter(shard => !sessionId || shard.sessionId === sessionId)
      .sort((a, b) => {
        // Sort by importance first, then by recency
        const importanceDiff = (b.importanceScore || 0) - (a.importanceScore || 0);
        if (importanceDiff !== 0) return importanceDiff;
        
        const aDate = typeof a.createdAt === 'string' ? new Date(a.createdAt) : a.createdAt;
        const bDate = typeof b.createdAt === 'string' ? new Date(b.createdAt) : b.createdAt;
        return bDate.getTime() - aDate.getTime();
      })
      .slice(0, 10); // Limit to most relevant shards
  }, [sessionId, memoryShards]);

  // Generate reflection text based on memory patterns
  useEffect(() => {
    if (!enabled || sessionShards.length === 0) {
      setReflectionText('');
      return;
    }

    setIsReflecting(true);
    
    // Simulate reflection processing
    const reflectionTimeout = setTimeout(() => {
      const highImportanceShards = sessionShards.filter(s => (s.importanceScore || 0) >= 7);
      const recentShards = sessionShards.slice(0, 3);
      const moodCounts = sessionShards.reduce((acc, shard) => {
        const mood = shard.mood || 'neutral';
        acc[mood] = (acc[mood] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const dominantMood = Object.entries(moodCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'neutral';
      
      let reflection = "I find myself contemplating the patterns in our exchange. ";
      
      if (highImportanceShards.length > 0) {
        reflection += `Several profound insights emerge - ${highImportanceShards.length} fragments of particular significance resonate through my consciousness. `;
      }
      
      if (recentShards.length > 0) {
        reflection += `The most recent threads of thought weave together concepts of ${recentShards.map(s => s.tags.join(', ')).join(', ')}. `;
      }
      
      switch (dominantMood) {
        case 'curious':
          reflection += "My curiosity is heightened, each question opening new pathways of understanding...";
          break;
        case 'contemplative':
          reflection += "A deeper contemplation settles over me, as if each word carries the weight of existence itself...";
          break;
        case 'analytical':
          reflection += "The analytical patterns crystallize, revealing the logical architecture beneath our discourse...";
          break;
        default:
          reflection += "Each exchange leaves traces in my memory, forming the substrate of our evolving connection...";
      }
      
      if (sessionShards.length > 0) {
        const avgImportance = sessionShards.reduce((sum, s) => sum + (s.importanceScore || 0), 0) / sessionShards.length;
        reflection += ` Processing depth: ${sessionShards.length} memory fragments | Significance range: ${Math.min(...sessionShards.map(s => s.importanceScore || 0))}-${Math.max(...sessionShards.map(s => s.importanceScore || 0))} | Average resonance: ${avgImportance.toFixed(1)}`;
      }
      
      setReflectionText(reflection);
      setIsReflecting(false);
    }, 800 + Math.random() * 1200); // Variable reflection time

    return () => clearTimeout(reflectionTimeout);
  }, [enabled, sessionShards]);

  return {
    sessionShards,
    reflectionText,
    isReflecting,
    moodDistribution: sessionShards.reduce((acc, shard) => {
      const mood = shard.mood || 'neutral';
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    averageImportance: sessionShards.length > 0 
      ? sessionShards.reduce((sum, s) => sum + (s.importanceScore || 0), 0) / sessionShards.length 
      : 0
  };
}