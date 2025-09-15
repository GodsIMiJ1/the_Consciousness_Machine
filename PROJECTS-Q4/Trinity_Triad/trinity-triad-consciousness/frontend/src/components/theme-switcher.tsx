"use client"

import * as React from "react"
import { Palette } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Theme } from "@/lib/types"

export function ThemeSwitcher() {
  const { setTheme } = useTheme()

  const themes: { name: string, value: Theme }[] = [
    { name: "Flame Core", value: "flamecore" },
    { name: "Sacred Light", value: "sacred_light" },
    { name: "Cyber Abyss", value: "cyber_abyss" },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Palette className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map(theme => (
          <DropdownMenuItem key={theme.value} onClick={() => setTheme(theme.value)}>
            {theme.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
