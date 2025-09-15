import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background mt-8 relative z-0">
      <div className="max-w-screen-sm mx-auto px-4 py-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img 
              src="/FlameOS_favicon.png" 
              alt="AURA-BREE Logo" 
              className="w-6 h-6"
            />
            <span className="font-semibold text-foreground">AURA-BREE</span>
          </div>
          
          {/* Description */}
          <p className="text-sm text-muted-foreground max-w-md">
            Your AI-powered therapeutic companion for mental wellness, mood tracking, and spiritual guidance.
          </p>
          
          {/* Features */}
          <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
            <span>🤖 AI Chat</span>
            <span>💝 Mood Tracking</span>
            <span>🔮 Tarot Readings</span>
            <span>⭐ Daily Horoscopes</span>
            <span>🛡️ Privacy-First</span>
          </div>
          
          {/* Copyright */}
          <div className="flex flex-col items-center space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <span>Made with</span>
              <Heart className="w-3 h-3 text-red-500 fill-current" />
              <span>for mental wellness</span>
            </div>
            <div className="text-center">
              <p>© 2025 GodsIMiJ AI Solutions. All rights reserved.</p>
              <p className="mt-1">Privacy-first design • Local storage • No data collection</p>
              <a
                href="https://aura-bree-privacy-docs.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 underline mt-1 inline-block"
              >
                Privacy Policy & Documentation
              </a>
            </div>
          </div>
          
          {/* Additional Logos */}
          <div className="flex items-center gap-4 opacity-60">
            <img 
              src="/ghostos_logo.png" 
              alt="GhostOS" 
              className="h-4 opacity-50"
            />
            <img 
              src="/eye-of-kai_logo.png" 
              alt="Eye of Kai" 
              className="h-4 opacity-50"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
