import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Database, Palette, Save, RefreshCw, Server, TestTube, BookOpen, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ProductionConfig } from './ProductionConfig';
import { TestingDashboard } from './TestingDashboard';
import { DocumentationHub } from './DocumentationHub';
import { AnalyticsDashboard } from './AnalyticsDashboard';

interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

interface UserSettings {
  notifications: {
    email: boolean;
    desktop: boolean;
    tickets: boolean;
    mentions: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    emailDigest: 'daily' | 'weekly' | 'never';
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    shareData: boolean;
    analytics: boolean;
  };
}

export function Settings() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      email: true,
      desktop: false,
      tickets: true,
      mentions: true,
    },
    preferences: {
      theme: 'system',
      language: 'en',
      timezone: 'UTC',
      emailDigest: 'weekly',
    },
    privacy: {
      profileVisibility: 'private',
      shareData: false,
      analytics: true,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadUserSettings();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, created_at, updated_at')
        .eq('id', user?.id)
        .maybeSingle();

      if (error) throw error;
      if (data) setProfile({ ...data, avatar_url: null });
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast({
        title: 'Error loading profile',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const loadUserSettings = async () => {
    // Load user settings from localStorage or API
    const savedSettings = localStorage.getItem(`user-settings-${user?.id}`);
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    setIsLoading(false);
  };

  const saveProfile = async () => {
    if (!profile || !user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Profile updated',
        description: 'Your profile has been saved successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error updating profile',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const saveSettings = () => {
    localStorage.setItem(`user-settings-${user?.id}`, JSON.stringify(settings));
    toast({
      title: 'Settings saved',
      description: 'Your preferences have been saved successfully.',
    });
  };

  const resetSettings = () => {
    setSettings({
      notifications: {
        email: true,
        desktop: false,
        tickets: true,
        mentions: true,
      },
      preferences: {
        theme: 'system',
        language: 'en',
        timezone: 'UTC',
        emailDigest: 'weekly',
      },
      privacy: {
        profileVisibility: 'private',
        shareData: false,
        analytics: true,
      },
    });
    toast({
      title: 'Settings reset',
      description: 'All settings have been reset to defaults.',
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-bg-muted rounded w-48"></div>
          <div className="grid gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text flex items-center gap-2">
            <SettingsIcon className="h-8 w-8" />
            Settings & Administration
          </h1>
          <p className="text-text-muted mt-1">
            System configuration, production monitoring, and quality assurance
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetSettings} className="btn-outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={saveSettings} className="btn-primary">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-panel border border-border rounded-xl2 shadow-aura">
          <TabsTrigger value="profile" className="rounded-xl data-[state=active]:bg-brand data-[state=active]:text-brand-contrast">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="production" className="rounded-xl data-[state=active]:bg-brand data-[state=active]:text-brand-contrast">
            <Server className="h-4 w-4 mr-2" />
            Production
          </TabsTrigger>
          <TabsTrigger value="testing" className="rounded-xl data-[state=active]:bg-brand data-[state=active]:text-brand-contrast">
            <TestTube className="h-4 w-4 mr-2" />
            Testing
          </TabsTrigger>
          <TabsTrigger value="docs" className="rounded-xl data-[state=active]:bg-brand data-[state=active]:text-brand-contrast">
            <BookOpen className="h-4 w-4 mr-2" />
            Documentation
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-xl data-[state=active]:bg-brand data-[state=active]:text-brand-contrast">
            <Activity className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid gap-6">
        {/* Profile Settings */}
        <Card className="aura-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-text">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email" className="text-text">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="input bg-bg-muted"
                />
                <p className="text-xs text-text-muted mt-1">Email cannot be changed</p>
              </div>
              
              <div>
                <Label htmlFor="full_name" className="text-text">Full Name</Label>
                <Input
                  id="full_name"
                  value={profile?.full_name || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                  placeholder="Enter your full name"
                  className="input"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-text">Role</Label>
              <Input
                value={profile?.role || 'user'}
                disabled
                className="input bg-bg-muted"
              />
              <p className="text-xs text-text-muted mt-1">Role is managed by administrators</p>
            </div>
            
            <Button onClick={saveProfile} disabled={isSaving} className="btn">
              {isSaving ? 'Saving...' : 'Update Profile'}
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="aura-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-text">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-text">Email Notifications</Label>
                  <p className="text-sm text-text-muted">Receive notifications via email</p>
                </div>
                <Switch
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, email: checked }
                    }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-text">Desktop Notifications</Label>
                  <p className="text-sm text-text-muted">Show desktop notifications</p>
                </div>
                <Switch
                  checked={settings.notifications.desktop}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, desktop: checked }
                    }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-text">Ticket Updates</Label>
                  <p className="text-sm text-text-muted">Notifications for ticket changes</p>
                </div>
                <Switch
                  checked={settings.notifications.tickets}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, tickets: checked }
                    }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-text">Mentions</Label>
                  <p className="text-sm text-text-muted">When someone mentions you</p>
                </div>
                <Switch
                  checked={settings.notifications.mentions}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, mentions: checked }
                    }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance & Preferences */}
        <Card className="aura-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-text">
              <Palette className="h-5 w-5" />
              Appearance & Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-text">Theme</Label>
                <Select 
                  value={settings.preferences.theme} 
                  onValueChange={(value: 'light' | 'dark' | 'system') => 
                    setSettings(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, theme: value }
                    }))
                  }
                >
                  <SelectTrigger className="bg-bg border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-text">Language</Label>
                <Select 
                  value={settings.preferences.language} 
                  onValueChange={(value) => 
                    setSettings(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, language: value }
                    }))
                  }
                >
                  <SelectTrigger className="bg-bg border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-text">Timezone</Label>
                <Select 
                  value={settings.preferences.timezone} 
                  onValueChange={(value) => 
                    setSettings(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, timezone: value }
                    }))
                  }
                >
                  <SelectTrigger className="bg-bg border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern</SelectItem>
                    <SelectItem value="America/Chicago">Central</SelectItem>
                    <SelectItem value="America/Denver">Mountain</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-text">Email Digest</Label>
                <Select 
                  value={settings.preferences.emailDigest} 
                  onValueChange={(value: 'daily' | 'weekly' | 'never') => 
                    setSettings(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, emailDigest: value }
                    }))
                  }
                >
                  <SelectTrigger className="bg-bg border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card className="aura-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-text">
              <Shield className="h-5 w-5" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label className="text-text">Profile Visibility</Label>
                <Select 
                  value={settings.privacy.profileVisibility} 
                  onValueChange={(value: 'public' | 'private') => 
                    setSettings(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, profileVisibility: value }
                    }))
                  }
                >
                  <SelectTrigger className="bg-bg border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-text-muted mt-1">
                  Control who can see your profile information
                </p>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-text">Share Anonymous Usage Data</Label>
                  <p className="text-sm text-text-muted">Help improve BiancaDesk with anonymous usage statistics</p>
                </div>
                <Switch
                  checked={settings.privacy.shareData}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, shareData: checked }
                    }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-text">Analytics</Label>
                  <p className="text-sm text-text-muted">Enable analytics tracking for better user experience</p>
                </div>
                <Switch
                  checked={settings.privacy.analytics}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, analytics: checked }
                    }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card className="aura-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-text">
              <Database className="h-5 w-5" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-text font-medium">User ID</Label>
                <p className="text-text-muted font-mono">{user?.id}</p>
              </div>
              <div>
                <Label className="text-text font-medium">Account Created</Label>
                <p className="text-text-muted">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
              <div>
                <Label className="text-text font-medium">Last Updated</Label>
                <p className="text-text-muted">
                  {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
              <div>
                <Label className="text-text font-medium">BiancaDesk Version</Label>
                <p className="text-text-muted">v2.1.0</p>
              </div>
            </div>
          </CardContent>
        </Card>
          </div>
        </TabsContent>

        <TabsContent value="production" className="mt-0">
          <ProductionConfig />
        </TabsContent>

        <TabsContent value="testing" className="mt-0">
          <TestingDashboard />
        </TabsContent>

        <TabsContent value="docs" className="mt-0">
          <DocumentationHub />
        </TabsContent>

        <TabsContent value="analytics" className="mt-0">
          <AnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}