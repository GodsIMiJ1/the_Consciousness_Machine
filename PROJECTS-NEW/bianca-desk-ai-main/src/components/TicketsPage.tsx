import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Plus, Clock, AlertTriangle, Edit, Trash2, CheckCircle, User, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const ticketFormSchema = z.object({
  summary: z.string().min(5, 'Summary must be at least 5 characters'),
  details: z.string().min(10, 'Details must be at least 10 characters'),
  category: z.string().min(1, 'Please select a category'),
  severity: z.string().min(1, 'Please select a severity'),
  product: z.string().min(1, 'Please select a product'),
  contact_name: z.string().min(2, 'Contact name must be at least 2 characters'),
  contact_info: z.string().min(5, 'Contact info must be at least 5 characters'),
  role: z.string().default('user'),
});

type TicketFormData = z.infer<typeof ticketFormSchema>;

interface Ticket {
  id: string;
  summary: string;
  details: string | null;
  category: string;
  severity: string;
  product: string;
  status: string;
  contact_name: string | null;
  contact_info: string | null;
  assigned_to: string | null;
  resolution: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  sla_due_at: string | null;
}

export function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      summary: '',
      details: '',
      category: '',
      severity: '',
      product: '',
      contact_name: '',
      contact_info: '',
      role: 'user',
    },
  });

  useEffect(() => {
    loadTickets();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('tickets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_tickets'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTickets(prev => [payload.new as Ticket, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setTickets(prev => prev.map(ticket => 
              ticket.id === payload.new.id ? payload.new as Ticket : ticket
            ));
          } else if (payload.eventType === 'DELETE') {
            setTickets(prev => prev.filter(ticket => ticket.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading tickets',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (formData: TicketFormData) => {
    try {
      // Transform form data to match database schema
      const ticketData = {
        summary: formData.summary,
        details: formData.details,
        category: formData.category,
        severity: formData.severity,
        product: formData.product,
        contact_name: formData.contact_name,
        contact_info: formData.contact_info,
        role: formData.role,
        status: 'open',
      };

      const { error } = await supabase
        .from('support_tickets')
        .insert(ticketData);

      if (error) throw error;

      toast({
        title: 'Ticket created',
        description: 'Your support ticket has been created successfully.',
      });

      form.reset();
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error creating ticket',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const updateData: any = { status };
      if (status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('support_tickets')
        .update(updateData)
        .eq('id', ticketId);

      if (error) throw error;

      toast({
        title: 'Ticket updated',
        description: `Ticket status changed to ${status}.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error updating ticket',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isOverdue = (ticket: Ticket) => {
    if (!ticket.sla_due_at || ticket.status === 'resolved' || ticket.status === 'closed') {
      return false;
    }
    return new Date(ticket.sla_due_at) < new Date();
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-bg-muted rounded w-48"></div>
          <div className="h-32 bg-bg-muted rounded"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text">Support Tickets</h1>
          <p className="text-text-muted mt-1">
            Manage and track support requests and escalations
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Create Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-panel border-border">
            <DialogHeader>
              <DialogTitle className="text-text">Create Support Ticket</DialogTitle>
              <DialogDescription className="text-text-muted">
                Fill out the form below to create a new support ticket.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(createTicket)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="product"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-bg border-border">
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="bianca-desk">BiancaDesk</SelectItem>
                            <SelectItem value="aura-training">AURA Training</SelectItem>
                            <SelectItem value="clinic-management">Clinic Management</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-bg border-border">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="technical">Technical Issue</SelectItem>
                            <SelectItem value="billing">Billing</SelectItem>
                            <SelectItem value="feature-request">Feature Request</SelectItem>
                            <SelectItem value="training">Training</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="severity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Severity</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-bg border-border">
                            <SelectValue placeholder="Select severity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="critical">Critical - System Down</SelectItem>
                          <SelectItem value="high">High - Major Impact</SelectItem>
                          <SelectItem value="normal">Normal - Minor Impact</SelectItem>
                          <SelectItem value="low">Low - General Question</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Summary</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Brief description of the issue" className="input" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="details"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Details</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Detailed description of the issue, steps to reproduce, etc."
                          className="min-h-[100px] bg-bg border-border"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contact_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Your name" className="input" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="contact_info"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Info</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Email or phone" className="input" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="btn-outline">
                    Cancel
                  </Button>
                  <Button type="submit" className="btn-primary">
                    Create Ticket
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="aura-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Total Tickets</p>
                <p className="text-2xl font-bold text-text">{tickets.length}</p>
              </div>
              <Tag className="h-8 w-8 text-text-muted" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="aura-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Open</p>
                <p className="text-2xl font-bold text-text">
                  {tickets.filter(t => t.status === 'open').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="aura-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Critical</p>
                <p className="text-2xl font-bold text-text">
                  {tickets.filter(t => t.severity === 'critical').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-error" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="aura-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Overdue</p>
                <p className="text-2xl font-bold text-text">
                  {tickets.filter(t => isOverdue(t)).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-warn" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets Grid */}
      {tickets.length === 0 ? (
        <Card className="aura-card">
          <CardContent className="p-8 text-center">
            <Tag className="h-12 w-12 mx-auto text-text-muted mb-4" />
            <h3 className="text-lg font-heading font-semibold text-text mb-2">No tickets yet</h3>
            <p className="text-text-muted mb-4">
              Create your first support ticket to get started.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Create Ticket
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="aura-card hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg text-text truncate pr-2">
                    {ticket.summary}
                  </CardTitle>
                  {isOverdue(ticket) && (
                    <AlertTriangle className="h-5 w-5 text-error flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`text-xs ${getSeverityColor(ticket.severity)}`}>
                    {ticket.severity}
                  </Badge>
                  <Badge className={`text-xs ${getStatusColor(ticket.status)}`}>
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {ticket.product}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <p className="text-sm text-text-muted line-clamp-2">
                  {ticket.details || 'No details provided'}
                </p>
                
                <div className="space-y-2 text-xs text-text-muted">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{ticket.contact_name || 'No contact'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(ticket.created_at)}</span>
                  </div>
                  {ticket.sla_due_at && (
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Due: {formatDate(ticket.sla_due_at)}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 pt-2">
                  {ticket.status === 'open' && (
                    <Button
                      size="sm"
                      onClick={() => updateTicketStatus(ticket.id, 'resolved')}
                      className="btn text-xs"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Resolve
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}