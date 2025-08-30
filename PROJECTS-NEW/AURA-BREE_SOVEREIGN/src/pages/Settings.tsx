import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Database,
  Download,
  Trash2,
  ExternalLink,
  Smartphone,
  Key,
  Mail,
  AlertTriangle,
  Crown,
  Flame
} from "lucide-react";
import { getDeviceId } from "@/lib/device";
import { loadCheckIns, type CheckIn, computeStreak } from "@/lib/moodStorage";
import SovereignSettings from "@/components/SovereignSettings";

export default function Settings() {
  const [deviceId] = useState(() => getDeviceId());
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [streak, setStreak] = useState(0);
  const [zodiacSign, setZodiacSign] = useState(() =>
    localStorage.getItem('ab_zodiac_sign') || 'aries'
  );
  const [voiceEnabled, setVoiceEnabled] = useState(() =>
    localStorage.getItem('ab_voice_enabled') !== 'false'
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(() =>
    localStorage.getItem('ab_notifications_enabled') === 'true'
  );

  useEffect(() => {
    document.title = "Settings | AURA-BREE";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', 'Settings and preferences for AURA-BREE therapeutic companion.');

    // Load check-ins data
    const loadedCheckIns = loadCheckIns(deviceId);
    setCheckIns(loadedCheckIns);
    setStreak(computeStreak(deviceId));
  }, [deviceId]);

  const handleZodiacChange = (sign: string) => {
    setZodiacSign(sign);
    localStorage.setItem('ab_zodiac_sign', sign);
  };

  const handleVoiceToggle = (enabled: boolean) => {
    setVoiceEnabled(enabled);
    localStorage.setItem('ab_voice_enabled', enabled.toString());
  };

  const handleNotificationsToggle = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    localStorage.setItem('ab_notifications_enabled', enabled.toString());
  };

  const exportData = () => {
    const data = {
      deviceId,
      zodiacSign,
      voiceEnabled,
      notificationsEnabled,
      messages: localStorage.getItem(`ab:${deviceId}:messages`),
      tarot: localStorage.getItem(`ab:${deviceId}:tarot`),
      checkins: localStorage.getItem(`ab:${deviceId}:checkins`),
      oracleMessages: localStorage.getItem(`ab:${deviceId}:oracle_messages`),
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura-bree-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all your data? This cannot be undone.')) {
      Object.keys(localStorage)
        .filter(key => key.startsWith('ab'))
        .forEach(key => localStorage.removeItem(key));
      
      alert('All data has been cleared. The page will reload.');
      window.location.reload();
    }
  };

  const zodiacSigns = [
    'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
  ];

  return (
    <div className="bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-0">
        <div className="max-w-screen-sm mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-semibold text-foreground">Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-screen-sm mx-auto px-4 py-6 relative z-10">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="sovereign" className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Sovereign
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            {/* Account Section */}
            <Card className="p-6 border-border bg-gradient-surface">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Account</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Device ID</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input value={deviceId} readOnly className="font-mono text-xs" />
                <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(deviceId)}>
                  Copy
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Your unique device identifier for local data storage
              </p>
            </div>

            {/* Future: Account Linking */}
            <div className="p-4 border border-dashed border-border rounded-lg bg-muted/20">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Account Backup (Coming Soon)</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Link an email to backup your data and access it from other devices
              </p>
              <Button variant="outline" size="sm" disabled>
                <Key className="w-4 h-4 mr-2" />
                Link Account
              </Button>
            </div>
          </div>
        </Card>

        {/* Preferences */}
        <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">Preferences</h2>
          
          <div className="space-y-6">
            {/* Zodiac Sign */}
            <div>
              <Label className="text-sm font-medium text-foreground">Zodiac Sign</Label>
              <select 
                value={zodiacSign} 
                onChange={(e) => handleZodiacChange(e.target.value)}
                className="w-full mt-1 p-2 border border-border rounded-md bg-background text-foreground"
              >
                {zodiacSigns.map(sign => (
                  <option key={sign} value={sign}>
                    {sign.charAt(0).toUpperCase() + sign.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <Separator />

            {/* Voice Features */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-foreground">Voice Features</Label>
                <p className="text-xs text-muted-foreground">Enable text-to-speech for AI responses</p>
              </div>
              <Switch checked={voiceEnabled} onCheckedChange={handleVoiceToggle} />
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-foreground">Notifications</Label>
                <p className="text-xs text-muted-foreground">Daily check-in reminders (when available)</p>
              </div>
              <Switch checked={notificationsEnabled} onCheckedChange={handleNotificationsToggle} />
            </div>
          </div>
        </Card>

        {/* Privacy & Data */}
        <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Privacy & Data</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Database className="w-4 h-4 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Local Storage Only</p>
                <p className="text-xs text-muted-foreground">All data stays on your device</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Button onClick={exportData} variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Export My Data
              </Button>
              
              <Button 
                onClick={clearAllData} 
                variant="outline" 
                className="w-full justify-start text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Data
              </Button>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-foreground">Data Storage Notice</p>
                  <p className="text-xs text-muted-foreground">
                    Your data is stored locally in your browser. Clearing browser data will remove all information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Progress */}
        <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">Your Progress</h2>
          {checkIns.length === 0 ? (
            <div className="text-center text-muted-foreground">
              <p>No check-ins yet.</p>
              <p>Start with your first Check-In to see your progress here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-accent border-border">
                  <div className="text-sm text-muted-foreground">Current streak</div>
                  <div className="text-2xl font-bold text-foreground">{streak} day{streak === 1 ? '' : 's'}</div>
                </Card>
                <Card className="p-4 bg-accent border-border">
                  <div className="text-sm text-muted-foreground">Total check-ins</div>
                  <div className="text-2xl font-bold text-foreground">{checkIns.length}</div>
                </Card>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Recent History</h4>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {[...checkIns].reverse().slice(0, 5).map(ci => (
                    <div key={ci.id} className="flex items-center justify-between rounded-md border border-border p-3 bg-background/60">
                      <div>
                        <div className="font-medium text-foreground">Mood {ci.score}/10</div>
                        {ci.note && <div className="text-sm text-muted-foreground line-clamp-1">{ci.note}</div>}
                      </div>
                      <div className="text-xs text-muted-foreground ml-4 whitespace-nowrap">
                        {new Date(ci.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* About */}
        <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">About</h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Version</span>
              <span className="text-sm font-medium text-foreground">1.0.0</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Developer</span>
              <span className="text-sm font-medium text-foreground">GodsIMiJ AI Solutions</span>
            </div>

            <Separator />

            <Button variant="outline" size="sm" asChild className="w-full">
              <a 
                href="https://aura-bree-privacy-docs.netlify.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Privacy Policy
              </a>
            </Button>
          </div>
        </Card>
          </TabsContent>

          <TabsContent value="sovereign" className="space-y-6">
            <SovereignSettings />
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            {/* Data Management Section */}
            <Card className="p-6 border-border bg-gradient-surface">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Data Management</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-semibold text-foreground">{checkIns.length}</div>
                    <div className="text-xs text-muted-foreground">Check-ins</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-semibold text-foreground">{streak}</div>
                    <div className="text-xs text-muted-foreground">Day Streak</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Button variant="outline" onClick={exportData} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Export My Data
                  </Button>

                  <Button variant="destructive" onClick={clearAllData} className="w-full">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All Data
                  </Button>
                </div>

                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <div className="text-xs text-yellow-800">
                      <p className="font-medium mb-1">Data Storage Notice</p>
                      <p>All your data is stored locally on this device. Clearing browser data or uninstalling the app will permanently delete your information.</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
