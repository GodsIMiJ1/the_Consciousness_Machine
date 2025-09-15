import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Copy, Trash2, Plus, Key, Eye, EyeOff } from 'lucide-react';

interface ApiKeyManagerProps {
  deviceId: string;
}

export default function ApiKeyManager({ deviceId }: ApiKeyManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [permissions, setPermissions] = useState({
    chat: true,
    conversations: true,
    integrations: false,
    webhooks: true,
  });
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get API keys for this device
  const { data: apiKeys = [], isLoading } = useQuery({
    queryKey: ['/api/external/keys', deviceId],
    queryFn: () => api.getApiKeys(deviceId),
  });

  const createApiKeyMutation = useMutation({
    mutationFn: (data: { name: string; permissions: any }) => 
      api.createApiKey(deviceId, data.name, data.permissions),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/external/keys', deviceId] });
      setCreatedKey(data.key);
      setShowCreateForm(false);
      setNewKeyName('');
      setPermissions({
        chat: true,
        conversations: true,
        integrations: false,
        webhooks: true,
      });
      toast({
        title: "API Key Created",
        description: "Your new API key has been generated. Make sure to copy it now!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create API key.",
        variant: "destructive",
      });
    },
  });

  const deleteApiKeyMutation = useMutation({
    mutationFn: (keyId: string) => api.deleteApiKey(keyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/external/keys', deviceId] });
      toast({
        title: "API Key Deleted",
        description: "The API key has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete API key.",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "API key copied to clipboard.",
    });
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCreateKey = () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the API key.",
        variant: "destructive",
      });
      return;
    }
    createApiKeyMutation.mutate({ name: newKeyName, permissions });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">API Keys</h3>
          <p className="text-sm text-muted-foreground">
            Create API keys to integrate Omari with your other systems
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="text-sm"
          data-testid="button-create-api-key"
        >
          <Plus size={16} className="mr-2" />
          Create Key
        </Button>
      </div>

      {/* Show newly created key */}
      {createdKey && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardHeader>
            <CardTitle className="text-green-800 dark:text-green-200 flex items-center">
              <Key size={16} className="mr-2" />
              New API Key Created
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              This is the only time you'll see this key. Make sure to copy it now!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Input
                value={showKey ? createdKey : '•'.repeat(32)}
                readOnly
                className="font-mono text-sm"
                data-testid="input-new-api-key"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowKey(!showKey)}
                data-testid="button-toggle-key-visibility"
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(createdKey)}
                data-testid="button-copy-new-key"
              >
                <Copy size={16} />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCreatedKey(null)}
              className="mt-2 text-green-700 dark:text-green-300"
              data-testid="button-dismiss-new-key"
            >
              I've copied the key
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New API Key</CardTitle>
            <CardDescription>
              Choose a name and permissions for your new API key
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="keyName">Key Name</Label>
              <Input
                id="keyName"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., My App Integration"
                data-testid="input-api-key-name"
              />
            </div>

            <div>
              <Label>Permissions</Label>
              <div className="mt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Chat</p>
                    <p className="text-xs text-muted-foreground">Send messages and get responses</p>
                  </div>
                  <Switch
                    checked={permissions.chat}
                    onCheckedChange={(checked) => setPermissions(prev => ({ ...prev, chat: checked }))}
                    data-testid="switch-permission-chat"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Conversations</p>
                    <p className="text-xs text-muted-foreground">Read conversation history</p>
                  </div>
                  <Switch
                    checked={permissions.conversations}
                    onCheckedChange={(checked) => setPermissions(prev => ({ ...prev, conversations: checked }))}
                    data-testid="switch-permission-conversations"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Integrations</p>
                    <p className="text-xs text-muted-foreground">Access integration data</p>
                  </div>
                  <Switch
                    checked={permissions.integrations}
                    onCheckedChange={(checked) => setPermissions(prev => ({ ...prev, integrations: checked }))}
                    data-testid="switch-permission-integrations"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Webhooks</p>
                    <p className="text-xs text-muted-foreground">Receive webhook notifications</p>
                  </div>
                  <Switch
                    checked={permissions.webhooks}
                    onCheckedChange={(checked) => setPermissions(prev => ({ ...prev, webhooks: checked }))}
                    data-testid="switch-permission-webhooks"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleCreateKey}
                disabled={createApiKeyMutation.isPending}
                data-testid="button-confirm-create-key"
              >
                {createApiKeyMutation.isPending ? 'Creating...' : 'Create Key'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                data-testid="button-cancel-create-key"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing keys */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">Loading API keys...</p>
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="text-center py-8">
            <Key size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">No API keys created yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create your first API key to enable external integrations
            </p>
          </div>
        ) : (
          apiKeys.map((apiKey: any) => (
            <Card key={apiKey.id}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-foreground">{apiKey.name}</h4>
                      {!apiKey.isActive && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                      <span>Created: {formatDate(apiKey.createdAt)}</span>
                      {apiKey.lastUsed && (
                        <span>Last used: {formatDate(apiKey.lastUsed)}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {Object.entries(apiKey.permissions).map(([permission, enabled]) => 
                        enabled && (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        data-testid={`button-delete-key-${apiKey.id}`}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete the API key "{apiKey.name}"? 
                          This action cannot be undone and will immediately disable any applications using this key.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteApiKeyMutation.mutate(apiKey.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          data-testid={`button-confirm-delete-key-${apiKey.id}`}
                        >
                          Delete Key
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}