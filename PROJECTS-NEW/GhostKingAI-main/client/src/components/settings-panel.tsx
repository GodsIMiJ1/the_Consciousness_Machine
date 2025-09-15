import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { api, type Device, type Integration, type IntegrationTemplate } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import IntegrationForm from './integration-form';
import ApiKeyManager from './api-key-manager';
import MemoryManager from './memory-manager';
import PersonalityCustomizer from './personality-customizer';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Calendar, Mail, CheckSquare, Circle, Trash2, Download, Plus, Github, Server, MessageCircle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  device?: Device;
  integrations: Integration[];
  deviceId: string;
}

export default function SettingsPanel({ isOpen, onClose, device, integrations, deviceId }: SettingsPanelProps) {
  const [settings, setSettings] = useState(device?.settings || {
    autoSave: true,
    voiceEnabled: true,
    integrations: [],
    memoryLimit: 35
  });
  const [showIntegrationForm, setShowIntegrationForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<IntegrationTemplate | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get integration templates
  const { data: templates = [] } = useQuery({
    queryKey: ['/api/integrations/templates'],
    queryFn: () => api.getIntegrationTemplates(),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings: any) => api.updateDeviceSettings(deviceId, newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/device', deviceId] });
      toast({
        title: "Settings Updated",
        description: "Your settings have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings.",
        variant: "destructive",
      });
    },
  });

  const exportChatMutation = useMutation({
    mutationFn: () => api.exportChatHistory(deviceId),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `omari-chat-${deviceId}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Complete",
        description: "Your chat history has been downloaded.",
      });
    },
    onError: () => {
      toast({
        title: "Export Failed",
        description: "Failed to export chat history.",
        variant: "destructive",
      });
    },
  });

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    updateSettingsMutation.mutate(newSettings);
  };

  const handleClearChat = () => {
    if (confirm('Are you sure you want to clear all chat history? This action cannot be undone.')) {
      // In a real implementation, you would call an API to clear chat history
      toast({
        title: "Chat Cleared",
        description: "All chat history has been cleared.",
      });
      onClose();
    }
  };

  const handleAddIntegration = (template: IntegrationTemplate) => {
    setSelectedTemplate(template);
    setShowIntegrationForm(true);
  };

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'github':
        return Github;
      case 'gmail':
        return Mail;
      case 'notion':
        return FileText;
      case 'netlify':
        return Server;
      case 'chatgpt':
        return MessageCircle;
      case 'google-docs':
        return FileText;
      case 'vscode':
        return Server;
      case 'custom-api':
        return Server;
      case 'calendar':
        return Calendar;
      case 'email':
        return Mail;
      case 'tasks':
        return CheckSquare;
      default:
        return CheckSquare;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" data-testid="settings-overlay">
      <div className="absolute bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-lg max-w-md mx-auto">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Settings</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors touch-feedback"
              data-testid="button-close-settings"
            >
              <X size={18} />
            </Button>
          </div>
        </div>
        
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
          {/* API Configuration */}
          <div className="space-y-3">
            <h3 className="font-medium text-foreground">API Configuration</h3>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">OpenAI API Status</label>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm text-foreground" data-testid="text-api-status">Connected</span>
                <Circle className="w-2 h-2 fill-chart-1 text-chart-1" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Device ID</label>
              <div className="p-3 bg-muted rounded-lg">
                <span className="text-sm font-mono text-foreground" data-testid="text-device-id">
                  {deviceId}
                </span>
              </div>
            </div>
          </div>

          {/* API Keys */}
          <div className="space-y-3">
            <ApiKeyManager deviceId={deviceId} />
          </div>

          {/* Memory Management */}
          <div className="space-y-3">
            <MemoryManager deviceId={deviceId} memoryLimit={(settings as any).memoryLimit || 35} />
          </div>

          {/* Memory Limit Setting */}
          <div className="space-y-3">
            <h3 className="font-medium text-foreground">Memory Settings</h3>
            <div className="space-y-2">
              <Label htmlFor="memory-limit" className="text-sm text-muted-foreground">
                Memory Block Limit: {(settings as any).memoryLimit || 35}
              </Label>
              <div className="px-3">
                <Input
                  id="memory-limit"
                  type="range"
                  min="25"
                  max="50"
                  value={(settings as any).memoryLimit || 35}
                  onChange={(e) => handleSettingChange('memoryLimit', parseInt(e.target.value))}
                  className="w-full"
                  data-testid="slider-memory-limit"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>25</span>
                  <span>50</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Adjust how many memory blocks Omari can store for personalized responses
              </p>
            </div>
          </div>

          {/* Personality Customization */}
          <div className="space-y-3">
            <PersonalityCustomizer deviceId={deviceId} />
          </div>

          {/* App Integrations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground">App Integrations</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowIntegrationForm(true)}
                className="text-xs"
                data-testid="button-add-integration"
              >
                <Plus size={12} className="mr-1" />
                Add
              </Button>
            </div>
            
            <div className="space-y-3">
              {integrations.map((integration) => {
                const Icon = getIntegrationIcon(integration.type);
                return (
                  <div key={integration.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-chart-1 rounded flex items-center justify-center">
                        <Icon size={12} className="text-white" />
                      </div>
                      <span className="text-sm text-foreground">{integration.name}</span>
                    </div>
                    <Switch
                      checked={integration.isActive}
                      onCheckedChange={(checked) => {
                        // In a real implementation, you would call an API to update the integration
                        toast({
                          title: checked ? "Integration Enabled" : "Integration Disabled",
                          description: `${integration.name} has been ${checked ? 'enabled' : 'disabled'}.`,
                        });
                      }}
                      data-testid={`switch-integration-${integration.id}`}
                    />
                  </div>
                );
              })}
              
              {integrations.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No integrations configured</p>
                </div>
              )}
            </div>

            {/* Available Integrations */}
            {showIntegrationForm && !selectedTemplate && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">Available Integrations</h4>
                <div className="grid grid-cols-2 gap-2">
                  {templates.map((template) => {
                    const Icon = getIntegrationIcon(template.type);
                    const isAlreadyAdded = integrations.some(int => int.type === template.type);
                    
                    return (
                      <Button
                        key={template.type}
                        variant="outline"
                        className="h-auto p-3 flex flex-col items-center space-y-2"
                        onClick={() => handleAddIntegration(template)}
                        disabled={isAlreadyAdded}
                        data-testid={`button-select-${template.type}`}
                      >
                        <Icon size={20} />
                        <span className="text-xs text-center">{template.name}</span>
                        {isAlreadyAdded && (
                          <span className="text-xs text-muted-foreground">Added</span>
                        )}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setShowIntegrationForm(false)}
                  className="w-full mt-2"
                  data-testid="button-cancel-add-integration"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>

          {/* Chat Settings */}
          <div className="space-y-3">
            <h3 className="font-medium text-foreground">Chat Settings</h3>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm text-foreground">Auto-save conversations</span>
              <Switch
                checked={settings.autoSave}
                onCheckedChange={(checked) => handleSettingChange('autoSave', checked)}
                data-testid="switch-auto-save"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm text-foreground">Voice input enabled</span>
              <Switch
                checked={settings.voiceEnabled}
                onCheckedChange={(checked) => handleSettingChange('voiceEnabled', checked)}
                data-testid="switch-voice-enabled"
              />
            </div>
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleClearChat}
              data-testid="button-clear-chat"
            >
              <Trash2 className="mr-2" size={16} />
              Clear Chat History
            </Button>
          </div>

          {/* Export Options */}
          <div className="space-y-3">
            <h3 className="font-medium text-foreground">Data Management</h3>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => exportChatMutation.mutate()}
              disabled={exportChatMutation.isPending}
              data-testid="button-export-chat"
            >
              <Download className="mr-2" size={16} />
              {exportChatMutation.isPending ? 'Exporting...' : 'Export Chat History'}
            </Button>
          </div>
        </div>
      </div>

      {/* Integration Form */}
      {selectedTemplate && (
        <IntegrationForm
          isOpen={true}
          onClose={() => {
            setSelectedTemplate(null);
            setShowIntegrationForm(false);
          }}
          template={selectedTemplate}
          deviceId={deviceId}
        />
      )}
    </div>
  );
}
