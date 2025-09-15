import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { User, Sparkles, Brain, Heart, Lightbulb, Calculator, Smile, Briefcase } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const personalitySchema = z.object({
  userInfo: z.object({
    name: z.string().optional(),
    preferences: z.string().optional(),
    background: z.string().optional(),
    goals: z.string().optional(),
  }),
  traits: z.object({
    wisdom: z.boolean(),
    humor: z.boolean(),
    formal: z.boolean(),
    creative: z.boolean(),
    analytical: z.boolean(),
    empathetic: z.boolean(),
  }),
  customPrompts: z.string().optional(),
});

type PersonalityForm = z.infer<typeof personalitySchema>;

interface PersonalitySettings {
  id: string;
  deviceId: string;
  userInfo: {
    name?: string;
    preferences?: string;
    background?: string;
    goals?: string;
  };
  traits: {
    wisdom: boolean;
    humor: boolean;
    formal: boolean;
    creative: boolean;
    analytical: boolean;
    empathetic: boolean;
  };
  customPrompts: string;
  updatedAt: Date;
}

interface PersonalityCustomizerProps {
  deviceId: string;
}

export default function PersonalityCustomizer({ deviceId }: PersonalityCustomizerProps) {
  const [hasChanges, setHasChanges] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get personality settings
  const { data: personalitySettings } = useQuery({
    queryKey: ['/api/personality', deviceId],
    queryFn: async () => {
      const response = await fetch(`/api/personality/${deviceId}`);
      if (!response.ok) throw new Error('Failed to fetch personality settings');
      const data = await response.json();
      return data as PersonalitySettings | null;
    },
  });

  const form = useForm<PersonalityForm>({
    resolver: zodResolver(personalitySchema),
    defaultValues: {
      userInfo: {
        name: '',
        preferences: '',
        background: '',
        goals: '',
      },
      traits: {
        wisdom: true,
        humor: false,
        formal: false,
        creative: true,
        analytical: true,
        empathetic: true,
      },
      customPrompts: '',
    },
  });

  // Update form when data loads
  useEffect(() => {
    if (personalitySettings) {
      form.reset({
        userInfo: personalitySettings.userInfo,
        traits: personalitySettings.traits,
        customPrompts: personalitySettings.customPrompts || '',
      });
    }
  }, [personalitySettings, form]);

  // Watch for changes
  useEffect(() => {
    const subscription = form.watch(() => {
      setHasChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Update personality settings mutation
  const updatePersonalityMutation = useMutation({
    mutationFn: async (data: PersonalityForm) => {
      const response = await fetch(`/api/personality/${deviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update personality settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/personality', deviceId] });
      setHasChanges(false);
      toast({
        title: "Personality Updated",
        description: "Omari's personality has been customized to your preferences.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update personality settings.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PersonalityForm) => {
    updatePersonalityMutation.mutate(data);
  };

  const traitIcons = {
    wisdom: Brain,
    humor: Smile,
    formal: Briefcase,
    creative: Lightbulb,
    analytical: Calculator,
    empathetic: Heart,
  };

  const traitDescriptions = {
    wisdom: "Ancient knowledge and philosophical insights",
    humor: "Playful and witty responses",
    formal: "Professional and structured communication",
    creative: "Imaginative and artistic thinking",
    analytical: "Logical and data-driven approach",
    empathetic: "Understanding and compassionate responses",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles size={20} />
        <h3 className="text-lg font-semibold text-foreground">Personality Customization</h3>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* User Information */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <User size={18} />
              <h4 className="font-medium text-foreground">About You</h4>
            </div>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="userInfo.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="What should Omari call you?"
                        data-testid="input-user-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="userInfo.preferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Preferences</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Communication style, topics you enjoy, etc."
                        rows={2}
                        data-testid="textarea-user-preferences"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="userInfo.background"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Background</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Your profession, interests, important context..."
                        rows={2}
                        data-testid="textarea-user-background"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="userInfo.goals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goals & Aspirations</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="What you're working towards, what matters to you..."
                        rows={2}
                        data-testid="textarea-user-goals"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          {/* Personality Traits */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Brain size={18} />
              <h4 className="font-medium text-foreground">Omari's Personality Traits</h4>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {Object.entries(traitIcons).map(([trait, Icon]) => (
                <FormField
                  key={trait}
                  control={form.control}
                  name={`traits.${trait}` as any}
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0 p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon size={18} className="text-primary" />
                        <div>
                          <FormLabel className="text-sm font-medium capitalize">
                            {trait}
                          </FormLabel>
                          <p className="text-xs text-muted-foreground">
                            {traitDescriptions[trait as keyof typeof traitDescriptions]}
                          </p>
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid={`switch-trait-${trait}`}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </Card>

          {/* Custom Instructions */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb size={18} />
              <h4 className="font-medium text-foreground">Custom Instructions</h4>
            </div>
            <FormField
              control={form.control}
              name="customPrompts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Instructions for Omari</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Any specific behaviors, knowledge areas, or communication styles you'd like Omari to adopt..."
                      rows={4}
                      data-testid="textarea-custom-prompts"
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1">
                    These instructions will be included in every conversation with Omari
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={!hasChanges || updatePersonalityMutation.isPending}
              data-testid="button-save-personality"
            >
              {updatePersonalityMutation.isPending ? 'Saving...' : 'Save Personality'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}