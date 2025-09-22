import React, { useState } from 'react';
import { ChevronDown, Cpu, Zap, Brain } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const models = [
  {
    id: 'hermes-3-llama-3.1-8b',
    name: 'Hermes 3 Llama 3.1 8B',
    description: 'Balanced reasoning and creativity',
    icon: Brain,
    status: 'online',
    capabilities: ['Reasoning', 'Creativity', 'Code']
  },
  {
    id: 'mistral-nemo-12b',
    name: 'Mistral Nemo 12B',
    description: 'Strong multilingual performance',
    icon: Zap,
    status: 'online',
    capabilities: ['Multilingual', 'Fast', 'Precise']
  },
  {
    id: 'llama-3.1-70b',
    name: 'Llama 3.1 70B',
    description: 'Maximum intelligence and context',
    icon: Cpu,
    status: 'loading',
    capabilities: ['Deep Reasoning', 'Long Context', 'Expert']
  }
];

interface ModelSwitcherProps {
  selectedModel?: string;
  onModelChange?: (modelId: string) => void;
  className?: string;
}

export const ModelSwitcher: React.FC<ModelSwitcherProps> = ({
  selectedModel = 'hermes-3-llama-3.1-8b',
  onModelChange,
  className
}) => {
  const [currentModel, setCurrentModel] = useState(selectedModel);

  const handleModelChange = (modelId: string) => {
    setCurrentModel(modelId);
    onModelChange?.(modelId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500/80';
      case 'loading': return 'bg-yellow-500/80 animate-pulse';
      case 'offline': return 'bg-red-500/80';
      default: return 'bg-mystic-silver/80';
    }
  };

  const selectedModelData = models.find(m => m.id === currentModel);
  const Icon = selectedModelData?.icon || Brain;

  return (
    <div className={className}>
      <Select value={currentModel} onValueChange={handleModelChange}>
        <SelectTrigger className="glass-mystic shadow-mystic border-mystic-silver/30 hover:shadow-soul transition-mystic">
          <div className="flex items-center gap-3 w-full">
            <Icon className="h-4 w-4 text-mystic-cyan" />
            <div className="flex-1 text-left">
              <SelectValue />
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedModelData?.status || 'offline')}`} />
              <ChevronDown className="h-4 w-4 text-mystic-silver" />
            </div>
          </div>
        </SelectTrigger>
        
        <SelectContent className="glass-mystic shadow-soul border-mystic-cyan/20 bg-background/95 backdrop-blur-lg">
          {models.map((model) => {
            const ModelIcon = model.icon;
            return (
              <SelectItem 
                key={model.id} 
                value={model.id}
                className="focus:bg-mystic-cyan/10 cursor-pointer transition-mystic"
              >
                <div className="flex items-center gap-3 w-full py-2">
                  <ModelIcon className="h-4 w-4 text-mystic-cyan shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{model.name}</span>
                      <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(model.status)}`} />
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{model.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {model.capabilities.map((cap) => (
                        <Badge 
                          key={cap} 
                          variant="secondary" 
                          className="text-xs px-1.5 py-0.5 bg-mystic-cyan/10 text-mystic-cyan border-mystic-cyan/20"
                        >
                          {cap}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};