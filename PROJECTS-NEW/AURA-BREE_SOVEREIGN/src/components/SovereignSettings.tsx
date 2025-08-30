/**
 * Sovereign Settings Component
 * Privacy mode toggles, consent management, and provider configuration
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Lock, 
  Unlock, 
  Flame, 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  CheckCircle, 
  Settings,
  Eye,
  EyeOff,
  Database,
  Cloud
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  getConsentSettings, 
  updateConsentSettings, 
  isCloudProcessingAllowed,
  type ConsentSettings 
} from '@/lib/piiRedactor';
import { 
  isFlameRouterConfigured, 
  getProviderStatus 
} from '@/lib/flameRouter';
import { 
  getSyncStatus, 
  isClinicSyncEnabled, 
  clearFailedItems 
} from '@/lib/sovereignLink';

export default function SovereignSettings() {
  const [consentSettings, setConsentSettings] = useState<ConsentSettings>({
    cloudProcessingAllowed: false,
    dataRetentionDays: 30,
    shareWithClinicians: true,
    anonymousAnalytics: false,
    emergencyOverride: true
  });
  
  const [providerStatus, setProviderStatus] = useState<any[]>([]);
  const [syncStatus, setSyncStatus] = useState<any>({});
  const [privacyMode, setPrivacyMode] = useState<'sovereign' | 'hybrid' | 'cloud'>('sovereign');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    // Load current settings
    setConsentSettings(getConsentSettings());
    setProviderStatus(getProviderStatus());
    setSyncStatus(getSyncStatus());
    
    // Determine privacy mode
    const consent = getConsentSettings();
    if (!consent.cloudProcessingAllowed) {
      setPrivacyMode('sovereign');
    } else if (consent.shareWithClinicians) {
      setPrivacyMode('hybrid');
    } else {
      setPrivacyMode('cloud');
    }
  }, []);

  const handleConsentChange = (key: keyof ConsentSettings, value: boolean | number) => {
    const updated = { ...consentSettings, [key]: value };
    setConsentSettings(updated);
    updateConsentSettings(updated);
    
    // Update privacy mode based on settings
    if (!updated.cloudProcessingAllowed) {
      setPrivacyMode('sovereign');
    } else if (updated.shareWithClinicians) {
      setPrivacyMode('hybrid');
    } else {
      setPrivacyMode('cloud');
    }
    
    toast({
      title: 'Settings Updated',
      description: `${key.replace(/([A-Z])/g, ' $1').toLowerCase()} has been updated`
    });
  };

  const handleClearFailedSync = () => {
    clearFailedItems();
    setSyncStatus(getSyncStatus());
    toast({
      title: 'Queue Cleared',
      description: 'Failed sync items have been removed from the queue'
    });
  };

  const getPrivacyModeInfo = () => {
    switch (privacyMode) {
      case 'sovereign':
        return {
          icon: <Lock className="w-4 h-4 text-green-500" />,
          title: 'Sovereign Mode',
          description: 'All processing stays on your device. Maximum privacy.',
          color: 'bg-green-50 border-green-200 text-green-800'
        };
      case 'hybrid':
        return {
          icon: <Unlock className="w-4 h-4 text-yellow-500" />,
          title: 'Hybrid Mode',
          description: 'Local processing with clinic sharing. Balanced privacy.',
          color: 'bg-yellow-50 border-yellow-200 text-yellow-800'
        };
      case 'cloud':
        return {
          icon: <Cloud className="w-4 h-4 text-blue-500" />,
          title: 'Cloud Mode',
          description: 'Cloud AI processing enabled. Enhanced features.',
          color: 'bg-blue-50 border-blue-200 text-blue-800'
        };
    }
  };

  const privacyInfo = getPrivacyModeInfo();

  return (
    <div className="space-y-6">
      {/* Privacy Mode Overview */}
      <Card className={`p-4 border-2 ${privacyInfo.color}`}>
        <div className="flex items-center gap-3">
          {privacyInfo.icon}
          <div>
            <h3 className="font-semibold">{privacyInfo.title}</h3>
            <p className="text-sm opacity-80">{privacyInfo.description}</p>
          </div>
        </div>
      </Card>

      {/* AI Provider Status */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">AI Providers</h3>
          {isFlameRouterConfigured() ? (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Configured
            </Badge>
          ) : (
            <Badge variant="destructive">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Not Configured
            </Badge>
          )}
        </div>
        
        <div className="space-y-2">
          {providerStatus.map((provider) => (
            <div key={provider.name} className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  provider.available ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="capitalize font-medium">{provider.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {provider.available ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Available</Badge>
                ) : (
                  <Badge variant="destructive">Unavailable</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Clinic Sync Status */}
      {isClinicSyncEnabled() && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Clinic Sync</h3>
            {syncStatus.clinicConnected ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="destructive">
                <WifiOff className="w-3 h-3 mr-1" />
                Disconnected
              </Badge>
            )}
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Queue Size:</span>
              <span>{syncStatus.queueSize || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Pending:</span>
              <span>{syncStatus.pendingCount || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Failed:</span>
              <span>{syncStatus.failedCount || 0}</span>
            </div>
            
            {syncStatus.failedCount > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearFailedSync}
                className="w-full"
              >
                Clear Failed Items
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Privacy & Consent Settings */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Privacy & Consent</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Cloud Processing</label>
              <p className="text-sm text-muted-foreground">Allow AI processing in the cloud</p>
            </div>
            <Switch
              checked={consentSettings.cloudProcessingAllowed}
              onCheckedChange={(checked) => handleConsentChange('cloudProcessingAllowed', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Share with Clinicians</label>
              <p className="text-sm text-muted-foreground">Allow data sharing with healthcare providers</p>
            </div>
            <Switch
              checked={consentSettings.shareWithClinicians}
              onCheckedChange={(checked) => handleConsentChange('shareWithClinicians', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Anonymous Analytics</label>
              <p className="text-sm text-muted-foreground">Help improve the app with usage data</p>
            </div>
            <Switch
              checked={consentSettings.anonymousAnalytics}
              onCheckedChange={(checked) => handleConsentChange('anonymousAnalytics', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Emergency Override</label>
              <p className="text-sm text-muted-foreground">Allow emergency access to all features</p>
            </div>
            <Switch
              checked={consentSettings.emergencyOverride}
              onCheckedChange={(checked) => handleConsentChange('emergencyOverride', checked)}
            />
          </div>
        </div>
      </Card>

      {/* Advanced Settings */}
      <Card className="p-4">
        <Button
          variant="ghost"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full justify-between p-0 h-auto"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <span className="font-semibold">Advanced Settings</span>
          </div>
          {showAdvanced ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>
        
        {showAdvanced && (
          <div className="mt-4 space-y-4 pt-4 border-t">
            <div>
              <label className="font-medium block mb-2">Data Retention (days)</label>
              <input
                type="number"
                min="1"
                max="365"
                value={consentSettings.dataRetentionDays}
                onChange={(e) => handleConsentChange('dataRetentionDays', parseInt(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Sovereign Mode:</strong> All data stays on device</p>
              <p><strong>Hybrid Mode:</strong> Local processing + clinic sharing</p>
              <p><strong>Cloud Mode:</strong> Cloud AI + all features enabled</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
