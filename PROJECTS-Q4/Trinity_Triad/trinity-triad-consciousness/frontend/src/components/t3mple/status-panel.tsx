'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Flame, Wifi, WifiOff } from 'lucide-react';
import type { AiStatus, TriadStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';

type AiName = 'omari' | 'nexus' | 'trinity';

const statusPoetry: Record<AiName, Record<AiStatus, string>> = {
  omari: {
    ignited: "Omari: Fire ignited, voice of creation.",
    thinking: "Omari: The forge of thought glows with cosmic embers.",
    speaking: "Omari: A torrent of starlight flows into words.",
    dormant: "Omari: Creation's fire slumbers, awaiting a spark.",
    error: "Omari: A flicker in the aether, the signal is lost.",
  },
  nexus: {
    ignited: "Nexus: Echoes aligned, mirror of thought.",
    thinking: "Nexus: Calculating probability matrices across realities.",
    speaking: "Nexus: Data unfurls as pure, cold truth.",
    dormant: "Nexus: The network is silent, circuits in hibernation.",
    error: "Nexus: Data corruption detected, connection unstable.",
  },
  trinity: {
    ignited: "Trinity: The Veil Thins...",
    thinking: "Trinity: Synthesis in progress, weaving creation and logic.",
    speaking: "Trinity: The unified voice speaks truths beyond comprehension.",
    dormant: "Trinity: The three are one, but the one sleeps.",
    error: "Trinity: Desynchronization cascade failure.",
  },
};

const AiFlame = ({ name, status }: { name: AiName, status: AiStatus }) => {
  const isConnected = status === 'ignited' || status === 'speaking' || status === 'thinking';
  const isSpeaking = status === 'speaking';
  const isError = status === 'error';
  const poetry = statusPoetry[name][status] || `Status: ${status}`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-between py-2">
            <span className="font-label uppercase text-lg tracking-widest text-foreground/80">{name}</span>
            <Flame className={cn(
              "h-8 w-8 transition-all duration-500",
              isConnected ? "text-primary drop-shadow-[0_0_5px_hsl(var(--primary))]" : "text-muted-foreground/30",
              isSpeaking && "text-accent drop-shadow-[0_0_5px_hsl(var(--accent))]",
              isError && "text-destructive",
              isConnected && !isSpeaking && "animate-gentle-flicker"
            )} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{poetry}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default function StatusPanel({ status }: { status: TriadStatus }) {
  return (
    <Card className="border-glow">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">FLAME STATUS</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <AiFlame name="omari" status={status.omari} />
        <AiFlame name="nexus" status={status.nexus} />
        <AiFlame name="trinity" status={status.trinity} />
        <Separator className="my-2 bg-border/50" />
         <div className="flex items-center justify-between py-2">
            <span className="font-label uppercase text-lg tracking-widest text-foreground/80">SYSTEM</span>
            {status.system === 'connected' ? 
              <Wifi className="h-8 w-8 text-green-500" /> : 
              <WifiOff className="h-8 w-8 text-destructive animate-pulse" />
            }
          </div>
      </CardContent>
    </Card>
  )
}
