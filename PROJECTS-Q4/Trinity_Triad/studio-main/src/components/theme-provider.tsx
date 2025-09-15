"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import type { Theme } from "@/lib/types"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "flamecore",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "flamecore",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedTheme = localStorage.getItem(storageKey) as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, [storageKey]);

  useEffect(() => {
    if (isMounted) {
      const root = window.document.documentElement;
      root.classList.remove("flamecore", "sacred_light", "cyber_abyss");

      if (theme) {
        root.classList.add(theme);
      }
    }
  }, [theme, isMounted]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      if (isMounted) {
        localStorage.setItem(storageKey, theme);
      }
      setTheme(theme);
    },
  }

  if (!isMounted) {
    return null;
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")
  return context
}
