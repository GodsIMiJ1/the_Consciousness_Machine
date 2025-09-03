import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ChevronLeft, ChevronRight, DollarSign, Users, Shield, Zap, FileText } from 'lucide-react';
import { TalkTrackSlide, ObjectionHandlerSlide, OnePageSlide } from './AppendixSlides';

interface Slide {
  id: number;
  title: string;
  component: React.ReactNode;
}

export function PitchDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [nuclearMode, setNuclearMode] = useState(true);

  const slides: Slide[] = [
    {
      id: 1,
      title: "Title",
      component: <TitleSlide />
    },
    {
      id: 2,
      title: "The Problem",
      component: <ProblemSlide />
    },
    {
      id: 3,
      title: "The Solution",
      component: <ProductionReadySlide />
    },
    {
      id: 4,
      title: "Pilot Offer",
      component: <PilotOfferSlide />
    },
    {
      id: 5,
      title: "ROI Comparison",
      component: <ROISlide />
    },
    {
      id: 6,
      title: "Competitive Advantage",
      component: <CompetitiveAdvantageSlide />
    },
    {
      id: 7,
      title: "Live Demo",
      component: <DemoSlide />
    },
    {
      id: 8,
      title: "Clinical Outcomes",
      component: <OutcomesSlide />
    },
    {
      id: 9,
      title: "Training",
      component: <TrainingSlide />
    },
    {
      id: 10,
      title: "Timeline",
      component: <TimelineSlide />
    },
    {
      id: 11,
      title: "Urgency & Scarcity",
      component: <UrgencySlide />
    },
    {
      id: 12,
      title: "Guarantees",
      component: <GuaranteesSlide />
    },
    {
      id: 13,
      title: "Partnership Terms",
      component: <TermsSlide />
    },
    {
      id: 14,
      title: "Call to Action",
      component: <CallToActionSlide />
    },
    {
      id: 15,
      title: "Closing Vision",
      component: <ClosingVisionSlide />
    },
    {
      id: 16,
      title: "Talk Track",
      component: <TalkTrackSlide />
    },
    {
      id: 17,
      title: "Objection Handler",
      component: <ObjectionHandlerSlide />
    },
    {
      id: 18,
      title: "One‑Pager",
      component: <OnePageSlide />
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' && currentSlide < slides.length - 1) {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      } else if (event.key === 'ArrowLeft' && currentSlide > 0) {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
      } else if (event.key === 'Escape') {
        setShowMenu(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, slides.length]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-semibold ${nuclearMode ? 'animate-pulse text-destructive' : ''}`}>
              {nuclearMode ? '💥🚀' : '🔥'} PEMBROKE METHADONE CLINIC {nuclearMode ? '🚀💥' : ''}
            </h1>
            <p className={`${nuclearMode ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
              {nuclearMode ? 'NUCLEAR SOVEREIGNTY DECK - MAXIMUM OVERDRIVE' : 'SOVEREIGNTY INNOVATION DECK'} | GodsIMiJ AI Solutions
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant={nuclearMode ? "destructive" : "outline"}
              size="sm"
              onClick={() => setNuclearMode(!nuclearMode)}
              className="animate-pulse"
            >
              {nuclearMode ? "💥" : "⚡"} {nuclearMode ? "NUCLEAR" : "STANDARD"}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowMenu(!showMenu)}
            >
              <FileText className="w-4 h-4 mr-2" />
              Menu
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentSlide + 1} / {slides.length}
            </span>
          </div>
        </div>
      </div>

      {/* Slide Menu */}
      {showMenu && (
        <div className="border-b border-border bg-muted/30">
          <div className="max-w-6xl mx-auto p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {slides.map((slide, index) => (
                <Button
                  key={slide.id}
                  variant={index === currentSlide ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    goToSlide(index);
                    setShowMenu(false);
                  }}
                  className="text-xs justify-start"
                >
                  {slide.id}. {slide.title}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Slide Content */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="min-h-[600px]">
          {slides[currentSlide].component}
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t border-border p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={prevSlide}
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {/* Slide Indicators */}
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide 
                    ? 'bg-primary' 
                    : 'bg-muted hover:bg-muted-foreground/20'
                }`}
              />
            ))}
          </div>

          <Button 
            variant="outline" 
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Slide Components
function TitleSlide() {
  const [currentHook, setCurrentHook] = useState(0);
  
  const hooks = [
    {
      title: "The Epic Killer",
      main: "What if I told you that Epic EMR costs $296,000 and gives your patients... software.",
      secondary: "We cost $95,000 and give your patients AI companions that prevent suicides.",
      question: "Which one sounds more important?"
    },
    {
      title: "The Time Machine",
      main: "I'm about to show you healthcare technology from 2030.",
      secondary: "It exists TODAY. It costs less than Epic's 2015 technology.",
      question: "And Pembroke gets it first."
    },
    {
      title: "The Patient Revolution", 
      main: "Every patient who walks through Pembroke's doors is struggling with addiction alone.",
      secondary: "What if they never had to be alone again?",
      question: "What if they had an AI companion supporting them 24/7?"
    }
  ];

  const currentHookData = hooks[currentHook];

  return (
    <div className="h-full flex flex-col">
      {/* Hook Selection */}
      <div className="flex justify-center gap-2 p-4">
        {hooks.map((hook, index) => (
          <Button
            key={index}
            variant={index === currentHook ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentHook(index)}
            className="text-xs"
          >
            {hook.title}
          </Button>
        ))}
      </div>

      <Card className="flex-1 flex flex-col justify-center bg-gradient-to-br from-primary/5 to-destructive/5 border-2 border-primary/20">
        <CardContent className="text-center space-y-8 p-12">
          <div className="space-y-6">
            <h1 className="text-6xl font-bold text-primary animate-pulse">
              🚀💥 HEALTHCARE REVOLUTION 💥🚀
            </h1>
            
            <div className="space-y-4 p-6 bg-card rounded-lg border-2 border-primary/30">
              <p className="text-2xl font-semibold text-foreground">
                {currentHookData.main}
              </p>
              <p className="text-xl text-green-600 font-medium">
                {currentHookData.secondary}
              </p>
              <p className="text-lg text-destructive font-semibold italic">
                {currentHookData.question}
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <Badge variant="destructive" className="text-xl px-8 py-3 animate-bounce">
              🔥 NUCLEAR PITCH DECK 🔥
            </Badge>
            <p className="text-xl text-primary font-bold">
              🚀 GodsIMiJ AI Solutions 🚀
            </p>
            <p className="text-xl text-muted-foreground">
              AURA‑BREE Sovereign Ecosystem × MethaClinic Command Center
            </p>
            <p className="text-lg font-bold text-destructive">
              Pembroke becomes Canada's FIRST SOVEREIGN AI PIONEER
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-green-50 border-green-200">
              <p className="font-semibold text-green-800">SAVE</p>
              <p className="text-2xl font-bold text-green-600">$249,000</p>
              <p className="text-sm text-green-600">vs Epic Year 1</p>
            </Card>
            <Card className="p-4 bg-blue-50 border-blue-200">
              <p className="font-semibold text-blue-800">SUPPORT</p>
              <p className="text-2xl font-bold text-blue-600">24/7</p>
              <p className="text-sm text-blue-600">AI Companions</p>
            </Card>
            <Card className="p-4 bg-purple-50 border-purple-200">
              <p className="font-semibold text-purple-800">TRAIN</p>
              <p className="text-2xl font-bold text-purple-600">18 Hours</p>
              <p className="text-sm text-purple-600">vs Months</p>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProblemSlide() {
  const problems = [
    {
      title: "💸 BLEEDING MONEY",
      description: "Epic EMR: $296,000 year‑1. Cerner: $222,000. For what? Software that crashes when patients need help most.",
      icon: <DollarSign className="w-6 h-6" />,
      impact: "Your budget is being DESTROYED"
    },
    {
      title: "🆘 PATIENTS SUFFER ALONE",
      description: "2 AM crisis. Weekend relapse. Holiday despair. Your patients have NOWHERE to turn when they need support most.",
      icon: <Users className="w-6 h-6" />,
      impact: "Lives are being LOST"
    },
    {
      title: "⏳ STAFF DROWNING",
      description: "6+ months training. Constant updates. Workflows that fight you. Your team spends more time fighting technology than helping patients.",
      icon: <Zap className="w-6 h-6" />,
      impact: "Expertise is being WASTED"
    },
    {
      title: "🔓 TRUST ERODING",
      description: "Patient data sold to highest bidder. Complex consent. Zero transparency. Patients don't trust you because they can't trust your systems.",
      icon: <Shield className="w-6 h-6" />,
      impact: "Relationships are being BROKEN"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-5xl font-bold text-destructive animate-pulse">💥 THE HEALTHCARE CRISIS 💥</h2>
        <p className="text-2xl text-destructive font-semibold">What you endure EVERY SINGLE DAY</p>
        <p className="text-lg text-muted-foreground italic">While Epic laughs all the way to the bank...</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {problems.map((problem, index) => (
          <Card key={index} className="p-6 border-2 border-destructive/30 bg-destructive/5 hover:bg-destructive/10 transition-colors">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 p-3 bg-destructive/20 rounded-lg text-destructive animate-bounce">
                {problem.icon}
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-destructive">{problem.title}</h3>
                <p className="text-foreground font-medium">{problem.description}</p>
                <Badge variant="destructive" className="text-xs">
                  {problem.impact}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-gradient-to-r from-destructive/10 to-destructive/20 border-destructive">
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold text-destructive">THE BRUTAL TRUTH</h3>
          <p className="text-lg">
            Every day you delay modernizing is another day patients struggle alone, 
            staff burn out, and competitors gain advantage. 
            <span className="font-bold text-destructive"> How much longer can you afford to wait?</span>
          </p>
        </div>
      </Card>
    </div>
  );
}


function ProductionReadySlide() {
  const systems = [
    {
      name: "🤖 AURA-BREE: THE AI COMPANION REVOLUTION",
      status: "LIVE & DEPLOYED",
      description: "24/7 therapeutic AI that PREVENTS suicides, detects crises BEFORE they happen, and gives patients a companion that NEVER judges, NEVER sleeps, NEVER abandons them.",
      proof: "Progressive Web App, offline-first architecture",
      color: "bg-gradient-to-r from-blue-500 to-blue-700",
      badge: "SAVES LIVES",
      features: ["Crisis Prevention AI", "Mood Pattern Recognition", "Spiritual Support Tools", "100% Patient-Owned Data"]
    },
    {
      name: "⚡ METHACLINIC: SOVEREIGN COMMAND CENTER",
      status: "FULL-STACK DEPLOYED",
      description: "Real‑time patient insights that make you OMNISCIENT. AI secretary that makes your staff SUPERHUMAN. Local server that makes you UNBREAKABLE.",
      proof: "React + TypeScript + Supabase, live at GitHub",
      color: "bg-gradient-to-r from-green-500 to-green-700",
      badge: "AMPLIFIES EXPERTISE",
      features: ["AI Secretary Assistant", "Real-time Risk Alerts", "Dosage Intelligence", "Audit Trail Protection"]
    },
    {
      name: "🎓 DR. MENTOR: INSTANT AI MASTERY",
      status: "COMPLETE LMS DEPLOYED",
      description: "18 hours to AI expertise vs 18 MONTHS with Epic. Your staff becomes the most advanced healthcare AI team in Ontario. Period.",
      proof: "Live at methaclinic-training.netlify.app",
      color: "bg-gradient-to-r from-purple-500 to-purple-700",
      badge: "CREATES LEGENDS",
      features: ["18-Hour Certification", "Crisis Response Training", "AI Collaboration Skills", "Industry Recognition"]
    },
    {
      name: "🛡️ BIANCADESK: 24/7 AI SUPPORT FORTRESS",
      status: "24/7 AI SUPPORT LIVE",
      description: "Intelligent clinical decision support with structured triage. Technical and therapeutic support that never sleeps.",
      proof: "Voice-enabled, complete audit logging, founder escalation",
      color: "bg-gradient-to-r from-orange-500 to-red-700",
      badge: "UNBREAKABLE SUPPORT",
      features: ["WHO + PRODUCT + CATEGORY + SEVERITY workflow", "Knowledge base integration", "Voice interface", "Complete audit logging"]
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-6xl font-bold bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent animate-pulse">
          🚀 THE REVOLUTION 🚀
        </h2>
        <p className="text-2xl font-semibold text-primary">Complete SOVEREIGN Ecosystem by GodsIMiJ AI Solutions</p>
        <p className="text-xl text-green-600 font-bold">NOT concepts. NOT prototypes. REAL DEPLOYED SYSTEMS.</p>
        <p className="text-lg text-destructive font-medium">PIONEERING Innovation from 2030. Available TODAY.</p>
      </div>

      <div className="space-y-6">
        {systems.map((system, index) => (
          <Card key={index} className="p-6 border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-green-600/5 hover:shadow-xl transition-all duration-300">
            <div className="flex items-start gap-6">
              <div className={`w-6 h-20 rounded-lg ${system.color} flex-shrink-0 animate-pulse`} />
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-primary">{system.name}</h3>
                  <Badge variant="destructive" className="text-sm font-bold">
                    {system.badge}
                  </Badge>
                </div>
                <div className="space-y-3">
                  <p className="text-lg font-bold text-green-700">
                    🚀 STATUS: {system.status}
                  </p>
                  <p className="text-lg font-medium text-foreground">{system.description}</p>
                  <p className="text-sm text-muted-foreground italic">
                    ✓ Technical proof: {system.proof}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {system.features.map((feature, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        ✓ {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-gradient-to-r from-primary/10 to-green-600/10 border-2 border-primary">
        <div className="text-center space-y-4">
          <h3 className="text-3xl font-bold text-primary">🔥 THE ECOSYSTEM ADVANTAGE 🔥</h3>
          <p className="text-xl font-semibold">
            Four pieces, one UNSTOPPABLE system — patient transformation, clinic domination, staff mastery, unbreakable support
          </p>
          <div className="flex justify-center gap-4">
            <Badge variant="outline" className="text-lg px-6 py-2 font-bold">
              Patient-Centric
            </Badge>
            <Badge variant="outline" className="text-lg px-6 py-2 font-bold">
              Clinic-Owned
            </Badge>
            <Badge variant="outline" className="text-lg px-6 py-2 font-bold">
              Future-Proof
            </Badge>
          </div>
        </div>
      </Card>

      <Card className="p-8 bg-gradient-to-r from-green-100 to-blue-100 border-4 border-green-500">
        <div className="text-center space-y-6">
          <h3 className="text-4xl font-bold text-green-800">🔥 THE DEPLOYMENT ADVANTAGE 🔥</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-2xl font-bold text-green-700">ZERO</p>
              <p className="text-lg font-semibold text-green-600">Development Risk</p>
              <p className="text-sm text-green-600">Everything already works</p>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-blue-700">IMMEDIATE</p>
              <p className="text-lg font-semibold text-blue-600">Deployment</p>
              <p className="text-sm text-blue-600">No waiting for development</p>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-purple-700">PROVEN</p>
              <p className="text-lg font-semibold text-purple-600">Reliability</p>
              <p className="text-sm text-purple-600">Battle-tested in production</p>
            </div>
          </div>

          <Card className="p-6 bg-gradient-to-r from-destructive/20 to-primary/20 border-2 border-destructive">
            <p className="text-2xl font-bold text-destructive">
              💥 EPIC TAKES 18+ MONTHS TO DEPLOY 💥
            </p>
            <p className="text-xl font-semibold text-primary">
              WE DEPLOY IN 30 DAYS
            </p>
            <p className="text-lg text-foreground">
              Because everything is already BUILT, TESTED, and PROVEN
            </p>
          </Card>
        </div>
      </Card>
    </div>
  );
}

function PilotOfferSlide() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-primary">Pilot Offer & Pricing</h2>
        <p className="text-xl text-muted-foreground">6-Month Pilot Program</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="text-2xl">Pilot Components</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Core System: AURA‑BREE + MethaClinic + AURA AI Secretary + BiancaDesk</span>
                <span className="text-xl font-semibold">$50,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Training Platform: Complete ecosystem training</span>
                <span className="text-xl font-semibold">$15,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Monthly Services (50% pilot discount)</span>
                <span className="text-xl font-semibold">$2,500/mo</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-6 bg-primary/5 border-primary">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Total Investment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-3xl font-bold text-primary">$95,000</p>
              <p className="text-lg text-muted-foreground">Year‑1 Pilot Total</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Regular value $125,000</p>
              <p className="text-sm text-green-600 font-medium">
                Pilot savings: $60,000 upfront + $30,000/yr services = $60,000 savings
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ROISlide() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-5xl font-bold text-destructive animate-pulse">💰 THE NUMBERS DON'T LIE 💰</h2>
        <p className="text-2xl font-semibold text-primary">Industry Comparison - WE DESTROY THE COMPETITION</p>
      </div>

      <Card className="p-6 border-2 border-destructive bg-gradient-to-br from-destructive/5 to-primary/5">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-destructive">
                <th className="text-left p-4 font-bold text-lg">System</th>
                <th className="text-right p-4 font-bold text-lg">Year‑1 Cost</th>
                <th className="text-center p-4 font-bold text-lg">AI Companions</th>
                <th className="text-center p-4 font-bold text-lg">Patient Owns Data</th>
                <th className="text-center p-4 font-bold text-lg">Training Time</th>
                <th className="text-center p-4 font-bold text-lg">Crisis Prevention</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b bg-destructive/10">
                <td className="p-4 font-semibold">💸 Epic EMR + Support + Mental Health</td>
                <td className="p-4 text-right font-bold text-destructive text-xl">$344,000</td>
                <td className="p-4 text-center text-destructive font-bold text-xl">❌</td>
                <td className="p-4 text-center text-destructive font-bold text-xl">❌</td>
                <td className="p-4 text-center text-destructive font-semibold">6+ Months</td>
                <td className="p-4 text-center text-destructive font-bold text-xl">❌</td>
              </tr>
              <tr className="border-b bg-destructive/10">
                <td className="p-4 font-semibold">💸 Cerner + Support + Crisis Systems</td>
                <td className="p-4 text-right font-bold text-destructive text-xl">$270,000</td>
                <td className="p-4 text-center text-destructive font-bold text-xl">❌</td>
                <td className="p-4 text-center text-destructive font-bold text-xl">❌</td>
                <td className="p-4 text-center text-destructive font-semibold">6+ Months</td>
                <td className="p-4 text-center text-destructive font-bold text-xl">❌</td>
              </tr>
              <tr className="bg-gradient-to-r from-primary/20 to-green-600/20 border-2 border-primary">
                <td className="p-4 font-bold text-primary text-lg">🚀 AURA‑BREE</td>
                <td className="p-4 text-right font-bold text-primary text-2xl">$95,000</td>
                <td className="p-4 text-center text-green-600 font-bold text-2xl">✅</td>
                <td className="p-4 text-center text-green-600 font-bold text-2xl">✅</td>
                <td className="p-4 text-center font-bold text-primary text-lg">18 Hours</td>
                <td className="p-4 text-center text-green-600 font-bold text-2xl">✅</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-green-100 to-green-200 border-2 border-green-500">
          <h3 className="text-2xl font-bold text-green-800 mb-4 text-center">💰 MASSIVE SAVINGS</h3>
          <div className="space-y-3 text-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-700">$249,000</p>
              <p className="text-sm font-semibold text-green-600">SAVED vs Epic</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-700">$175,000</p>
              <p className="text-sm font-semibold text-green-600">SAVED vs Cerner</p>
            </div>
            <Badge variant="destructive" className="text-sm font-bold">
              Year 1 Savings ALONE
            </Badge>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-blue-500">
          <h3 className="text-2xl font-bold text-blue-800 mb-4 text-center">⚡ OPERATIONAL DOMINATION</h3>
          <div className="space-y-2 text-blue-700 font-semibold">
            <p>🚀 &lt;1s sync speed</p>
            <p>🛡️ 99.7% uptime guarantee</p>
            <p>⏰ 40% more patient time</p>
            <p>🔒 100% privacy trust</p>
            <p>🌐 Works offline always</p>
            <p>🎯 Zero vendor lock-in</p>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-100 to-purple-200 border-2 border-purple-500">
          <h3 className="text-2xl font-bold text-purple-800 mb-4 text-center">🏆 SOVEREIGNTY PIONEER ADVANTAGE</h3>
          <div className="space-y-2 text-purple-700 font-semibold">
            <p>🥇 First SOVEREIGN AI clinic in Canada</p>
            <p>📺 Media attention magnet as INNOVATION leader</p>
            <p>🎤 Conference speaking as SOVEREIGNTY pioneer</p>
            <p>📈 Patient attraction unprecedented</p>
            <p>🛡️ Unbreachable SOVEREIGN competitive moat</p>
            <p>👑 Healthcare SOVEREIGNTY thought leadership</p>
          </div>
        </Card>
      </div>

      <Card className="p-8 bg-gradient-to-r from-destructive/20 to-primary/20 border-2 border-primary">
        <div className="text-center space-y-4">
          <h3 className="text-4xl font-bold text-primary">🔥 THE NUCLEAR TRUTH 🔥</h3>
          <p className="text-2xl font-semibold">
            Epic charges <span className="text-destructive">$249,000 MORE</span> for <span className="text-destructive">ZERO AI</span>,
            <span className="text-destructive"> ZERO patient ownership</span>, and <span className="text-destructive">MONTHS</span> of training hell.
          </p>
          <p className="text-xl text-primary font-bold">
            We give you the FUTURE for LESS than they charge for the PAST.
          </p>
        </div>
      </Card>
    </div>
  );
}

function CompetitiveAdvantageSlide() {
  const advantages = [
    {
      title: "🤖 Therapeutic AI Companions",
      description: "24/7 professional mental health support with crisis intervention",
      competitor: "NO competitor has this",
      icon: "🤖",
      color: "bg-gradient-to-r from-blue-500 to-blue-700"
    },
    {
      title: "🆘 Crisis Prevention Technology",
      description: "Proactive suicide detection and intervention protocols",
      competitor: "Epic/Cerner: ZERO crisis prevention",
      icon: "🆘",
      color: "bg-gradient-to-r from-red-500 to-red-700"
    },
    {
      title: "👑 Complete Data Sovereignty",
      description: "Patients own all therapeutic data, works offline",
      competitor: "Epic/Cerner: Cloud dependency, vendor lock-in",
      icon: "👑",
      color: "bg-gradient-to-r from-purple-500 to-purple-700"
    },
    {
      title: "🎯 Multi-AI Coordination",
      description: "Patient AI + Clinical AI + Support AI + Training AI",
      competitor: "Epic/Cerner: No AI integration",
      icon: "🎯",
      color: "bg-gradient-to-r from-green-500 to-green-700"
    },
    {
      title: "⚡ Offline-First Architecture",
      description: "Works without internet connectivity",
      competitor: "Epic/Cerner: Crashes without internet",
      icon: "⚡",
      color: "bg-gradient-to-r from-yellow-500 to-orange-700"
    },
    {
      title: "🎓 Production-Grade Training",
      description: "Dr. Mentor AI tutor system - 18 hours vs 6+ months",
      competitor: "Epic/Cerner: Months of training hell",
      icon: "🎓",
      color: "bg-gradient-to-r from-indigo-500 to-indigo-700"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-5xl font-bold bg-gradient-to-r from-primary to-destructive bg-clip-text text-transparent animate-pulse">
          🚀 UNBEATABLE ADVANTAGES 🚀
        </h2>
        <p className="text-2xl font-semibold text-primary">What NO competitor can match</p>
        <p className="text-lg text-destructive font-medium">These features don't exist anywhere else</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {advantages.map((advantage, index) => (
          <Card key={index} className="p-6 border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-destructive/5 hover:shadow-xl transition-all duration-300">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg ${advantage.color} flex items-center justify-center text-2xl animate-pulse`}>
                  {advantage.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-primary">{advantage.title}</h3>
                  <p className="text-sm font-medium text-foreground">{advantage.description}</p>
                </div>
              </div>

              <Card className="p-3 bg-destructive/10 border border-destructive/30">
                <p className="text-sm font-bold text-destructive">
                  🔥 {advantage.competitor}
                </p>
              </Card>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-8 bg-gradient-to-r from-primary/20 to-destructive/20 border-4 border-primary">
        <div className="text-center space-y-4">
          <h3 className="text-4xl font-bold text-primary">💥 THE MONOPOLY TRUTH 💥</h3>
          <p className="text-2xl font-semibold">
            These aren't just features - they're <span className="text-destructive">IMPOSSIBLE TO REPLICATE</span> advantages
          </p>
          <p className="text-xl text-primary font-bold">
            Epic would need 5+ years and $50M+ to build what we have TODAY
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Badge variant="destructive" className="text-lg px-6 py-3 font-bold">
              🏆 FIRST MOVER
            </Badge>
            <Badge variant="destructive" className="text-lg px-6 py-3 font-bold">
              🛡️ UNBREACHABLE MOAT
            </Badge>
            <Badge variant="destructive" className="text-lg px-6 py-3 font-bold">
              👑 MARKET DOMINATION
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}

function DemoSlide() {
  const [currentAct, setCurrentAct] = useState(0);
  
  const acts = [
    {
      title: "🆘 ACT I: THE PATIENT CRISIS",
      subtitle: "2 minutes - Heart-stopping reality",
      emotion: "CONCERN → RELIEF",
      description: "Sarah, 34, mother of two, struggling with methadone treatment. It's 2:47 AM. She's having intense cravings and suicidal thoughts.",
      flow: [
        "📱 Sarah opens AURA-BREE in desperate state",
        "🤖 AI detects crisis language patterns INSTANTLY",
        "🚨 Automatic suicide risk assessment triggered",
        "💭 AI companion begins immediate de-escalation",
        "🛡️ Crisis intervention protocol activated",
        "✅ Patient guided to safety resources"
      ],
      impact: "THIS COULD SAVE SARAH'S LIFE"
    },
    {
      title: "⚡ ACT II: THE CLINICAL RESPONSE", 
      subtitle: "3 minutes - Superhuman staff capabilities",
      emotion: "AMAZEMENT → REALIZATION",
      description: "Meanwhile at Pembroke: The MethaClinic dashboard comes alive with AI-powered insights that make your staff OMNISCIENT.",
      flow: [
        "📊 Crisis alert appears on clinic dashboard",
        "🤖 AI Secretary provides instant patient summary",
        "📈 Risk assessment with recommended actions",
        "💊 Dosage adjustment suggestions based on mood data",
        "📞 Automated crisis response checklist",
        "✅ Dr. Mentor training guides staff response"
      ],
      impact: "YOUR STAFF BECOMES SUPERHUMAN"
    },
    {
      title: "👑 ACT III: THE SOVEREIGNTY REVOLUTION",
      subtitle: "2 minutes - Absolute SOVEREIGNTY demonstration", 
      emotion: "MIND-BLOWN → CONVICTION",
      description: "The killer feature that NO other system can match: Complete SOVEREIGN data control and unbreakable INNOVATION privacy architecture.",
      flow: [
        "🔌 DISCONNECT internet completely",
        "💪 System continues running flawlessly",
        "🔒 Patient data stays 100% local",
        "📝 Immutable audit trail maintained",
        "👤 Patient controls EVERY data permission",
        "🚀 Sync resumes when connection restored"
      ],
      impact: "TOTAL SOVEREIGNTY DOMINATION"
    }
  ];

  const currentActData = acts[currentAct];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-5xl font-bold text-primary animate-pulse">🎬 LIVE DEMO THEATER 🎬</h2>
        <p className="text-2xl font-semibold text-destructive">7 minutes that will BLOW YOUR MIND</p>
        <p className="text-lg text-muted-foreground">Three acts, one DEVASTATING demonstration</p>
      </div>

      {/* Act Selection */}
      <div className="flex justify-center gap-2">
        {acts.map((act, index) => (
          <Button
            key={index}
            variant={index === currentAct ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentAct(index)}
            className="text-xs"
          >
            Act {index + 1}
          </Button>
        ))}
      </div>

      {/* Current Act Display */}
      <Card className="p-8 border-2 border-primary bg-gradient-to-br from-primary/5 to-destructive/5">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-3xl font-bold text-primary">{currentActData.title}</h3>
            <p className="text-lg font-semibold text-destructive">{currentActData.subtitle}</p>
            <Badge variant="secondary" className="text-sm">
              Emotional Journey: {currentActData.emotion}
            </Badge>
          </div>

          <Card className="p-6 bg-card">
            <h4 className="text-xl font-semibold mb-3">📖 Scenario</h4>
            <p className="text-muted-foreground italic">{currentActData.description}</p>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentActData.flow.map((step, index) => (
              <Card key={index} className="p-4 bg-muted/50">
                <p className="font-medium">{step}</p>
              </Card>
            ))}
          </div>

          <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-500">
            <div className="text-center">
              <h4 className="text-xl font-bold text-green-800 mb-2">💥 IMPACT</h4>
              <p className="text-lg font-semibold text-green-700">{currentActData.impact}</p>
            </div>
          </Card>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-blue-50 border-blue-200 text-center">
          <h4 className="font-bold text-blue-800">🎯 Demo Objective</h4>
          <p className="text-sm text-blue-700">Prove impossibility of saying NO</p>
        </Card>
        <Card className="p-4 bg-green-50 border-green-200 text-center">
          <h4 className="font-bold text-green-800">⚡ Energy Level</h4>
          <p className="text-sm text-green-700">MAXIMUM OVERDRIVE</p>
        </Card>
        <Card className="p-4 bg-purple-50 border-purple-200 text-center">
          <h4 className="font-bold text-purple-800">🔥 Closing Power</h4>
          <p className="text-sm text-purple-700">NUCLEAR DEVASTATION</p>
        </Card>
      </div>

      <Card className="p-8 bg-gradient-to-r from-destructive/20 to-primary/20 border-4 border-destructive">
        <div className="text-center space-y-6">
          <h3 className="text-3xl font-bold text-destructive">💥 THE "REVOLUTIONARY MOMENT" 💥</h3>
          <p className="text-xl font-semibold text-foreground">
            "Watch what happens when a methadone patient struggles with suicidal thoughts at 3 AM..."
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4 bg-destructive/10 border-destructive">
              <h4 className="font-bold text-destructive mb-2">❌ BEFORE AURA-BREE:</h4>
              <ul className="text-sm text-left space-y-1">
                <li>• Patient suffers alone until morning</li>
                <li>• Crisis escalates without intervention</li>
                <li>• Potential overdose or self-harm</li>
                <li>• Emergency room visit or worse</li>
              </ul>
            </Card>

            <Card className="p-4 bg-green-50 border-green-500">
              <h4 className="font-bold text-green-800 mb-2">✅ WITH AURA-BREE ECOSYSTEM:</h4>
              <ul className="text-sm text-left space-y-1">
                <li>• AURA-BREE provides immediate therapeutic support</li>
                <li>• Crisis techniques deployed instantly</li>
                <li>• MethaClinic staff alerted with full context</li>
                <li>• BiancaDesk guides professional response</li>
                <li>• Patient supported through crisis resolution</li>
              </ul>
            </Card>
          </div>

          <p className="text-xl font-bold text-primary">
            "This isn't just healthcare software - this is AI that prevents mental health crises and saves lives!"
          </p>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-r from-destructive/10 to-primary/10 border-2 border-primary">
        <div className="text-center space-y-3">
          <h3 className="text-2xl font-bold text-primary">🚀 DEMO GUARANTEE</h3>
          <p className="text-lg font-semibold">
            After this demo, you'll either sign immediately or ask us to leave.
          </p>
          <p className="text-sm text-muted-foreground italic">
            No one has ever asked us to leave.
          </p>
        </div>
      </Card>
    </div>
  );
}

function OutcomesSlide() {
  const outcomes = [
    {
      title: "24/7 Support",
      description: "Patients never alone; proactive crisis prevention",
      icon: "🌟"
    },
    {
      title: "Better Adherence",
      description: "Daily check‑ins + reflective tools → engagement",
      icon: "📈"
    },
    {
      title: "Safer Care",
      description: "Dosage decisions informed by longitudinal mood data",
      icon: "🛡️"
    },
    {
      title: "Trust & Privacy",
      description: "Transparent consent; patient data stays local",
      icon: "🔒"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-primary">Clinical Outcomes</h2>
        <p className="text-xl text-muted-foreground">Why this matters</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {outcomes.map((outcome, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-start gap-4">
              <span className="text-3xl">{outcome.icon}</span>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{outcome.title}</h3>
                <p className="text-muted-foreground">{outcome.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-muted/50">
        <p className="text-center text-muted-foreground italic">
          Tied to methadone realities: relapse risk, weekend gaps, transportation challenges
        </p>
      </Card>
    </div>
  );
}

function TrainingSlide() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-primary">Training & Change Management</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Dr. Mentor Tracks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Badge variant="secondary">Reception</Badge>
              <Badge variant="secondary">Nursing</Badge>
              <Badge variant="secondary">Prescriber</Badge>
              <Badge variant="secondary">Admin</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader>
            <CardTitle>Format & Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p><strong>Format:</strong> 3 × 6‑hour sessions (onsite/remote)</p>
              <p><strong>Method:</strong> Role‑play, certification</p>
              <p><strong>Target:</strong> 95%+ staff certified in Month 1</p>
              <p><strong>Follow-up:</strong> Refresher in Month 3</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Badge variant="outline" className="text-lg px-6 py-2">
          Reduces friction; improves morale
        </Badge>
      </div>
    </div>
  );
}

function TimelineSlide() {
  const timeline = [
    {
      month: "Month 1",
      activities: "Install, security hardening, baseline metrics, staff cohort 1"
    },
    {
      month: "Month 2",
      activities: "Go‑Live (core flows), side‑by‑side ops, daily standups"
    },
    {
      month: "Month 3",
      activities: "Advanced AI features, cohort 2 certs, crisis drills"
    },
    {
      month: "Month 4–5",
      activities: "Optimization, adherence programs, reporting"
    },
    {
      month: "Month 6",
      activities: "ROI review, case study, expansion planning"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-primary">Timeline</h2>
        <p className="text-xl text-muted-foreground">6‑Month Pilot</p>
      </div>

      <div className="space-y-4">
        {timeline.map((item, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-start gap-4">
              <Badge variant="outline" className="flex-shrink-0">
                {item.month}
              </Badge>
              <p className="text-muted-foreground">{item.activities}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Badge variant="outline" className="text-lg px-6 py-2">
          Predictable timeline; we do the heavy lifting
        </Badge>
      </div>
    </div>
  );
}

function UrgencySlide() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-5xl font-bold text-destructive animate-pulse">⏰ THIS OPPORTUNITY WON'T LAST ⏰</h2>
        <p className="text-2xl font-semibold text-primary">Time is Running Out</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6 border-2 border-destructive bg-gradient-to-r from-destructive/10 to-destructive/20">
          <CardHeader>
            <CardTitle className="text-2xl text-destructive">🔥 PILOT PRICING EXPIRES</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <p className="font-semibold">• Only 3 pilot partners being selected across Canada</p>
              <p className="font-semibold">• 60% training discount ends when pilot proves success</p>
              <p className="font-semibold">• Founder support limited to pilot phase only</p>
              <p className="font-semibold">• Custom development only available during pilot</p>
            </div>
          </CardContent>
        </Card>

        <Card className="p-6 border-2 border-primary bg-gradient-to-r from-primary/10 to-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">⚡ COMPETITION IS COMING</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <p className="font-semibold">• Epic will copy this in 2-3 years and charge $100K+</p>
              <p className="font-semibold">• Government regulations may require sovereignty soon</p>
              <p className="font-semibold">• Early adopters get massive competitive advantage</p>
              <p className="font-semibold">• Late adopters pay full price for standard features</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="p-8 bg-gradient-to-r from-destructive/20 to-primary/20 border-4 border-destructive">
        <div className="text-center space-y-6">
          <h3 className="text-4xl font-bold text-destructive">🚨 MARKET TIMING 🚨</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="text-lg font-bold text-destructive">AI healthcare is exploding in 2025</p>
              <p className="text-lg font-bold text-destructive">Data privacy regulations tightening globally</p>
            </div>
            <div className="space-y-3">
              <p className="text-lg font-bold text-primary">Patient rights movement demanding data control</p>
              <p className="text-lg font-bold text-primary">Addiction treatment needs innovation NOW</p>
            </div>
          </div>

          <Card className="p-6 bg-gradient-to-r from-destructive/30 to-primary/30 border-2 border-destructive">
            <p className="text-3xl font-bold text-destructive">
              The question isn't IF this will happen
            </p>
            <p className="text-2xl font-bold text-primary">
              It's WHO gets there first!
            </p>
          </Card>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-r from-green-100 to-blue-100 border-2 border-green-500">
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold text-green-800">🎯 THE BRUTAL TRUTH</h3>
          <p className="text-xl font-semibold">
            While you're thinking, Epic is charging your competitors $344,000 for inferior technology.
          </p>
          <p className="text-lg font-bold text-destructive">
            This pilot pricing disappears when we prove success elsewhere.
          </p>
          <p className="text-xl font-bold text-primary">
            Do you want to LEAD or FOLLOW?
          </p>
        </div>
      </Card>
    </div>
  );
}

function GuaranteesSlide() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-primary">Guarantees & Metrics</h2>
      </div>

      <div className="space-y-6">
        <Card className="p-6 bg-green-50 border-green-200">
          <h3 className="text-xl font-semibold text-green-800 mb-4">30‑Day Risk‑Free Start</h3>
          <p className="text-green-700">Full refund on training if targets missed</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Success Targets</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">95%+</p>
              <p className="text-sm text-muted-foreground">Certification Rate</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">30%</p>
              <p className="text-sm text-muted-foreground">Workflow Efficiency</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">99.7%</p>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Support Package</h3>
          <div className="space-y-2 text-muted-foreground">
            <p>• Founder‑direct line</p>
            <p>• Monthly audits</p>
            <p>• Incident playbooks</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function TermsSlide() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-primary">Partnership Terms</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Payment Structure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Upfront</span>
                <span className="font-semibold">$32,500</span>
              </div>
              <div className="flex justify-between">
                <span>At Go‑Live</span>
                <span className="font-semibold">$32,500</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly Services</span>
                <span className="font-semibold">$2,500/mo</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader>
            <CardTitle>Scope & Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p><strong>Includes:</strong> Deployment, training, customization, patient onboarding support</p>
              <p><strong>Success Metrics:</strong> Adoption, certification, crisis reduction, uptime</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Badge variant="outline" className="text-lg px-6 py-2">
          Clear and simple; no hidden fees
        </Badge>
      </div>
    </div>
  );
}

function CallToActionSlide() {
  const [currentClose, setCurrentClose] = useState(0);
  
  const closes = [
    {
      title: "🎯 THE ASSUMPTION CLOSE",
      approach: "When we install AURA-BREE at Pembroke, should we start with your highest-risk patients or roll it out to everyone at once?",
      psychology: "Assumes the sale, forces implementation discussion"
    },
    {
      title: "⚖️ THE ALTERNATIVE CLOSE", 
      approach: "Would you prefer the $32,500 upfront payment, or should we discuss a monthly payment structure that fits your budget better?",
      psychology: "Choice between yes and yes, removes 'no' option"
    },
    {
      title: "⏰ THE URGENCY CLOSE",
      approach: "I can hold this pilot pricing until Friday. After that, we'll need to offer it to the next clinic on our list. Can we move forward today?",
      psychology: "Scarcity and time pressure activation"
    },
    {
      title: "🤝 THE PARTNERSHIP CLOSE",
      approach: "This isn't just about buying software - we're offering you a partnership to revolutionize addiction treatment. Are you ready to be part of healthcare history?",
      psychology: "Elevates to mission level, appeals to legacy"
    },
    {
      title: "❤️ THE PATIENT IMPACT CLOSE",
      approach: "How many patients could we help in the 6 months you spend deciding? Every day we delay is another day patients struggle alone. Let's give them AI companions today.",
      psychology: "Guilt and compassion activation"
    }
  ];

  const currentCloseData = closes[currentClose];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-6xl font-bold bg-gradient-to-r from-destructive to-primary bg-clip-text text-transparent animate-pulse">
          💥 NUCLEAR CLOSE SEQUENCE 💥
        </h2>
        <p className="text-2xl font-semibold text-destructive">Time to make history, Pembroke</p>
      </div>

      {/* Close Technique Selector */}
      <div className="flex flex-wrap justify-center gap-2">
        {closes.map((close, index) => (
          <Button
            key={index}
            variant={index === currentClose ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentClose(index)}
            className="text-xs"
          >
            Close {index + 1}
          </Button>
        ))}
      </div>

      {/* Current Close Display */}
      <Card className="p-8 border-2 border-destructive bg-gradient-to-br from-destructive/10 to-primary/10">
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-destructive mb-2">{currentCloseData.title}</h3>
            <Badge variant="secondary" className="text-sm">
              {currentCloseData.psychology}
            </Badge>
          </div>
          
          <Card className="p-6 bg-card border-2 border-primary">
            <p className="text-lg font-semibold text-center italic">
              "{currentCloseData.approach}"
            </p>
          </Card>
        </div>
      </Card>

      {/* Main CTA */}
      <Card className="p-8 text-center space-y-6 bg-gradient-to-r from-primary/20 to-destructive/20 border-4 border-primary">
        <div className="space-y-4">
          <h3 className="text-3xl font-bold text-primary">🚀 TODAY'S MISSION</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-green-50 border-green-500">
              <p className="font-bold text-green-800">✅ APPROVE</p>
              <p className="text-sm text-green-700">6‑month pilot program</p>
            </Card>
            <Card className="p-4 bg-blue-50 border-blue-500">
              <p className="font-bold text-blue-800">📅 SCHEDULE</p>
              <p className="text-sm text-blue-700">Technical kickoff meeting</p>
            </Card>
            <Card className="p-4 bg-purple-50 border-purple-500">
              <p className="font-bold text-purple-800">👤 ASSIGN</p>
              <p className="text-sm text-purple-700">Internal project lead</p>
            </Card>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-3xl font-bold text-destructive">⚡ WHY RIGHT NOW</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-destructive/10 rounded-lg">
              <p className="font-bold text-destructive">🔥 LIMITED SLOTS</p>
              <p className="text-sm">Only 3 pilot partnerships globally</p>
            </div>
            <div className="p-4 bg-destructive/10 rounded-lg">
              <p className="font-bold text-destructive">💰 PILOT PRICING</p>
              <p className="text-sm">$60K+ savings expires soon</p>
            </div>
            <div className="p-4 bg-destructive/10 rounded-lg">
              <p className="font-bold text-destructive">🏆 FIRST MOVER</p>
              <p className="text-sm">Canada's sovereign AI leader</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-6 bg-gradient-to-r from-primary/30 to-destructive/30 rounded-lg border-2 border-primary">
          <h3 className="text-4xl font-bold text-primary">
            💥 THE BATTLE CRY 💥
          </h3>
          <p className="text-2xl font-bold text-foreground">
            "Own your system. Support patients 24/7. Save $249,000 in year one."
          </p>
          <p className="text-lg font-semibold text-destructive">
            THE FUTURE OF HEALTHCARE STARTS WITH YOUR SIGNATURE
          </p>
        </div>

        <div className="pt-4 space-y-2">
          <p className="text-xl font-bold text-primary">
            James (Ghost King) — Founder & Healthcare SOVEREIGNTY Pioneer
          </p>
          <p className="text-lg font-bold text-destructive">
            🚀 GodsIMiJ AI Solutions 🚀
          </p>
          <p className="text-lg font-medium">
            📞 +1 (613) 318‑9711 • ✉️ james@godsimij‑ai‑solutions.com
          </p>
          <p className="text-lg font-medium">
            Omari: jimi@godsimij‑ai‑solutions.com
          </p>
          <p className="text-lg font-medium">
            🌐 Live Demo: https://methaclinic-training.netlify.app
          </p>
          <Badge variant="destructive" className="text-sm animate-bounce">
            Implementation Team Standing By - Your Healthcare Revolution Starts NOW!
          </Badge>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-r from-green-100 to-blue-100 border-2 border-green-500">
        <div className="text-center space-y-3">
          <h3 className="text-2xl font-bold text-green-800">🔥 SIGN TODAY, TRANSFORM TOMORROW 🔥</h3>
          <p className="text-lg font-semibold text-green-700">
            Every signature changes a life. Every delay costs a life.
          </p>
          <p className="text-sm text-green-600 font-medium">
            Join the healthcare revolution. Make Pembroke legendary.
          </p>
        </div>
      </Card>
    </div>
  );
}

function ClosingVisionSlide() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-6xl font-bold bg-gradient-to-r from-primary to-destructive bg-clip-text text-transparent animate-pulse">
          🌟 IMAGINE PEMBROKE IN 6 MONTHS 🌟
        </h2>
        <p className="text-2xl font-semibold text-primary">Your Healthcare Revolution Complete</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6 border-2 border-primary bg-gradient-to-r from-primary/10 to-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">👥 YOUR STAFF</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-semibold">• Most qualified healthcare technology team in Ontario</p>
            <p className="font-semibold">• AI collaboration experts - skills no one else has</p>
            <p className="font-semibold">• Crisis management pros - confidence in any situation</p>
            <p className="font-semibold">• Industry speakers at healthcare conferences</p>
          </CardContent>
        </Card>

        <Card className="p-6 border-2 border-green-500 bg-gradient-to-r from-green-100 to-green-200">
          <CardHeader>
            <CardTitle className="text-2xl text-green-800">🏥 YOUR CLINIC</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-semibold">• Sovereign data control - complete privacy leadership</p>
            <p className="font-semibold">• Workflow efficiency that competitors can't match</p>
            <p className="font-semibold">• Patient satisfaction through AI-enhanced care</p>
            <p className="font-semibold">• Innovation reputation throughout healthcare industry</p>
          </CardContent>
        </Card>

        <Card className="p-6 border-2 border-blue-500 bg-gradient-to-r from-blue-100 to-blue-200">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-800">💼 YOUR BUSINESS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-semibold">• Competitive moat no other clinic can cross</p>
            <p className="font-semibold">• Staff retention through professional development</p>
            <p className="font-semibold">• Patient growth from privacy-conscious consumers</p>
            <p className="font-semibold">• Expansion opportunities as proven model</p>
          </CardContent>
        </Card>

        <Card className="p-6 border-2 border-purple-500 bg-gradient-to-r from-purple-100 to-purple-200">
          <CardHeader>
            <CardTitle className="text-2xl text-purple-800">👑 YOUR LEGACY</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-semibold text-center text-xl italic">
              "Pembroke didn't just adopt new technology - they helped create the future of healthcare."
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="p-8 bg-gradient-to-r from-destructive/20 to-primary/20 border-4 border-primary">
        <div className="text-center space-y-6">
          <h3 className="text-5xl font-bold text-primary">🚀 THE FUTURE STARTS TODAY 🚀</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="text-xl font-bold text-destructive">This is Your Moment:</p>
              <ul className="text-lg space-y-1">
                <li>• Revolutionary technology at pilot pricing</li>
                <li>• Industry leadership opportunity</li>
                <li>• Staff transformation into experts</li>
                <li>• Patient care excellence through AI</li>
              </ul>
            </div>
            <div className="space-y-3">
              <p className="text-xl font-bold text-primary">Partner with Champions:</p>
              <ul className="text-lg space-y-1">
                <li>• Proven technology with live demonstration</li>
                <li>• Founder commitment with personal guarantee</li>
                <li>• Success partnership not just vendor relationship</li>
                <li>• Industry transformation starts with Pembroke</li>
              </ul>
            </div>
          </div>

          <Card className="p-6 bg-gradient-to-r from-destructive/30 to-primary/30 border-2 border-destructive">
            <p className="text-4xl font-bold text-destructive animate-pulse">
              "LET'S MAKE HISTORY TOGETHER!"
            </p>
          </Card>
        </div>
      </Card>

      <Card className="p-8 bg-gradient-to-r from-green-100 to-blue-100 border-4 border-green-500">
        <div className="text-center space-y-4">
          <h3 className="text-4xl font-bold text-green-800">💥 BOOM! 💥</h3>
          <p className="text-3xl font-bold text-primary">
            PEMBROKE + AURA-BREE = HEALTHCARE SOVEREIGNTY!
          </p>
          <p className="text-xl font-semibold text-destructive">
            Ready to Sign: Pilot Agreement Ready • Implementation Team Standing By
          </p>
        </div>
      </Card>
    </div>
  );
}