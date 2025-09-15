import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  MessageCircle, 
  Shield, 
  TrendingUp, 
  Stars,
  CheckCircle,
  Sparkles
} from "lucide-react";
import { UpgradeButton } from "@/components/UpgradeButton";
import { trackReferral } from "@/lib/referral";

export default function Landing() {
  useEffect(() => {
    document.title = "AURA-BREE - Your 24/7 Mental Health Companion";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', 'Chat support, mood check-ins, safety tools, tarot and horoscope. Private by default. Data stays on your device.');
    
    // Track referral if present
    trackReferral();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/FlameOS_favicon.png"
              alt="AURA-BREE Logo"
              className="w-8 h-8"
            />
            <span className="text-xl font-bold text-foreground">AURA-BREE</span>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link to="/app">Open App</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/chat">Start Free</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="relative max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img 
              src="/FlameOS_favicon.png" 
              alt="AURA-BREE Logo" 
              className="w-16 h-16"
            />
            <h1 className="text-4xl md:text-6xl font-bold text-foreground">
              AURA-BREE
            </h1>
          </div>
          
          <h2 className="text-xl md:text-2xl text-muted-foreground mb-6">
            Your 24/7 mental health companion
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Chat support, mood check-ins, safety tools, tarot and horoscope. 
            Private by default. Data stays on your device.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link to="/app">Start Free</Link>
            </Button>
            <UpgradeButton />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
            <Heart className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Daily check-ins with streaks and progress
            </h3>
            <p className="text-muted-foreground text-sm">
              Track your mood daily and build healthy habits with streak tracking and progress insights.
            </p>
          </Card>

          <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
            <MessageCircle className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Gentle, judgment-free chat
            </h3>
            <p className="text-muted-foreground text-sm">
              Talk to AURA-BREE anytime for supportive, therapeutic conversations powered by AI.
            </p>
          </Card>

          <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
            <Shield className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Crisis safety shortcuts
            </h3>
            <p className="text-muted-foreground text-sm">
              Quick access to emergency contacts and crisis resources when you need them most.
            </p>
          </Card>

          <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
            <TrendingUp className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Calming tools for breath and focus
            </h3>
            <p className="text-muted-foreground text-sm">
              Breathing exercises and mindfulness tools to help you find calm in difficult moments.
            </p>
          </Card>

          <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
            <Stars className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Optional tarot and horoscope insights
            </h3>
            <p className="text-muted-foreground text-sm">
              Explore spiritual guidance with AI-powered tarot readings and personalized horoscopes.
            </p>
          </Card>

          <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
            <CheckCircle className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Private by design
            </h3>
            <p className="text-muted-foreground text-sm">
              All your data stays on your device. No external databases, no tracking, complete privacy.
            </p>
          </Card>
        </div>
      </section>

      {/* Premium Section */}
      <section className="bg-gradient-to-r from-primary/5 to-primary/10 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Sparkles className="w-16 h-16 mx-auto text-primary mb-6" />
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Premium Features
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Premium unlocks unlimited chat history, daily horoscopes, full tarot, and extended progress.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="text-left space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>Unlimited chat history</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>Daily personalized horoscopes</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>Full tarot deck access</span>
              </div>
            </div>
            <div className="text-left space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>Extended progress analytics</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>Priority support</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>Advanced mood insights</span>
              </div>
            </div>
          </div>
          
          <UpgradeButton />
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Start Your Mental Health Journey Today
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          Join thousands who trust AURA-BREE for daily mental health support.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link to="/app">Start Free</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
            <Link to="/checkin">Try Check-In</Link>
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground mt-6">
          No signup required • Data stays on your device • Start immediately
        </p>
      </section>

      {/* Newsletter Signup */}
      <section className="bg-card/50 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Stay Updated
          </h3>
          <p className="text-muted-foreground mb-6">
            Get notified about new features and mental health resources.
          </p>
          
          <form name="ab-news" method="POST" data-netlify="true" className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="hidden" name="form-name" value="ab-news" />
            <input 
              name="email" 
              type="email" 
              required 
              placeholder="Enter your email"
              className="flex-1 rounded-xl px-4 py-3 border border-border bg-background text-foreground"
            />
            <button 
              type="submit" 
              className="rounded-xl px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
            >
              Join updates
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
