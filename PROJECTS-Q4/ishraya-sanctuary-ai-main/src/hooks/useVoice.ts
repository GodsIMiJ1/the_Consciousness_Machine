import { useState, useCallback, useRef } from 'react';

export interface VoiceSettings {
  enabled: boolean;
  autoSpeak: boolean;
  voice: string;
  speed: number;
  pitch: number;
}

export interface VoiceHook {
  // TTS (Text-to-Speech)
  speak: (text: string) => Promise<void>;
  stopSpeaking: () => void;
  isSpeaking: boolean;
  
  // STT (Speech-to-Text) 
  startListening: () => Promise<void>;
  stopListening: () => void;
  isListening: boolean;
  
  // Settings
  settings: VoiceSettings;
  updateSettings: (updates: Partial<VoiceSettings>) => void;
  
  // Status
  isSupported: boolean;
  error: string | null;
}

const defaultSettings: VoiceSettings = {
  enabled: true,
  autoSpeak: false,
  voice: 'Aria', // Default ElevenLabs voice
  speed: 1.0,
  pitch: 1.0,
};

export const useVoice = (): VoiceHook => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [settings, setSettings] = useState<VoiceSettings>(defaultSettings);
  const [error, setError] = useState<string | null>(null);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<any>(null);
  
  // Check browser support
  const isSupported = typeof window !== 'undefined' && 
    ('speechSynthesis' in window || 'webkitSpeechRecognition' in window);

  const speak = useCallback(async (text: string) => {
    if (!settings.enabled || !text.trim()) return;
    
    try {
      setError(null);
      
      // For now, use browser TTS (will be replaced with ElevenLabs)
      if ('speechSynthesis' in window) {
        // Stop any current speech
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = settings.speed;
        utterance.pitch = settings.pitch;
        
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (event) => {
          setError(`Speech synthesis error: ${event.error}`);
          setIsSpeaking(false);
        };
        
        utteranceRef.current = utterance;
        speechSynthesis.speak(utterance);
      } else {
        // TODO: Integrate ElevenLabs API here
        console.log('ElevenLabs TTS would speak:', text);
        setError('ElevenLabs TTS not yet implemented');
      }
    } catch (err) {
      setError(`Speech error: ${err}`);
      setIsSpeaking(false);
    }
  }, [settings]);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const startListening = useCallback(async () => {
    if (!settings.enabled) return;
    
    try {
      setError(null);
      
      // Check for speech recognition support
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event: any) => {
          setError(`Speech recognition error: ${event.error}`);
          setIsListening(false);
        };
        
        recognition.onresult = (event: any) => {
          // TODO: Handle speech recognition results
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          console.log('Speech recognized:', transcript);
        };
        
        recognitionRef.current = recognition;
        recognition.start();
      } else {
        setError('Speech recognition not supported');
      }
    } catch (err) {
      setError(`Listening error: ${err}`);
      setIsListening(false);
    }
  }, [settings]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const updateSettings = useCallback((updates: Partial<VoiceSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    speak,
    stopSpeaking,
    isSpeaking,
    startListening,
    stopListening,
    isListening,
    settings,
    updateSettings,
    isSupported,
    error,
  };
};