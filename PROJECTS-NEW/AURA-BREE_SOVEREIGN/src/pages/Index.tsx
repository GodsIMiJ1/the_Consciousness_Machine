import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import MoodOrb from "@/components/MoodOrb";
import CheckInSlider from "@/components/CheckInSlider";
import SafetyKit from "@/components/SafetyKit";
import Chat from "./Chat";
import { MessageCircle, Heart, Shield, Sparkles, Phone, BarChart3, Wifi, WifiOff, Flame, Lock, Unlock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { UpgradeButton } from "@/components/UpgradeButton";
import ETransferModal from "@/components/ETransferModal";
import { getReferralCode, getInviteLink } from "@/lib/referral";
import { getDeviceId } from "@/lib/device";
import { addCheckIn, loadCheckIns, type CheckIn, computeStreak } from "@/lib/moodStorage";
import { isFlameRouterConfigured, getProviderStatus } from "@/lib/flameRouter";
import { getSyncStatus, isClinicSyncEnabled, createCheckIn, startAutoSync } from "@/lib/sovereignLink";
import { getConsentSettings, isCloudProcessingAllowed, processTextWithPrivacy } from "@/lib/piiRedactor";

const Index = ({ initialTab = 'chat' }: { initialTab?: 'chat' | 'checkin' | 'safety' | 'upgrades' }) => {
  const [deviceId] = useState<string>(() => getDeviceId());
  const [currentMood, setCurrentMood] = useState(7);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [referralCode] = useState(() => getReferralCode());
  const { toast } = useToast();

  // Sovereign features state
  const [providerStatus, setProviderStatus] = useState<any[]>([]);
  const [syncStatus, setSyncStatus] = useState<any>({});
  const [consentSettings, setConsentSettings] = useState<any>({});
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [privacyMode, setPrivacyMode] = useState<'sovereign' | 'hybrid' | 'cloud'>('sovereign');

  useEffect(() => {
    const items = loadCheckIns(deviceId);
    setCheckIns(items);
    if (items.length) {
      const latest = items[items.length - 1];
      setCurrentMood(latest.score);
    }
  }, [deviceId]);

  // Initialize sovereign features
  useEffect(() => {
    // Load consent settings
    setConsentSettings(getConsentSettings());

    // Set privacy mode based on environment
    const defaultMode = import.meta.env.VITE_PRIVACY_MODE_DEFAULT || 'sovereign';
    setPrivacyMode(defaultMode as 'sovereign' | 'hybrid' | 'cloud');

    // Start clinic auto-sync if enabled
    if (isClinicSyncEnabled()) {
      startAutoSync();
    }
  }, []);

  // Monitor provider and sync status
  useEffect(() => {
    const updateStatus = () => {
      setProviderStatus(getProviderStatus());
      setSyncStatus(getSyncStatus());
      setIsOnline(navigator.onLine);
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000);

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const lastCheckIn = useMemo(() => {
    return checkIns.length ? new Date(checkIns[checkIns.length - 1].timestamp) : null;
  }, [checkIns]);

  const streak = useMemo(() => computeStreak(deviceId), [deviceId, checkIns]);

  const handleCheckIn = async (score: number, note?: string) => {
    const updated = addCheckIn(deviceId, score, note);
    setCheckIns(updated);
    setCurrentMood(score);

    // Haptics (where supported)
    try { (navigator as any)?.vibrate?.(20); } catch {}

    // Create clinic check-in if enabled
    if (isClinicSyncEnabled()) {
      try {
        // Process note with PII redaction if needed
        const processedNote = note ? processTextWithPrivacy(note, false) : '';

        // Determine mood category
        const moodCategory = score >= 8 ? 'excellent' :
                           score >= 6 ? 'good' :
                           score >= 4 ? 'neutral' :
                           score >= 2 ? 'low' : 'critical';

        // Create flags based on mood and content
        const flags = [];
        if (score <= 3) flags.push('low_mood');
        if (note && note.toLowerCase().includes('crisis')) flags.push('crisis');
        if (note && note.toLowerCase().includes('emergency')) flags.push('emergency');

        await createCheckIn(
          deviceId,
          moodCategory,
          processedNote,
          flags
        );

        console.log('[Sovereign] Check-in queued for clinic sync');
      } catch (error) {
        console.warn('[Sovereign] Failed to queue clinic check-in:', error);
      }
    }

    toast({
      title: "Check-in saved!",
      description: `Mood level: ${score}/10${note ? " with notes" : ""}${isClinicSyncEnabled() ? " • Syncing to clinic" : ""}`,
    });
  };

  const handleEmergencyCall = () => {
    toast({
      title: "Emergency",
      description: "Dialing emergency services...",
      variant: "destructive",
    });
    try { window.location.href = 'tel:112'; } catch {}
  };

  // SEO per sub-route
  useEffect(() => {
    const tab = initialTab;
    const titles: Record<string, string> = {
      chat: 'AURA-BREE Chat | Therapeutic Companion',
      checkin: 'AURA-BREE Check-In | Mood Tracker',
      safety: 'AURA-BREE Toolkit | Safety & Resources',
      upgrades: 'AURA-BREE Upgrades | Roadmap',

    };
    const descs: Record<string, string> = {
      chat: 'Talk with AURA-BREE: supportive, therapeutic chat with voice input.',
      checkin: 'Log your daily mood with notes to build healthy awareness.',
      safety: 'Crisis tools and calming resources in one place.',
      upgrades: 'Current and upcoming capabilities for AURA-BREE.',

    };
    document.title = titles[tab] || 'AURA-BREE';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', descs[tab] || 'AURA-BREE therapeutic companion.');
    // canonical
    const path = tab === 'chat' ? '/chat' : tab === 'checkin' ? '/checkin' : tab === 'safety' ? '/toolkit' : '/';
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', `${location.origin}${path}`);
  }, [initialTab]);

  return (
    <div className="bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-0">
        <div className="max-w-screen-sm mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/FlameOS_favicon.png"
                alt="AURA-BREE Logo"
                className="w-8 h-8"
              />
              <div>
                <h1 className="text-xl font-bold text-foreground">AURA-BREE</h1>
                <p className="text-xs text-muted-foreground">Your therapeutic companion</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MoodOrb mood={currentMood} />
              <div className="hidden sm:flex gap-2">
                <Button variant="secondary" size="sm" asChild className="bg-primary/10 text-primary hover:bg-primary/20">
                  <Link to="/tarot">🔮 Tarot</Link>
                </Button>
                <Button variant="secondary" size="sm" asChild className="bg-primary/10 text-primary hover:bg-primary/20">
                  <Link to="/horoscope">⭐ Horoscope</Link>
                </Button>
                <Button variant="secondary" size="sm" asChild className="bg-primary/10 text-primary hover:bg-primary/20">
                  <Link to="/settings">⚙️ Settings</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sovereign Status Bar */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-screen-sm mx-auto px-4 py-2">
          <div className="flex items-center justify-between text-xs">
            {/* Left side - AI Provider Status */}
            <div className="flex items-center gap-2">
              <Flame className="w-3 h-3 text-primary" />
              <span className="font-medium">FlameRouter</span>
              <div className="flex items-center gap-1">
                {providerStatus.map((status, index) => (
                  <div
                    key={status.name}
                    className={`w-2 h-2 rounded-full ${
                      status.available ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    title={`${status.name}: ${status.available ? 'Available' : 'Unavailable'}`}
                  />
                ))}
                {isFlameRouterConfigured() ? (
                  <Wifi className="w-3 h-3 text-green-500 ml-1" />
                ) : (
                  <WifiOff className="w-3 h-3 text-red-500 ml-1" />
                )}
              </div>
            </div>

            {/* Center - Privacy Mode */}
            <div className="flex items-center gap-1">
              {privacyMode === 'sovereign' ? (
                <Lock className="w-3 h-3 text-green-500" />
              ) : privacyMode === 'hybrid' ? (
                <Unlock className="w-3 h-3 text-yellow-500" />
              ) : (
                <Unlock className="w-3 h-3 text-red-500" />
              )}
              <span className="text-muted-foreground capitalize">{privacyMode}</span>
            </div>

            {/* Right side - Clinic Sync Status */}
            <div className="flex items-center gap-1">
              {isClinicSyncEnabled() ? (
                <>
                  {syncStatus.clinicConnected ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Clinic</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-yellow-600">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      <span>Clinic</span>
                    </div>
                  )}
                  {syncStatus.pendingCount > 0 && (
                    <span className="bg-primary text-primary-foreground px-1 rounded text-xs">
                      {syncStatus.pendingCount}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-muted-foreground">Local Only</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-sm mx-auto px-4 py-6 relative z-10">
        {/* Quick access buttons for mobile */}
        <div className="sm:hidden flex gap-2 mb-6">
          <Button variant="secondary" size="sm" asChild className="flex-1 bg-primary/10 text-primary hover:bg-primary/20">
            <Link to="/tarot">🔮 Tarot Reader</Link>
          </Button>
          <Button variant="secondary" size="sm" asChild className="flex-1 bg-primary/10 text-primary hover:bg-primary/20">
            <Link to="/horoscope">⭐ Daily Horoscope</Link>
          </Button>
        </div>

        {/* Content based on current tab */}
          {initialTab === 'chat' && (
            <div className="space-y-6">
              <Card className="border-border bg-card/50 backdrop-blur-sm overflow-hidden">
                <div className="h-[calc(100vh-280px)] min-h-[500px]">
                  <Chat />
                </div>
              </Card>
            </div>
          )}

          {initialTab === 'checkin' && (
            <div className="space-y-6">
              <Card className="p-6 border-border bg-gradient-surface">
                <CheckInSlider onSave={handleCheckIn} />

                {lastCheckIn && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-sm text-muted-foreground text-center">
                      Last check-in: {lastCheckIn.toLocaleDateString()} at {lastCheckIn.toLocaleTimeString()}
                    </p>
                  </div>
                )}
              </Card>
            </div>
          )}

          {initialTab === 'safety' && (
            <div className="space-y-6">
              <SafetyKit onCallEmergency={handleEmergencyCall} />
            </div>
          )}

          {initialTab === 'upgrades' && (
            <div className="space-y-6">
              {/* Premium Upgrade */}
              <Card className="p-6 border-border bg-gradient-surface">
                <div className="text-center space-y-4">
                  <Sparkles className="w-16 h-16 mx-auto text-primary" />
                  <h3 className="text-xl font-semibold text-foreground">
                    Upgrade to Premium
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Premium unlocks unlimited chat history, daily horoscopes, full tarot, and extended progress.
                  </p>

                  <div className="grid gap-3 mt-6 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-sm">Unlimited chat history</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-sm">Daily personalized horoscopes</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-sm">Full tarot deck access</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-sm">Extended progress analytics</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-sm">Priority support</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <UpgradeButton />
                    <ETransferModal />
                  </div>
                </div>
              </Card>

              {/* Referral Program */}
              <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-foreground mb-4">Invite Friends</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Invite 3 friends, send your code to support, get one free month of Premium.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-foreground">Your referral code:</label>
                    <div className="flex gap-2 mt-1">
                      <input
                        value={`AB-${referralCode}`}
                        readOnly
                        className="flex-1 px-3 py-2 text-sm font-mono bg-muted border border-border rounded-lg"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`AB-${referralCode}`);
                          toast({ title: "Copied!", description: "Referral code copied to clipboard" });
                        }}
                        className="px-3 py-2 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Share link:</label>
                    <div className="flex gap-2 mt-1">
                      <input
                        value={getInviteLink(referralCode)}
                        readOnly
                        className="flex-1 px-3 py-2 text-sm bg-muted border border-border rounded-lg"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(getInviteLink(referralCode));
                          toast({ title: "Copied!", description: "Invite link copied to clipboard" });
                        }}
                        className="px-3 py-2 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Current Features */}
              <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-foreground mb-4">Current Features</h3>
                <div className="grid gap-3">
                  <Card className="p-4 bg-accent border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span className="font-medium">Active Listening v2.0</span>
                      <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-1 rounded">Active</span>
                    </div>
                  </Card>

                  <Card className="p-4 bg-muted/50 border-border opacity-60">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                      <span className="font-medium">Mood Pattern Analysis</span>
                      <span className="ml-auto text-xs bg-muted text-muted-foreground px-2 py-1 rounded">Coming Soon</span>
                    </div>
                  </Card>

                  <Card className="p-4 bg-muted/50 border-border opacity-60">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                      <span className="font-medium">Personalized Coping Strategies</span>
                      <span className="ml-auto text-xs bg-muted text-muted-foreground px-2 py-1 rounded">Coming Soon</span>
                    </div>
                  </Card>
                </div>
              </Card>
            </div>
          )}



        {/* Emergency FAB is now global via App layout */}
      </div>
    </div>
  );
};

export default Index;
