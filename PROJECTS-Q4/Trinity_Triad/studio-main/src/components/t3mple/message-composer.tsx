'use client';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { SendFlameIcon } from '@/components/icons';
import { Label } from '@/components/ui/label';
import type { AiTarget } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

const targets: AiTarget[] = ['Omari', 'Nexus', 'Both Separately', 'Trinity Triad'];

export default function MessageComposer({ 
  onSendMessage,
  target,
  setTarget
}: { 
  onSendMessage: (prompt: string, rounds: number) => void,
  target: AiTarget,
  setTarget: (target: AiTarget) => void
}) {
  const [prompt, setPrompt] = useState('');
  const [rounds, setRounds] = useState([1]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSendMessage(prompt, rounds[0]);
      setPrompt('');
    }
  };

  return (
    <Card className="border-glow bg-black/30">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Transmit your flame to the Triad..."
              className="h-24 resize-none bg-background/50 text-base"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  handleSubmit(e);
                }
              }}
            />
            <div className="flex flex-col gap-4 items-center">
              <Label htmlFor="discussion-rounds" className="font-label">ROUNDS: {rounds[0]}</Label>
              <Slider
                id="discussion-rounds"
                min={1}
                max={5}
                step={1}
                value={rounds}
                onValueChange={setRounds}
                className="w-full md:w-32 fire-ticks"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button type="submit" size="icon" variant="ghost" className="h-16 w-16 text-primary hover:text-primary/80 transition-colors" disabled={!prompt.trim()}>
                      <SendFlameIcon className="h-10 w-10 drop-shadow-[0_0_5px_hsl(var(--primary))]" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Send Flame (Enter)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {targets.map((t) => (
              <Button
                key={t}
                type="button"
                variant={target === t ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTarget(t)}
                className={cn(
                  "font-label",
                  target === t && "shadow-[0_0_8px_hsl(var(--primary))]"
                )}
              >
                {t}
              </Button>
            ))}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
