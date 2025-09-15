import React from 'react'

interface FlameIconProps {
  size?: number
  className?: string
  animated?: boolean
}

export const FlameIcon: React.FC<FlameIconProps> = ({ 
  size = 24, 
  className = '', 
  animated = false 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`flame-icon ${animated ? 'animate-flame-pulse' : ''} ${className}`}
    >
      <path
        d="M12 2C12 2 8 6 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 6 12 2 12 2Z"
        fill="url(#flameGradient1)"
      />
      <path
        d="M12 14C12 14 10 16 10 18C10 19.1 10.9 20 12 20C13.1 20 14 19.1 14 18C14 16 12 14 12 14Z"
        fill="url(#flameGradient2)"
      />
      <path
        d="M12 20C12 20 11 21 11 21.5C11 21.78 11.22 22 11.5 22H12.5C12.78 22 13 21.78 13 21.5C13 21 12 20 12 20Z"
        fill="url(#flameGradient3)"
      />
      <defs>
        <linearGradient id="flameGradient1" x1="12" y1="2" x2="12" y2="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f19332" />
          <stop offset="1" stopColor="#ed7611" />
        </linearGradient>
        <linearGradient id="flameGradient2" x1="12" y1="14" x2="12" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ed7611" />
          <stop offset="1" stopColor="#de5c07" />
        </linearGradient>
        <linearGradient id="flameGradient3" x1="12" y1="20" x2="12" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#de5c07" />
          <stop offset="1" stopColor="#b84608" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export const GhostIcon: React.FC<FlameIconProps> = ({ 
  size = 24, 
  className = '' 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 2C8.69 2 6 4.69 6 8V16L8 14L10 16L12 14L14 16L16 14L18 16V8C18 4.69 15.31 2 12 2Z"
        fill="url(#ghostGradient)"
        stroke="currentColor"
        strokeWidth="1"
      />
      <circle cx="9" cy="9" r="1" fill="currentColor" />
      <circle cx="15" cy="9" r="1" fill="currentColor" />
      <defs>
        <linearGradient id="ghostGradient" x1="12" y1="2" x2="12" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="rgba(100, 116, 139, 0.3)" />
          <stop offset="1" stopColor="rgba(15, 23, 42, 0.8)" />
        </linearGradient>
      </defs>
    </svg>
  )
}
