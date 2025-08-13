import React from 'react';
import { motion } from 'framer-motion';

// Sacred NODE Seal Component
export function NodeSeal({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <motion.div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
    >
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 ring-2 ring-orange-400/40 shadow-lg">
        {/* Inner sacred pattern */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center">
          <motion.div
            className="text-xs font-bold text-black"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ⬢
          </motion.div>
        </div>
      </div>
      
      {/* Pulsing aura */}
      <motion.div
        className="absolute inset-0 rounded-full bg-orange-400/20"
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </motion.div>
  );
}

// Flame Glyph Component
export function FlameGlyph({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <motion.div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      animate={{ y: [0, -2, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          d="M12 2C12 2 8 6 8 12C8 16 10 18 12 18C14 18 16 16 16 12C16 6 12 2 12 2Z"
          fill="url(#flameGradient)"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.path
          d="M12 6C12 6 10 8 10 11C10 13 11 14 12 14C13 14 14 13 14 11C14 8 12 6 12 6Z"
          fill="url(#innerFlame)"
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <defs>
          <linearGradient id="flameGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
          <linearGradient id="innerFlame" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}

// Ghost Tongue Glyph Component
export function GhostGlyph({ glyph = "ᚾ", size = 24, className = "" }: { glyph?: string; size?: number; className?: string }) {
  return (
    <motion.div
      className={`relative font-mono text-ghost-300 ${className}`}
      style={{ fontSize: size }}
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 3, repeat: Infinity }}
    >
      <motion.span
        animate={{ textShadow: ["0 0 5px #64748b", "0 0 15px #64748b", "0 0 5px #64748b"] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {glyph}
      </motion.span>
    </motion.div>
  );
}

// Sacred Circle Component
export function SacredCircle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* Outer protective circle */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-orange-500/30"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Inner sacred space */}
      <motion.div
        className="absolute inset-2 rounded-full border border-amber-400/20"
        animate={{ rotate: [360, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-full">
        {children}
      </div>
      
      {/* Mystical particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-orange-400 rounded-full"
          style={{
            top: "50%",
            left: "50%",
            transformOrigin: `${Math.cos((i * 60) * Math.PI / 180) * 80}px ${Math.sin((i * 60) * Math.PI / 180) * 80}px`,
          }}
          animate={{
            rotate: [0, 360],
            scale: [0.5, 1, 0.5],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        />
      ))}
    </div>
  );
}

// Ritual Status Indicator
export function RitualStatus({ stage, active }: { stage: string; active: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <motion.div
        className={`w-3 h-3 rounded-full ${
          active ? "bg-amber-400" : "bg-neutral-600"
        }`}
        animate={active ? { scale: [1, 1.2, 1], opacity: [1, 0.7, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity }}
      />
      <span className={`text-sm ${active ? "text-amber-300" : "text-neutral-400"}`}>
        {stage}
      </span>
      {active && (
        <motion.div
          className="ml-2"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <FlameGlyph size={16} />
        </motion.div>
      )}
    </div>
  );
}
