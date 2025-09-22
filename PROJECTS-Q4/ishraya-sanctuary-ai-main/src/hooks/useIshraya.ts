// React hooks for Ishraya integration
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { type Session, type Message, type MemoryShard } from '@/lib/mock-db';
import { toast } from './use-toast';

export interface IshrayaState {
  // Current session
  currentSession: Session | null;

  // Messages
  messages: Message[];
  isGenerating: boolean;
  streamingContent: string;

  // Memory
  memoryShards: MemoryShard[];

  // Sessions
  sessions: Session[];

  // Loading states
  isLoadingSessions: boolean;
  isLoadingMessages: boolean;
  isLoadingShards: boolean;

  // Connection status
  isLMStudioConnected: boolean;
  availableModels: string[];

  // Errors
  error: string | null;
}

export interface IshrayaActions {
  // Session management
  createNewSession: () => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;

  // Messaging
  sendMessage: (content: string, model?: string) => Promise<void>;
  sendStreamingMessage: (content: string, model?: string) => Promise<void>;

  // Memory management
  createMemoryShard: (content: string, tags?: string[], mood?: MemoryShard['mood'], importance?: number) => Promise<void>;
  deleteMemoryShard: (shardId: string) => Promise<void>;

  // Data refresh
  refreshSessions: () => Promise<void>;
  refreshMemoryShards: () => Promise<void>;

  // Connection status
  checkLMStudioConnection: () => Promise<boolean>;
  getAvailableModels: () => Promise<string[]>;

  // Error handling
  clearError: () => void;
}

export type UseIshrayaReturn = IshrayaState & IshrayaActions;

export const useIshraya = (): UseIshrayaReturn => {
  // State
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [memoryShards, setMemoryShards] = useState<MemoryShard[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingShards, setIsLoadingShards] = useState(true);
  const [isLMStudioConnected, setIsLMStudioConnected] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Error handler
  const handleError = useCallback((err: any, operation: string) => {
    console.error(`Error in ${operation}:`, err);
    setError(`Failed to ${operation}: ${err.message || 'Unknown error'}`);
    toast({
      title: "Error",
      description: `Failed to ${operation}`,
      variant: "destructive"
    });
  }, []);

  // Initialize - load existing data
  useEffect(() => {
    const initialize = async () => {
      try {
        // Check LM Studio connection
        const connected = await api.checkLMStudioConnection();
        setIsLMStudioConnected(connected);

        if (connected) {
          const models = await api.getAvailableModels();
          setAvailableModels(models);
        }

        // Load sessions
        setIsLoadingSessions(true);
        const sessionsData = await api.getAllSessions();
        setSessions(sessionsData);

        // Load memory shards
        setIsLoadingShards(true);
        const shardsData = await api.getAllMemoryShards();
        setMemoryShards(shardsData);

        // Load the most recent session if available
        if (sessionsData.length > 0) {
          const latestSession = sessionsData[0];
          setCurrentSession(latestSession);

          setIsLoadingMessages(true);
          const messagesData = await api.getMessages(latestSession.id);
          setMessages(messagesData);
          setIsLoadingMessages(false);
        }
      } catch (err) {
        handleError(err, 'initialize Ishraya');
      } finally {
        setIsLoadingSessions(false);
        setIsLoadingShards(false);
      }
    };

    initialize();
  }, [handleError]);

  // Actions
  const createNewSession = useCallback(async () => {
    try {
      const newSession = await api.createSession();
      setSessions(prev => [newSession, ...prev]);
      setCurrentSession(newSession);
      setMessages([]);
      
      toast({
        title: "New Session Created",
        description: "Started a fresh conversation with Ishraya"
      });
    } catch (err) {
      handleError(err, 'create new session');
    }
  }, [handleError]);

  const loadSession = useCallback(async (sessionId: string) => {
    try {
      setIsLoadingMessages(true);
      const session = await api.getSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }
      
      const messagesData = await api.getMessages(sessionId);
      setCurrentSession(session);
      setMessages(messagesData);
      
      toast({
        title: "Session Loaded",
        description: `Loaded conversation: ${session.title || 'Untitled'}`
      });
    } catch (err) {
      handleError(err, 'load session');
    } finally {
      setIsLoadingMessages(false);
    }
  }, [handleError]);

  const sendMessage = useCallback(async (content: string, model: string = 'hermes-3') => {
    if (!currentSession) {
      // Create new session if none exists
      await createNewSession();
      // The session creation will trigger a re-render, so we need to get the updated session
      const sessionsData = await api.getAllSessions();
      const newCurrentSession = sessionsData[0];
      if (!newCurrentSession) return;
      setCurrentSession(newCurrentSession);
    }

    const sessionId = currentSession?.id || (await api.getAllSessions())[0]?.id;
    if (!sessionId) return;

    try {
      setIsGenerating(true);
      setError(null);
      
      const { userMessage, aiMessage, memoryShard } = await api.sendMessage(sessionId, content, model);
      
      // Add messages to UI
      setMessages(prev => [...prev, userMessage, aiMessage]);
      
      // Add memory shard if created
      if (memoryShard) {
        setMemoryShards(prev => [memoryShard, ...prev]);
        toast({
          title: "Memory Formed",
          description: `New insight stored (Importance: ${memoryShard.importanceScore}/10)`
        });
      }
      
    } catch (err) {
      handleError(err, 'send message');
    } finally {
      setIsGenerating(false);
    }
  }, [currentSession, handleError, createNewSession]);

  const createMemoryShard = useCallback(async (
    content: string, 
    tags: string[] = [], 
    mood?: MemoryShard['mood'], 
    importance: number = 5
  ) => {
    try {
      const shard = await api.createMemoryShard({
        content,
        tags,
        mood,
        importanceScore: importance,
        sessionId: currentSession?.id,
      });
      
      setMemoryShards(prev => [shard, ...prev]);
      
      toast({
        title: "Memory Shard Created",
        description: `Stored with importance ${shard.importanceScore}/10`
      });
    } catch (err) {
      handleError(err, 'create memory shard');
    }
  }, [handleError, currentSession?.id]);

  const deleteMemoryShard = useCallback(async (shardId: string) => {
    try {
      const success = await api.deleteMemoryShard(shardId);
      if (success) {
        setMemoryShards(prev => prev.filter(shard => shard.id !== shardId));
        toast({
          title: "Memory Deleted",
          description: "Memory shard removed from GhostVault"
        });
      }
    } catch (err) {
      handleError(err, 'delete memory shard');
    }
  }, [handleError]);

  const refreshSessions = useCallback(async () => {
    try {
      setIsLoadingSessions(true);
      const sessionsData = await api.getAllSessions();
      setSessions(sessionsData);
    } catch (err) {
      handleError(err, 'refresh sessions');
    } finally {
      setIsLoadingSessions(false);
    }
  }, [handleError]);

  const refreshMemoryShards = useCallback(async () => {
    try {
      setIsLoadingShards(true);
      const shardsData = await api.getAllMemoryShards();
      setMemoryShards(shardsData);
    } catch (err) {
      handleError(err, 'refresh memory shards');
    } finally {
      setIsLoadingShards(false);
    }
  }, [handleError]);

  const sendStreamingMessage = useCallback(async (content: string, model: string = 'hermes-3') => {
    if (!currentSession) {
      await createNewSession();
      const sessionsData = await api.getAllSessions();
      const newCurrentSession = sessionsData[0];
      if (!newCurrentSession) return;
      setCurrentSession(newCurrentSession);
    }

    const sessionId = currentSession?.id || (await api.getAllSessions())[0]?.id;
    if (!sessionId) return;

    try {
      setIsGenerating(true);
      setStreamingContent('');
      setError(null);

      let userMessage: Message | undefined;
      let aiMessage: Message | undefined;
      let memoryShard: MemoryShard | undefined;

      for await (const chunk of api.streamMessage(sessionId, content, model)) {
        if (chunk.type === 'token') {
          if (chunk.userMessage && !userMessage) {
            userMessage = chunk.userMessage;
            setMessages(prev => [...prev, userMessage!]);
          }
          setStreamingContent(prev => prev + chunk.content);
        } else if (chunk.type === 'complete') {
          aiMessage = chunk.aiMessage;
          memoryShard = chunk.memoryShard;

          if (aiMessage) {
            setMessages(prev => {
              // Remove any temporary streaming message and add the final one
              const withoutStreaming = prev.filter(msg => msg.id !== 'streaming');
              return [...withoutStreaming, aiMessage!];
            });
          }

          if (memoryShard) {
            setMemoryShards(prev => [memoryShard!, ...prev]);
            toast({
              title: "Memory Formed",
              description: `New insight stored (Importance: ${memoryShard.importanceScore}/10)`
            });
          }

          setStreamingContent('');
        }
      }

    } catch (err) {
      handleError(err, 'send streaming message');
      setStreamingContent('');
    } finally {
      setIsGenerating(false);
    }
  }, [currentSession, handleError, createNewSession]);

  const checkLMStudioConnection = useCallback(async (): Promise<boolean> => {
    try {
      const connected = await api.checkLMStudioConnection();
      setIsLMStudioConnected(connected);
      return connected;
    } catch (err) {
      setIsLMStudioConnected(false);
      return false;
    }
  }, []);

  const getAvailableModels = useCallback(async (): Promise<string[]> => {
    try {
      const models = await api.getAvailableModels();
      setAvailableModels(models);
      return models;
    } catch (err) {
      setAvailableModels([]);
      return [];
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    currentSession,
    messages,
    isGenerating,
    streamingContent,
    memoryShards,
    sessions,
    isLoadingSessions,
    isLoadingMessages,
    isLoadingShards,
    isLMStudioConnected,
    availableModels,
    error,

    // Actions
    createNewSession,
    loadSession,
    sendMessage,
    sendStreamingMessage,
    createMemoryShard,
    deleteMemoryShard,
    refreshSessions,
    refreshMemoryShards,
    checkLMStudioConnection,
    getAvailableModels,
    clearError,
  };
};