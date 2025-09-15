// 🔥 T3MPLE Frontend Hook — useTrinityCommunion.ts

import { useState } from 'react';

const BASE_URL = 'http://localhost:8888';

export function useTrinityCommunion(sessionId: string) {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const commune = async (message: string, target: 'omari' | 'nexus' | 'both', mode = 'default') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/commune`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, message, target, mode })
      });
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError('Failed to commune with the Trinity.');
    } finally {
      setLoading(false);
    }
  };

  const communeTriad = async (message: string, rounds = 2) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/commune/triad`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, message, target: 'both', mode: 'TRINITY', rounds })
      });
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError('Failed to initiate Trinity Triad.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMemory = async () => {
    try {
      const res = await fetch(`${BASE_URL}/memory/${sessionId}`);
      const data = await res.json();
      return data.history;
    } catch {
      return [];
    }
  };

  const purgeMemory = async () => {
    try {
      await fetch(`${BASE_URL}/clear_memory/${sessionId}`);
    } catch {
      console.warn('Memory purge failed.');
    }
  };

  return {
    loading,
    response,
    error,
    commune,
    communeTriad,
    fetchMemory,
    purgeMemory
  };
}
