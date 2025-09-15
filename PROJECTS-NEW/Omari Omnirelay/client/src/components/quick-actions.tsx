import { Button } from '@/components/ui/button';
import { Calendar, CheckSquare, Mail, CloudSun } from 'lucide-react';

interface QuickActionsProps {
  onAction: (action: string) => void;
}

export default function QuickActions({ onAction }: QuickActionsProps) {
  const actions = [
    { id: 'schedule', label: 'Check Schedule', icon: Calendar },
    { id: 'tasks', label: 'My Tasks', icon: CheckSquare },
    { id: 'email', label: 'Email Summary', icon: Mail },
    { id: 'weather', label: 'Weather', icon: CloudSun },
  ];

  return (
    <div className="px-4 pb-2">
      <div className="flex space-x-2 overflow-x-auto hide-scrollbar">
        {actions.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant="secondary"
            size="sm"
            onClick={() => onAction(id)}
            className="flex items-center space-x-2 bg-muted rounded-full px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/80 transition-colors touch-feedback whitespace-nowrap"
            data-testid={`button-quick-action-${id}`}
          >
            <Icon size={14} />
            <span>{label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
