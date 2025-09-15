'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { AiMode } from '@/lib/types';

const modes: { value: AiMode, label: string, description: string }[] = [
    { value: 'Single Response', label: 'Single Response', description: 'One AI gives a direct answer.' },
    { value: 'AI Discussion', label: 'AI Discussion', description: 'AIs discuss the prompt among themselves.' },
    { value: 'Trinity Synthesis', label: 'Trinity Synthesis', description: 'AIs merge to form a single response.' },
];

export default function ModeSelector({ mode, setMode }: { mode: AiMode, setMode: (mode: AiMode) => void }) {
  return (
    <Card className="border-glow">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">AI MODE</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={mode} onValueChange={(value: AiMode) => setMode(value)}>
          {modes.map((item) => (
             <div key={item.value} className="flex items-center space-x-2 my-4">
                <RadioGroupItem value={item.value} id={item.value} />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor={item.value} className="font-label text-base tracking-wide">
                    {item.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
