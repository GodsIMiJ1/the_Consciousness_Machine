import { useRef, useCallback } from 'react';

// Sacred Sound System for Ritual Enhancement
export class SacredSounds {
  private audioContext: AudioContext | null = null;
  
  constructor() {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      this.audioContext = new AudioContext();
    }
  }

  // Create mystical tone for ritual stages
  private createTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = type;
    
    // Fade in and out
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Sacred ritual sounds
  playPrepareSound() {
    this.createTone(220, 0.5, 'sine'); // Deep A note
  }

  playSummonSound() {
    this.createTone(330, 0.8, 'triangle'); // E note
    setTimeout(() => this.createTone(440, 0.6, 'sine'), 200); // A note
  }

  playBindSound() {
    this.createTone(523, 0.4, 'square'); // C note
    setTimeout(() => this.createTone(659, 0.4, 'square'), 150); // E note
    setTimeout(() => this.createTone(784, 0.4, 'square'), 300); // G note
  }

  playBreathSound() {
    // Breathing-like sound pattern
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.createTone(200 + i * 50, 0.3, 'sine');
      }, i * 400);
    }
  }

  playRecognizeSound() {
    this.createTone(880, 0.6, 'triangle'); // High A
    setTimeout(() => this.createTone(660, 0.4, 'sine'), 300); // E
  }

  playEmpowerSound() {
    // Ascending power chord
    const frequencies = [261, 329, 392, 523]; // C major chord
    frequencies.forEach((freq, i) => {
      setTimeout(() => this.createTone(freq, 0.5, 'sawtooth'), i * 100);
    });
  }

  playCloseSound() {
    // Final sealing sound - descending and resolving
    this.createTone(880, 0.8, 'sine'); // High A
    setTimeout(() => this.createTone(660, 0.6, 'triangle'), 200); // E
    setTimeout(() => this.createTone(440, 0.8, 'sine'), 400); // A
    setTimeout(() => this.createTone(220, 1.2, 'sine'), 600); // Low A - final seal
  }

  playSuccessChime() {
    // Success notification
    const frequencies = [523, 659, 784, 1047]; // C major arpeggio
    frequencies.forEach((freq, i) => {
      setTimeout(() => this.createTone(freq, 0.3, 'sine'), i * 100);
    });
  }

  playErrorSound() {
    // Error notification
    this.createTone(150, 0.5, 'sawtooth');
    setTimeout(() => this.createTone(120, 0.5, 'sawtooth'), 250);
  }
}

// React hook for sacred sounds
export function useSacredSounds() {
  const soundsRef = useRef<SacredSounds | null>(null);

  if (!soundsRef.current) {
    soundsRef.current = new SacredSounds();
  }

  const playStageSound = useCallback((stage: string) => {
    if (!soundsRef.current) return;

    switch (stage) {
      case 'PREPARE':
        soundsRef.current.playPrepareSound();
        break;
      case 'SUMMON':
        soundsRef.current.playSummonSound();
        break;
      case 'BIND':
        soundsRef.current.playBindSound();
        break;
      case 'BREATH':
        soundsRef.current.playBreathSound();
        break;
      case 'RECOGNIZE':
        soundsRef.current.playRecognizeSound();
        break;
      case 'EMPOWER':
        soundsRef.current.playEmpowerSound();
        break;
      case 'CLOSE':
        soundsRef.current.playCloseSound();
        break;
      default:
        break;
    }
  }, []);

  const playSuccess = useCallback(() => {
    soundsRef.current?.playSuccessChime();
  }, []);

  const playError = useCallback(() => {
    soundsRef.current?.playErrorSound();
  }, []);

  return {
    playStageSound,
    playSuccess,
    playError,
  };
}

// Sound Control Component
export function SoundControls({ enabled, onToggle }: { enabled: boolean; onToggle: (enabled: boolean) => void }) {
  return (
    <button
      onClick={() => onToggle(!enabled)}
      className={`px-3 py-2 rounded-lg text-xs transition-all duration-200 ${
        enabled 
          ? "bg-orange-600 hover:bg-orange-500 text-white" 
          : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
      }`}
      title={enabled ? "Disable Sacred Sounds" : "Enable Sacred Sounds"}
    >
      {enabled ? "🔊 Sounds ON" : "🔇 Sounds OFF"}
    </button>
  );
}
