import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const [mode, setMode] = useState<'light'|'dark'>('light')

  useEffect(() => {
    const stored = localStorage.getItem('bd_theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initial = (stored as 'light'|'dark') || (prefersDark ? 'dark' : 'light')
    setMode(initial)
    document.documentElement.classList.toggle('dark', initial === 'dark')
    document.documentElement.classList.toggle('light', initial === 'light')
  }, [])

  const flip = () => {
    const next = mode === 'dark' ? 'light' : 'dark'
    setMode(next)
    document.documentElement.classList.toggle('dark', next === 'dark')
    document.documentElement.classList.toggle('light', next === 'light')
    localStorage.setItem('bd_theme', next)
  }

  return (
    <button 
      onClick={flip} 
      className="btn btn-outline flex items-center gap-2" 
      aria-label="Toggle theme"
    >
      {mode === 'dark' ? (
        <>
          <Moon className="w-4 h-4" />
          <span className="hidden sm:inline">Dark</span>
        </>
      ) : (
        <>
          <Sun className="w-4 h-4" />
          <span className="hidden sm:inline">Light</span>
        </>
      )}
    </button>
  )
}