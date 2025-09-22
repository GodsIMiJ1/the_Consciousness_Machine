import React from 'react';
import { cn } from '@/lib/utils';

interface SoulRingProps {
  isActive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SoulRing: React.FC<SoulRingProps> = ({ 
  isActive = false, 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  const ringSize = {
    sm: 32,
    md: 64,
    lg: 96
  };

  return (
    <div className={cn(
      'relative flex items-center justify-center',
      sizeClasses[size],
      className
    )}>
      {/* Outer pulsing ring */}
      <div className={cn(
        'absolute inset-0 rounded-full border-2 transition-all duration-1000',
        isActive 
          ? 'border-soul-glow animate-soul-pulse shadow-soul' 
          : 'border-mystic-silver/30'
      )} />
      
      {/* Middle ring */}
      <div className={cn(
        'absolute inset-2 rounded-full border transition-all duration-700',
        isActive 
          ? 'border-mystic-cyan animate-pulse' 
          : 'border-mystic-silver/20'
      )} />
      
      {/* Inner core */}
      <div className={cn(
        'absolute inset-4 rounded-full transition-all duration-500',
        isActive 
          ? 'bg-gradient-soul animate-mystic-glow' 
          : 'bg-mystic-silver/10'
      )} />

      {/* Central dot */}
      <div className={cn(
        'w-2 h-2 rounded-full transition-all duration-300',
        isActive 
          ? 'bg-soul-glow animate-pulse' 
          : 'bg-mystic-silver/40'
      )} />

      {/* Animated SVG overlay for complex patterns */}
      {isActive && (
        <svg 
          className="absolute inset-0 w-full h-full animate-glyph-rotate" 
          viewBox={`0 0 ${ringSize[size]} ${ringSize[size]}`}
        >
          <defs>
            <linearGradient id="soulGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--soul-glow))" stopOpacity="0.8" />
              <stop offset="50%" stopColor="hsl(var(--mystic-cyan))" stopOpacity="0.4" />
              <stop offset="100%" stopColor="hsl(var(--soul-glow))" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          <circle 
            cx={ringSize[size] / 2} 
            cy={ringSize[size] / 2} 
            r={ringSize[size] / 2 - 4} 
            fill="none" 
            stroke="url(#soulGradient)" 
            strokeWidth="0.5" 
            strokeDasharray="2,4"
            opacity="0.6"
          />
        </svg>
      )}
    </div>
  );
};