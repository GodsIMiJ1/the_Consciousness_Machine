// Browser-safe OpenAI wrapper with browser-friendly fallbacks.
// This version avoids Node-specific dependencies (like Ollama) to work in a
// mobile Capacitor environment. Real AI calls should be proxied through a secure
// backend in production to avoid exposing API keys in the app.

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface TarotReading {
  past: string;
  present: string;
  future: string;
}

export interface HoroscopeRequest {
  mode: 'horoscope' | 'dream';
  sign?: string;
  date?: string;
  dream?: string;
}

// Simple environment/config check for OpenAI integration
export function isOpenAIConfigured(): boolean {
  // In Vite, environment variables are exposed via import.meta.env
  // Fall back to any other possible global config if needed.
  // This helps us determine if a real AI path could be enabled in production.
  // @ts-ignore
  const key =
    (import.meta && (import.meta as any).env && (import.meta as any).env.VITE_OPENAI_API_KEY) ||
    (typeof process !== 'undefined' ? (process as any).env?.VITE_OPENAI_API_KEY : undefined) ||
    '';
  return !!key;
}

// Chat service for AURA-BREE therapeutic companion
export async function getChatResponse(messages: ChatMessage[]): Promise<string> {
  try {
    // Browser-friendly placeholder response.
    // In a real deployment, route requests through a secure backend proxy
    // to avoid exposing API keys in the mobile app.
    if (!isOpenAIConfigured()) {
      const lastUser = messages.find(m => m.role === 'user')?.content ?? '';
      return `OpenAI API key is not configured. You said: ${lastUser}`;
    }

    // Placeholder response when API key is configured.
    // Replace this with a real backend proxy call in production.
    return 'This is a browser-safe placeholder response. In production, this should call a backend proxy to OpenAI.';
  } catch (error) {
    console.error('OpenAI Chat Error (browser-safe path):', error);
    throw new Error('Failed to get chat response. Please check your configuration.');
  }
}

// Tarot reading service
export async function getTarotReading(reading: TarotReading): Promise<string> {
  try {
    if (!isOpenAIConfigured()) {
      return 'Tarot reading is not configured. Please configure VITE_OPENAI_API_KEY for AI features.';
    }
    // Browser-safe placeholder
    return 'Tarot reading (browser mock): This is a placeholder. In production, route through a backend proxy to an AI model.';
  } catch (error) {
    console.error('OpenAI Tarot Error (browser-safe path):', error);
    throw new Error('Failed to get tarot reading.');
  }
}

// Horoscope and dream interpretation service
export async function getHoroscopeOrDream(request: HoroscopeRequest): Promise<string> {
  try {
    if (!isOpenAIConfigured()) {
      return 'Horoscope/Dream feature is not configured. Please configure VITE_OPENAI_API_KEY for AI features.';
    }
    // Browser-safe placeholder
    if (request.mode === 'horoscope') {
      return 'Horoscope (browser mock): This is a placeholder. In production, route through a backend proxy to an AI model.';
    } else {
      return 'Dream interpretation (browser mock): This is a placeholder. In production, route through a backend proxy to an AI model.';
    }
  } catch (error) {
    console.error('OpenAI Horoscope/Dream Error (browser-safe path):', error);
    throw new Error('Failed to get horoscope/dream response.');
  }
}
