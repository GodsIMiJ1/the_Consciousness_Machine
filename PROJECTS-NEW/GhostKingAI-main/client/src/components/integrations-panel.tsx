import { type Integration } from '@/lib/api';
import { Calendar, Mail, CheckSquare, Circle } from 'lucide-react';

interface IntegrationsPanelProps {
  isVisible: boolean;
  integrations: Integration[];
  onClose: () => void;
}

const getIntegrationIcon = (type: string) => {
  switch (type) {
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

export default function IntegrationsPanel({ isVisible, integrations, onClose }: IntegrationsPanelProps) {
  if (!isVisible) return null;

  return (
    <div className="bg-muted/50 border-b border-border p-3" data-testid="integrations-panel">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground">Connected Apps</span>
        <span className="text-xs text-muted-foreground" data-testid="text-integration-count">
          {integrations.length} active
        </span>
      </div>
      
      {integrations.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">No integrations configured</p>
        </div>
      ) : (
        <div className="space-y-2">
          {integrations.map((integration) => {
            const Icon = getIntegrationIcon(integration.type);
            return (
              <div key={integration.id} className="flex items-center space-x-3 py-2">
                <div className="w-6 h-6 bg-chart-1 rounded flex items-center justify-center">
                  <Icon size={12} className="text-white" />
                </div>
                <span className="text-sm text-foreground flex-1" data-testid={`text-integration-${integration.id}`}>
                  {integration.name}
                </span>
                <Circle className="w-2 h-2 fill-chart-1 text-chart-1" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
