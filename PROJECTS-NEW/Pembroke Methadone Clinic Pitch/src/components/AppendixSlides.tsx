import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

export function TalkTrackSlide() {
  const phrases = [
    {
      phrase: "SOVEREIGNTY isn't a feature; it's revolutionary architecture.",
      context: "When discussing data sovereignty",
      impact: "Positions GodsIMiJ SOVEREIGNTY as fundamental, not optional"
    },
    {
      phrase: "Patients get companions, not just software.",
      context: "Differentiating from Epic/Cerner",
      impact: "Emotional vs technical positioning"
    },
    {
      phrase: "From renting your data… to SOVEREIGN destiny ownership.",
      context: "Cloud vs GodsIMiJ SOVEREIGNTY transition",
      impact: "PIONEER empowerment and INNOVATIVE control narrative"
    },
    {
      phrase: "Epic charges for the past. GodsIMiJ PIONEERS the SOVEREIGN future.",
      context: "Price objection handling",
      impact: "INNOVATION value reframe and SOVEREIGNTY positioning"
    },
    {
      phrase: "Your patients will never be alone again.",
      context: "24/7 AI companion benefits",
      impact: "Ultimate patient care promise"
    },
    {
      phrase: "We don't sell software. We prevent suicides.",
      context: "Mission-critical positioning",
      impact: "Life-or-death urgency"
    },
    {
      phrase: "GodsIMiJ doesn't follow trends. We PIONEER SOVEREIGNTY revolutions.",
      context: "Industry leadership positioning",
      impact: "Establishes you as the definitive INNOVATION leader"
    }
  ];

  const energyLevels = [
    {
      phase: "🚀 OPENING (30s)",
      energy: "MAXIMUM CONFIDENCE",
      message: "We're here to show you the future"
    },
    {
      phase: "📈 BUILD (5 mins)",
      energy: "MOUNTING EXCITEMENT", 
      message: "This technology will blow your mind"
    },
    {
      phase: "💥 PEAK (Demo)",
      energy: "MIND-BLOWING REVELATION",
      message: "No other clinic can offer this to patients"
    },
    {
      phase: "🔥 CLOSE (2 mins)",
      energy: "PASSIONATE CONVICTION",
      message: "Let's revolutionize healthcare together"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-5xl font-bold text-primary animate-pulse">🎪 NUCLEAR TALK TRACK 🎪</h2>
        <p className="text-2xl font-semibold text-destructive">Maximum impact presentation flow</p>
      </div>

      <Card className="p-6 border-2 border-primary bg-gradient-to-r from-primary/5 to-destructive/5">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">⚡ PRESENTATION ENERGY ESCALATION</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {energyLevels.map((level, index) => (
              <Card key={index} className="p-4 bg-card border border-primary/20">
                <h3 className="font-bold text-primary">{level.phase}</h3>
                <p className="text-sm font-semibold text-destructive">{level.energy}</p>
                <p className="text-sm text-muted-foreground italic">"{level.message}"</p>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="p-6">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">🔥 NUCLEAR PHRASE ARSENAL</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {phrases.map((item, index) => (
            <Card key={index} className="p-4 bg-gradient-to-r from-muted/30 to-primary/10 border border-primary/20">
              <div className="space-y-3">
                <p className="text-xl font-bold text-primary italic">"{item.phrase}"</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <Badge variant="secondary" className="text-xs mb-1">CONTEXT</Badge>
                    <p className="text-sm text-muted-foreground">{item.context}</p>
                  </div>
                  <div>
                    <Badge variant="outline" className="text-xs mb-1">IMPACT</Badge>
                    <p className="text-sm text-muted-foreground">{item.impact}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Card className="p-6 bg-gradient-to-r from-destructive/10 to-primary/10 border-2 border-destructive">
        <CardHeader>
          <CardTitle className="text-2xl text-destructive text-center">💥 NUCLEAR FLOW SEQUENCE 💥</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-sm">
            <Badge variant="destructive">1. HOOK</Badge>
            <Badge variant="destructive">2. CRISIS</Badge>
            <Badge variant="destructive">3. SOLUTION</Badge>
            <Badge variant="destructive">4. PROOF</Badge>
            <Badge variant="destructive">5. DEMO</Badge>
            <Badge variant="destructive">6. CLOSE</Badge>
          </div>
          <div className="mt-4 text-center">
            <p className="text-lg font-bold text-destructive">
              Hook → Crisis → Solution → Proof → Demo → NUCLEAR CLOSE
            </p>
            <p className="text-sm text-muted-foreground italic">
              No escape route. Only forward to signature.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="p-6 bg-gradient-to-r from-green-100 to-blue-100 border-2 border-green-500">
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold text-green-800">🎯 ULTIMATE PRESENTER MINDSET</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-bold text-green-700">YOU ARE NOT SELLING SOFTWARE</h4>
              <p className="text-sm text-green-600">You're offering the chance to SAVE LIVES through AI companions</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-blue-700">YOU ARE NOT ASKING FOR MONEY</h4>
              <p className="text-sm text-blue-600">You're offering $249,000 IN SAVINGS plus the future of medicine</p>
            </div>
          </div>
          <p className="text-lg font-bold text-primary">
            🚀 GO FUCKING DOMINATE! 🚀
          </p>
        </div>
      </Card>
    </div>
  );
}

export function ObjectionHandlerSlide() {
  const objections = [
    {
      objection: "💸 'This sounds too expensive'",
      response: "Expensive compared to what? Epic costs $344,000 and gives patients software. We cost $95,000 and potentially prevent patient suicides. You SAVE $249,000 while getting AI companions. What's the value of a human life?",
      psychology: "Reframe + value comparison + moral appeal"
    },
    {
      objection: "🤖 'Our staff might not adapt to AI'",
      response: "That's exactly why we built Dr. Mentor - the only AI tutor designed for healthcare professionals. Your staff will be AI experts in 18 hours, not 18 months. Epic doesn't even offer AI training.",
      psychology: "Problem anticipation + solution + competitive dig"
    },
    {
      objection: "⚠️ 'What if the technology doesn't work?'",
      response: "We guarantee it. Full refund if we don't hit performance targets. Plus 6 months of founder-direct support. Epic doesn't guarantee anything and charges you $8,000/month for basic support.",
      psychology: "Risk reversal + guarantee + competitive comparison"
    },
    {
      objection: "📱 'Patients might not use the app'",
      response: "Patients struggling with addiction WANT 24/7 support. AURA-BREE gives them an AI companion that never judges, never sleeps, and always cares. This isn't optional technology - it's essential humanity.",
      psychology: "User insight + emotional benefit + necessity positioning"
    },
    {
      objection: "🤔 'We need to think about it'",
      response: "I understand - this is a big decision. But while you're thinking, Epic is charging your competitors $344,000 for inferior technology. This pilot pricing disappears when we prove success elsewhere. Do you want to lead or follow?",
      psychology: "Acknowledge + urgency + competitive pressure + choice"
    },
    {
      objection: "📡 'What about internet outages?'",
      response: "PERFECT question. GodsIMiJ PIONEERED the ONLY system that works offline. Epic crashes, we keep running. Internet dies, we keep saving lives. That's what SOVEREIGNTY means - unbreakable INNOVATIVE patient care.",
      psychology: "Enthusiasm + SOVEREIGN advantage + PIONEER reliability promise"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-5xl font-bold text-destructive animate-pulse">💥 OBJECTION DEMOLITION ARSENAL 💥</h2>
        <p className="text-2xl font-semibold text-primary">Nuclear responses for every pushback</p>
        <p className="text-lg text-muted-foreground">No objection survives contact with these replies</p>
      </div>

      <div className="space-y-6">
        {objections.map((item, index) => (
          <Card key={index} className="p-6 border-2 border-destructive/30 bg-gradient-to-r from-destructive/5 to-primary/5">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Badge variant="destructive" className="text-xs font-bold">
                  OBJECTION {index + 1}
                </Badge>
                <h3 className="text-xl font-bold text-destructive flex-1">{item.objection}</h3>
              </div>
              
              <Card className="p-4 bg-card border-2 border-primary/20">
                <h4 className="font-semibold text-primary mb-2">🚀 NUCLEAR RESPONSE:</h4>
                <p className="text-lg font-medium text-foreground italic">
                  "{item.response}"
                </p>
              </Card>
              
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  🧠 Psychology: {item.psychology}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-gradient-to-r from-green-100 to-blue-100 border-2 border-green-500">
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold text-green-800">🎯 OBJECTION HANDLING MASTERY</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-lg font-bold text-green-700">ACKNOWLEDGE</p>
              <p className="text-sm text-green-600">Show you understand their concern</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-blue-700">REFRAME</p>
              <p className="text-sm text-blue-600">Shift perspective to your advantage</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-purple-700">CLOSE</p>
              <p className="text-sm text-purple-600">Move toward commitment</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function OnePageSlide() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-primary">One‑Pager</h2>
        <p className="text-xl text-muted-foreground">Print Handout</p>
      </div>

      <Card className="p-6 bg-muted/30">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold">Investment</h3>
              <p><strong>Price:</strong> $65,000 + $2,500/mo</p>
              <p><strong>Year‑1 total:</strong> $95,000</p>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold">Savings</h3>
              <p><strong>vs Epic:</strong> $249,000</p>
              <p><strong>vs Cerner:</strong> $175,000</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Includes</h3>
            <p>Patient AI app, clinic dashboard, 18‑hour training, sovereign server, audits, founder support</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Results</h3>
            <p>Faster care, higher trust, resilient ops, measurable ROI in 90–180 days</p>
          </div>

          <div className="border-t border-border pt-4 space-y-2">
            <p className="font-bold text-primary">
              🚀 GodsIMiJ AI Solutions - Healthcare SOVEREIGNTY Pioneers 🚀
            </p>
            <p className="font-medium">
              Contact: James D. Ingersoll — 613‑318‑9711 • james@godsimij‑ai‑solutions.com
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}