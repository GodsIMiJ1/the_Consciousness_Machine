import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type IntegrationTemplate } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Github, Mail, FileText, Server, MessageCircle, Calendar } from 'lucide-react';

interface IntegrationFormProps {
  isOpen: boolean;
  onClose: () => void;
  template: IntegrationTemplate;
  deviceId: string;
}

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
    default:
      return Server;
  }
};

export default function IntegrationForm({ isOpen, onClose, template, deviceId }: IntegrationFormProps) {
  const [config, setConfig] = useState<any>({});
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createIntegrationMutation = useMutation({
    mutationFn: (integrationData: any) => api.createIntegration(integrationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations', deviceId] });
      toast({
        title: "Integration Added",
        description: `${template.name} integration has been successfully configured.`,
      });
      onClose();
      setConfig({});
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create integration.",
        variant: "destructive",
      });
    },
  });

  const handleConfigChange = (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      const result = await api.testIntegration(template.type, config);
      toast({
        title: result.success ? "Connection Successful" : "Connection Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Failed to test connection.",
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSubmit = () => {
    const requiredFields = template.configFields.filter(field => field.required);
    const missingFields = requiredFields.filter(field => !config[field.key]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Required Fields",
        description: `Please fill in: ${missingFields.map(f => f.label).join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    createIntegrationMutation.mutate({
      deviceId,
      name: template.name,
      type: template.type,
      isActive: true,
      settings: config
    });
  };

  const Icon = getIntegrationIcon(template.type);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" data-testid="integration-form-overlay">
      <div className="absolute bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-lg max-w-md mx-auto">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Icon size={16} className="text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Add {template.name}</h2>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors touch-feedback"
              data-testid="button-close-integration-form"
            >
              <X size={18} />
            </Button>
          </div>
        </div>
        
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
          {template.configFields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key} className="text-sm text-foreground">
                {field.label} {field.required && <span className="text-destructive">*</span>}
              </Label>
              
              {field.type === 'select' ? (
                <Select
                  value={config[field.key] || ''}
                  onValueChange={(value) => handleConfigChange(field.key, value)}
                >
                  <SelectTrigger className="w-full" data-testid={`select-${field.key}`}>
                    <SelectValue placeholder={field.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={field.key}
                  type={field.type === 'password' ? 'password' : 'text'}
                  placeholder={field.placeholder}
                  value={config[field.key] || ''}
                  onChange={(e) => handleConfigChange(field.key, e.target.value)}
                  className="w-full"
                  data-testid={`input-${field.key}`}
                />
              )}
            </div>
          ))}

          <div className="flex space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={isTestingConnection}
              className="flex-1"
              data-testid="button-test-connection"
            >
              {isTestingConnection ? 'Testing...' : 'Test Connection'}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createIntegrationMutation.isPending}
              className="flex-1"
              data-testid="button-save-integration"
            >
              {createIntegrationMutation.isPending ? 'Adding...' : 'Add Integration'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}