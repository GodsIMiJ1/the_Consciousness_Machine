import React from 'react';

export const GlyphBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Main rotating glyph ring */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] animate-glyph-rotate">
        <svg viewBox="0 0 400 400" className="w-full h-full opacity-20">
          <defs>
            <linearGradient id="glyphGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--mystic-cyan))" stopOpacity="0.3" />
              <stop offset="50%" stopColor="hsl(var(--mystic-blue))" stopOpacity="0.1" />
              <stop offset="100%" stopColor="hsl(var(--mystic-cyan))" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          {/* Outer ring with glyphs */}
          <circle cx="200" cy="200" r="180" fill="none" stroke="url(#glyphGradient)" strokeWidth="1" />
          <circle cx="200" cy="200" r="160" fill="none" stroke="url(#glyphGradient)" strokeWidth="0.5" />
          {/* Inner geometric patterns */}
          <g transform="translate(200,200)">
            {[...Array(8)].map((_, i) => {
              const angle = (i * 45) * Math.PI / 180;
              const x = Math.cos(angle) * 140;
              const y = Math.sin(angle) * 140;
              return (
                <g key={i} transform={`translate(${x},${y}) rotate(${i * 45})`}>
                  <path
                    d="M-8,-2 L8,-2 L6,0 L8,2 L-8,2 L-6,0 Z"
                    fill="url(#glyphGradient)"
                    opacity="0.6"
                  />
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Secondary rings */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] animate-glyph-rotate opacity-10" style={{ animationDirection: 'reverse', animationDuration: '30s' }}>
        <svg viewBox="0 0 300 300" className="w-full h-full">
          <circle cx="150" cy="150" r="120" fill="none" stroke="hsl(var(--mystic-silver))" strokeWidth="0.5" strokeDasharray="5,10" />
          <circle cx="150" cy="150" r="100" fill="none" stroke="hsl(var(--mystic-cyan))" strokeWidth="0.3" strokeDasharray="2,5" />
        </svg>
      </div>

      <div className="absolute bottom-1/4 right-1/4 w-[200px] h-[200px] animate-glyph-rotate opacity-15" style={{ animationDuration: '25s' }}>
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <circle cx="100" cy="100" r="80" fill="none" stroke="hsl(var(--memory-accent))" strokeWidth="0.5" strokeDasharray="3,7" />
          <circle cx="100" cy="100" r="60" fill="none" stroke="hsl(var(--soul-glow))" strokeWidth="0.3" strokeDasharray="1,3" />
        </svg>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-mystic-cyan rounded-full animate-pulse"
            style={{
              left: `${20 + (i * 7)}%`,
              top: `${30 + Math.sin(i) * 20}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${2 + (i % 3)}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};