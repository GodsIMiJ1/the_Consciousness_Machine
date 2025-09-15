import { Home, MessageCircle, Heart, Shield, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function BottomNav() {
  const base = "flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs";
  const active = "text-primary";
  const inactive = "text-muted-foreground";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="mx-auto max-w-screen-sm grid grid-cols-5 h-16 px-2 pb-[env(safe-area-inset-bottom)]">
        <NavLink to="/" className={({ isActive }) => `${base} ${isActive ? active : inactive}` } aria-label="Home">
          <Home className="w-5 h-5" />
          <span>Home</span>
        </NavLink>
        <NavLink to="/chat" className={({ isActive }) => `${base} ${isActive ? active : inactive}` } aria-label="Chat">
          <MessageCircle className="w-5 h-5" />
          <span>Chat</span>
        </NavLink>
        <NavLink to="/checkin" className={({ isActive }) => `${base} ${isActive ? active : inactive}` } aria-label="Check-In">
          <Heart className="w-5 h-5" />
          <span>Check-In</span>
        </NavLink>
        <NavLink to="/toolkit" className={({ isActive }) => `${base} ${isActive ? active : inactive}` } aria-label="Toolkit">
          <Shield className="w-5 h-5" />
          <span>Toolkit</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `${base} ${isActive ? active : inactive}` } aria-label="Settings">
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </NavLink>
      </div>
    </nav>
  );
}
