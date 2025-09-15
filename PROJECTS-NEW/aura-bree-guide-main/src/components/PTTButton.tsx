import { useState } from "react";
import { Button } from "./ui/button";
import { Mic, MicOff } from "lucide-react";

interface PTTButtonProps {
  onResult: (text: string) => void;
  disabled?: boolean;
}

export default function PTTButton({ onResult, disabled = false }: PTTButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleStart = () => {
    if (disabled) return;
    
    setIsListening(true);
    setIsPressed(true);
    
    // Simulate voice recognition - replace with actual implementation
    console.log("Started listening...");
  };

  const handleStop = () => {
    if (!isListening) return;
    
    setIsListening(false);
    setIsPressed(false);
    
    // Simulate result - replace with actual voice result
    setTimeout(() => {
      onResult("Hello AURA-BREE, how are you today?");
    }, 100);
    
    console.log("Stopped listening");
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        variant="ghost"
        size="lg"
        disabled={disabled}
        onMouseDown={handleStart}
        onMouseUp={handleStop}
        onTouchStart={handleStart}
        onTouchEnd={handleStop}
        onMouseLeave={handleStop} // Safety: stop if mouse leaves while pressed
        className={`
          relative w-20 h-20 rounded-full p-0
          bg-gradient-flame hover:bg-gradient-flame
          border-2 border-primary-glow/50
          transition-all duration-200 ease-out
          ${isPressed ? 'scale-95 shadow-glow' : 'scale-100 shadow-flame'}
          ${isListening ? 'animate-flame-glow' : ''}
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {isListening ? (
          <MicOff className="w-8 h-8 text-white" />
        ) : (
          <Mic className="w-8 h-8 text-white" />
        )}
        
        {/* Pulsing ring when listening */}
        {isListening && (
          <div className="absolute inset-0 rounded-full border-2 border-primary-glow animate-ping" />
        )}
      </Button>
      
      <p className="text-sm text-muted-foreground text-center">
        {isListening ? (
          <span className="text-primary font-medium">Listening... (release to stop)</span>
        ) : (
          "Hold to talk"
        )}
      </p>
    </div>
  );
}