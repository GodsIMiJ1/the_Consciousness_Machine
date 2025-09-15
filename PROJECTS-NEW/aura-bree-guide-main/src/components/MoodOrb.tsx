import { useState, useEffect } from "react";

interface MoodOrbProps {
  mood?: number; // 1-10 scale from check-ins
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export default function MoodOrb({ mood = 7, sentiment = 'positive' }: MoodOrbProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Dynamic color based on mood/sentiment
  const getOrbStyle = () => {
    if (sentiment === 'negative' || mood <= 3) {
      return 'bg-gradient-to-br from-red-400 to-red-600';
    } else if (sentiment === 'neutral' || mood <= 6) {
      return 'bg-gradient-to-br from-yellow-400 to-orange-500';
    }
    return 'bg-gradient-orb'; // Default flame gradient
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div 
        className={`
          relative w-32 h-32 rounded-full cursor-pointer
          ${getOrbStyle()}
          animate-orb-pulse
          transition-all duration-300 ease-in-out
          ${isHovered ? 'scale-110 shadow-glow' : 'shadow-flame'}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Inner glow effect */}
        <div className="absolute inset-2 rounded-full bg-white/10 blur-sm" />
        
        {/* Center highlight */}
        <div className="absolute top-6 left-6 w-6 h-6 rounded-full bg-white/30 blur-sm" />
        
        {/* Floating particles */}
        <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full bg-primary-glow animate-float" 
             style={{ animationDelay: '0s' }} />
        <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-primary-glow animate-float" 
             style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 -right-3 w-1.5 h-1.5 rounded-full bg-primary-glow animate-float" 
             style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Mood Level</p>
        <p className="text-2xl font-bold text-foreground">{mood}/10</p>
      </div>
    </div>
  );
}