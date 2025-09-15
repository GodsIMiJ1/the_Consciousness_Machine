import { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Copy, Plus, Trash2, Save, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
  isSecret: boolean;
  isProduction: boolean;
  description?: string;
}

export function EnvironmentConfig() {
  const [envVars, setEnvVars] = useState<EnvironmentVariable[]>([
    {
      id: '1',
      key: 'SUPABASE_URL',
      value: 'https://wixzqilqithhlybhyite.supabase.co',
      isSecret: false,
      isProduction: true,
      description: 'Supabase project URL'
    },
    {
      id: '2',
      key: 'SUPABASE_ANON_KEY',
      value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      isSecret: false,
      isProduction: true,
      description: 'Supabase anonymous public key'
    },
    {
      id: '3',
      key: 'FLAMEROUTER_API_KEY',
      value: '••••••••••••••••',
      isSecret: true,
      isProduction: true,
      description: 'FlameRouter API authentication key'
    },
    {
      id: '4',
      key: 'WEBHOOK_SECRET',
      value: '••••••••••••••••',
      isSecret: true,
      isProduction: true,
      description: 'Webhook signature verification secret'
    }
  ]);

  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());
  const [newVar, setNewVar] = useState({ key: '', value: '', isSecret: false, description: '' });
  const [isAddingNew, setIsAddingNew] = useState(false);
  const { toast } = useToast();

  const toggleSecretVisibility = (id: string) => {
    setVisibleSecrets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value);
    toast({
      title: 'Copied to clipboard',
      description: 'Value has been copied to your clipboard.',
    });
  };

  const addEnvironmentVariable = () => {
    if (!newVar.key || !newVar.value) {
      toast({
        title: 'Missing fields',
        description: 'Please provide both key and value.',
        variant: 'destructive',
      });
      return;
    }

    const newEnvVar: EnvironmentVariable = {
      id: Date.now().toString(),
      key: newVar.key,
      value: newVar.value,
      isSecret: newVar.isSecret,
      isProduction: false,
      description: newVar.description || undefined
    };

    setEnvVars(prev => [...prev, newEnvVar]);
    setNewVar({ key: '', value: '', isSecret: false, description: '' });
    setIsAddingNew(false);

    toast({
      title: 'Variable added',
      description: `${newVar.key} has been added successfully.`,
    });
  };

  const removeVariable = (id: string) => {
    setEnvVars(prev => prev.filter(v => v.id !== id));
    toast({
      title: 'Variable removed',
      description: 'Environment variable has been removed.',
    });
  };

  const updateVariable = (id: string, updates: Partial<EnvironmentVariable>) => {
    setEnvVars(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  };

  const saveConfiguration = () => {
    // In a real app, this would sync with Supabase secrets management
    toast({
      title: 'Configuration saved',
      description: 'Environment variables have been updated.',
    });
  };

  const productionVars = envVars.filter(v => v.isProduction);
  const developmentVars = envVars.filter(v => !v.isProduction);
  const secretsCount = envVars.filter(v => v.isSecret).length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text flex items-center gap-2">
            <Key className="h-8 w-8" />
            Environment Configuration
          </h1>
          <p className="text-text-muted mt-1">
            Manage environment variables, API keys, and production secrets
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsAddingNew(true)}
            className="btn-outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Variable
          </Button>
          <Button onClick={saveConfiguration} className="btn-primary">
            <Save className="h-4 w-4 mr-2" />
            Save Config
          </Button>
        </div>
      </div>

      {/* Security Alert */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Secrets are encrypted and stored securely in Supabase. Never commit secrets to your repository.
          Use the secret toggle for sensitive values like API keys and tokens.
        </AlertDescription>
      </Alert>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="aura-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Total Variables</p>
                <p className="text-2xl font-bold text-text">{envVars.length}</p>
              </div>
              <Key className="h-8 w-8 text-text-muted" />
            </div>
          </CardContent>
        </Card>

        <Card className="aura-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Secrets</p>
                <p className="text-2xl font-bold text-error">{secretsCount}</p>
              </div>
              <Shield className="h-8 w-8 text-error" />
            </div>
          </CardContent>
        </Card>

        <Card className="aura-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Production</p>
                <p className="text-2xl font-bold text-accent">{productionVars.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="aura-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Development</p>
                <p className="text-2xl font-bold text-text">{developmentVars.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-text-muted" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Variable */}
      {isAddingNew && (
        <Card className="aura-card border-brand/20">
          <CardHeader>
            <CardTitle className="text-text">Add New Environment Variable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-text">Variable Name</Label>
                <Input
                  value={newVar.key}
                  onChange={(e) => setNewVar(prev => ({ ...prev, key: e.target.value }))}
                  placeholder="API_KEY"
                  className="input"
                />
              </div>
              
              <div>
                <Label className="text-text">Value</Label>
                <Input
                  type={newVar.isSecret ? 'password' : 'text'}
                  value={newVar.value}
                  onChange={(e) => setNewVar(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="Enter value..."
                  className="input"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-text">Description (Optional)</Label>
              <Input
                value={newVar.description}
                onChange={(e) => setNewVar(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What this variable is used for..."
                className="input"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                checked={newVar.isSecret}
                onCheckedChange={(checked) => setNewVar(prev => ({ ...prev, isSecret: checked }))}
              />
              <Label className="text-text">Mark as secret</Label>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={addEnvironmentVariable} className="btn-primary">
                Add Variable
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsAddingNew(false)}
                className="btn-outline"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Production Variables */}
      <Card className="aura-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-text">
            <CheckCircle className="h-5 w-5 text-accent" />
            Production Environment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {productionVars.map((envVar) => (
            <div key={envVar.id} className="p-4 rounded-lg bg-bg-muted/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-text">{envVar.key}</span>
                      {envVar.isSecret && (
                        <Badge className="bg-error/10 text-error border-error/20">
                          <Shield className="h-3 w-3 mr-1" />
                          Secret
                        </Badge>
                      )}
                    </div>
                    {envVar.description && (
                      <p className="text-sm text-text-muted">{envVar.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {envVar.isSecret ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleSecretVisibility(envVar.id)}
                      className="btn-outline"
                    >
                      {visibleSecrets.has(envVar.id) ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(envVar.value)}
                      className="btn-outline"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                  
                  {!envVar.isProduction && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeVariable(envVar.id)}
                      className="btn-outline text-error hover:bg-error/10"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="bg-bg border border-border rounded-lg p-3 font-mono text-sm">
                {envVar.isSecret && !visibleSecrets.has(envVar.id) ? (
                  <span className="text-text-muted">••••••••••••••••</span>
                ) : (
                  <span className="text-text break-all">{envVar.value}</span>
                )}
              </div>
            </div>
          ))}
          
          {productionVars.length === 0 && (
            <div className="text-center py-8 text-text-muted">
              No production environment variables configured.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Development Variables */}
      {developmentVars.length > 0 && (
        <Card className="aura-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-text">
              <AlertTriangle className="h-5 w-5 text-warn" />
              Development Environment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {developmentVars.map((envVar) => (
              <div key={envVar.id} className="p-4 rounded-lg bg-bg-muted/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text">{envVar.key}</span>
                        {envVar.isSecret && (
                          <Badge className="bg-error/10 text-error border-error/20">
                            <Shield className="h-3 w-3 mr-1" />
                            Secret
                          </Badge>
                        )}
                      </div>
                      {envVar.description && (
                        <p className="text-sm text-text-muted">{envVar.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateVariable(envVar.id, { isProduction: true })}
                      className="btn-outline"
                    >
                      Promote
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeVariable(envVar.id)}
                      className="btn-outline text-error hover:bg-error/10"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="bg-bg border border-border rounded-lg p-3 font-mono text-sm">
                  <span className="text-text break-all">{envVar.value}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}