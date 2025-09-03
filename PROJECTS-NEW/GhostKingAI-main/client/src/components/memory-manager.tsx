import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDeviceId } from '@/lib/device-id';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Brain, Edit, Trash2, Plus, Star } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const memoryBlockSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  content: z.string().min(1, "Content is required").max(1000, "Content too long"),
  importance: z.number().min(1).max(10),
  category: z.string().optional().default("general"),
});

type MemoryBlockForm = z.infer<typeof memoryBlockSchema>;

interface MemoryBlock {
  id: string;
  deviceId: string;
  title: string;
  content: string;
  importance: number;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface MemoryManagerProps {
  deviceId: string;
  memoryLimit: number;
}

export default function MemoryManager({ deviceId, memoryLimit }: MemoryManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get memory blocks
  const { data: memoryBlocks = [] } = useQuery({
    queryKey: ['/api/memory', deviceId],
    queryFn: async () => {
      const response = await fetch(`/api/memory/${deviceId}`);
      if (!response.ok) throw new Error('Failed to fetch memory blocks');
      return response.json() as Promise<MemoryBlock[]>;
    },
  });

  // Create memory block form
  const createForm = useForm<MemoryBlockForm>({
    resolver: zodResolver(memoryBlockSchema),
    defaultValues: {
      title: '',
      content: '',
      importance: 5,
      category: 'general',
    },
  });

  // Edit memory block form
  const editForm = useForm<MemoryBlockForm>({
    resolver: zodResolver(memoryBlockSchema),
    defaultValues: {
      title: '',
      content: '',
      importance: 5,
      category: 'general',
    },
  });

  // Create memory block mutation
  const createMemoryMutation = useMutation({
    mutationFn: async (data: MemoryBlockForm) => {
      const response = await fetch('/api/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, deviceId }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create memory block');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/memory', deviceId] });
      setShowCreateForm(false);
      createForm.reset();
      toast({
        title: "Memory Saved",
        description: "Your memory block has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update memory block mutation
  const updateMemoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<MemoryBlockForm> }) => {
      const response = await fetch(`/api/memory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update memory block');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/memory', deviceId] });
      setEditingId(null);
      editForm.reset();
      toast({
        title: "Memory Updated",
        description: "Your memory block has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update memory block.",
        variant: "destructive",
      });
    },
  });

  // Delete memory block mutation
  const deleteMemoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/memory/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete memory block');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/memory', deviceId] });
      toast({
        title: "Memory Deleted",
        description: "Your memory block has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete memory block.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (memoryBlock: MemoryBlock) => {
    setEditingId(memoryBlock.id);
    editForm.reset({
      title: memoryBlock.title,
      content: memoryBlock.content,
      importance: memoryBlock.importance,
      category: memoryBlock.category,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this memory block?')) {
      deleteMemoryMutation.mutate(id);
    }
  };

  const onCreateSubmit = (data: MemoryBlockForm) => {
    createMemoryMutation.mutate(data);
  };

  const onEditSubmit = (data: MemoryBlockForm) => {
    if (editingId) {
      updateMemoryMutation.mutate({ id: editingId, data });
    }
  };

  const getImportanceColor = (importance: number) => {
    if (importance >= 8) return 'bg-red-500';
    if (importance >= 6) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      general: 'bg-gray-500',
      personal: 'bg-blue-500',
      work: 'bg-purple-500',
      goals: 'bg-green-500',
      preferences: 'bg-orange-500',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Brain size={20} />
            Memory Blocks
          </h3>
          <p className="text-sm text-muted-foreground">
            {memoryBlocks.length} / {memoryLimit} blocks used
          </p>
        </div>
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={memoryBlocks.length >= memoryLimit}
              data-testid="button-create-memory"
            >
              <Plus size={16} className="mr-1" />
              Add Memory
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Memory Block</DialogTitle>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Memory title" data-testid="input-memory-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="What should Omari remember?"
                          rows={3}
                          data-testid="textarea-memory-content"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="importance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Importance (1-10): {field.value}</FormLabel>
                      <FormControl>
                        <Slider
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          max={10}
                          min={1}
                          step={1}
                          className="w-full"
                          data-testid="slider-memory-importance"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-memory-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="personal">Personal</SelectItem>
                          <SelectItem value="work">Work</SelectItem>
                          <SelectItem value="goals">Goals</SelectItem>
                          <SelectItem value="preferences">Preferences</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={createMemoryMutation.isPending}
                    data-testid="button-save-memory"
                  >
                    Save Memory
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateForm(false)}
                    data-testid="button-cancel-memory"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {memoryBlocks.length === 0 ? (
          <Card className="p-4 text-center text-muted-foreground">
            <Brain size={32} className="mx-auto mb-2 opacity-50" />
            <p>No memories saved yet</p>
            <p className="text-xs">Create your first memory block to help Omari remember important information</p>
          </Card>
        ) : (
          memoryBlocks.map((memory) => (
            <Card key={memory.id} className="p-3" data-testid={`memory-block-${memory.id}`}>
              {editingId === memory.id ? (
                <Form {...editForm}>
                  <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-3">
                    <FormField
                      control={editForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormControl>
                          <Input {...field} className="font-medium" />
                        </FormControl>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="content"
                      render={({ field }) => (
                        <FormControl>
                          <Textarea {...field} rows={2} />
                        </FormControl>
                      )}
                    />
                    <div className="flex items-center gap-4">
                      <FormField
                        control={editForm.control}
                        name="importance"
                        render={({ field }) => (
                          <div className="flex-1">
                            <FormLabel className="text-xs">Importance: {field.value}</FormLabel>
                            <FormControl>
                              <Slider
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                                max={10}
                                min={1}
                                step={1}
                                className="w-full"
                              />
                            </FormControl>
                          </div>
                        )}
                      />
                      <FormField
                        control={editForm.control}
                        name="category"
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="general">General</SelectItem>
                              <SelectItem value="personal">Personal</SelectItem>
                              <SelectItem value="work">Work</SelectItem>
                              <SelectItem value="goals">Goals</SelectItem>
                              <SelectItem value="preferences">Preferences</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" disabled={updateMemoryMutation.isPending}>
                        Save
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm text-foreground">{memory.title}</h4>
                    <div className="flex items-center gap-1 ml-2">
                      <Badge variant="secondary" className={`text-white text-xs ${getCategoryColor(memory.category)}`}>
                        {memory.category}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: memory.importance }).map((_, i) => (
                          <Star key={i} size={10} className={`${getImportanceColor(memory.importance)} text-white fill-current`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{memory.content}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      Updated {new Date(memory.updatedAt).toLocaleDateString()}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(memory)}
                        data-testid={`button-edit-memory-${memory.id}`}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(memory.id)}
                        className="text-destructive hover:text-destructive"
                        data-testid={`button-delete-memory-${memory.id}`}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}