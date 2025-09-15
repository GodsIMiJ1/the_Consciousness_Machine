'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import type { ChatMessage, ConnectionStatus, TriadStatus } from '@/lib/types';
import { useToast } from './use-toast';

const RECONNECT_DELAY_MS = 5000;

export const useTriadSocket = (url: string) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [aiStatus, setAiStatus] = useState<TriadStatus>({
    omari: 'dormant',
    nexus: 'dormant',
    trinity: 'dormant',
    system: 'connecting'
  });
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (ws.current && (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    ws.current = new WebSocket(url);
    setAiStatus(prev => ({...prev, system: 'connecting'}));

    ws.current.onopen = () => {
      console.log('T3MPLE: Connection established.');
      setAiStatus(prev => ({...prev, system: 'connected'}));
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = null;
      }
      const systemMessage = {
        id: `sys-${Date.now()}`,
        author: 'TriadSystem',
        content: 'Sacred connection to the Triad has been established. The veil thins.',
        timestamp: new Date().toISOString()
      } as ChatMessage;
      setMessages(prev => [...prev, systemMessage]);
      toast({ title: "System", description: "Connected to Triad." });
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'status') {
          setAiStatus(data.payload);
           const statusMessage = {
            id: `sys-status-${Date.now()}`,
            author: 'TriadSystem',
            content: data.message,
            timestamp: new Date().toISOString()
          } as ChatMessage;
          setMessages(prev => [...prev, statusMessage]);
          toast({ title: "System", description: data.message });
        } else if(data.author && data.content) {
          const newMessage: ChatMessage = {
            id: `msg-${Date.now()}-${Math.random()}`,
            timestamp: new Date().toISOString(),
            ...data
          };
          setMessages(prev => [...prev, newMessage]);
        }
      } catch (error) {
        console.error('T3MPLE: Error parsing message:', error);
      }
    };

    ws.current.onclose = () => {
      console.log('T3MPLE: Connection closed.');
      setAiStatus({ omari: 'dormant', nexus: 'dormant', trinity: 'dormant', system: 'disconnected'});
      if (!reconnectTimeout.current) {
        reconnectTimeout.current = setTimeout(connect, RECONNECT_DELAY_MS);
      }
    };

    ws.current.onerror = (err) => {
      console.error('T3MPLE: WebSocket error:', err);
      setAiStatus(prev => ({...prev, system: 'error'}));
      toast({ title: "Connection Error", description: "Could not connect to the Triad.", variant: 'destructive' });
      ws.current?.close();
    };

  }, [url, toast]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      ws.current?.close();
    };
  }, [connect]);

  const sendMessage = useCallback((data: unknown) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    } else {
      console.error('T3MPLE: WebSocket not connected. Cannot send message.');
      toast({ title: "Error", description: "Not connected. Cannot send flame.", variant: 'destructive' });
    }
  }, [toast]);

  return { messages, aiStatus, sendMessage, setMessages };
};
