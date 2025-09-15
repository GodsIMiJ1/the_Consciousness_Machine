import { useState } from 'react';
import { BookOpen, Download, ExternalLink, Code, Users, Settings, Shield, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

interface DocumentSection {
  id: string;
  title: string;
  content: string;
  category: 'user' | 'api' | 'admin' | 'developer';
  lastUpdated: string;
}

export function DocumentationHub() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const documentSections: DocumentSection[] = [
    {
      id: '1',
      title: 'Getting Started with BiancaDesk',
      content: 'Learn how to set up your account, navigate the interface, and perform basic tasks.',
      category: 'user',
      lastUpdated: '2025-01-15'
    },
    {
      id: '2',
      title: 'Creating and Managing Tickets',
      content: 'Complete guide to ticket creation, status updates, escalation procedures, and resolution workflow.',
      category: 'user',
      lastUpdated: '2025-01-14'
    },
    {
      id: '3',
      title: 'Knowledge Base Search',
      content: 'How to effectively search the knowledge base, use advanced filters, and contribute new articles.',
      category: 'user',
      lastUpdated: '2025-01-13'
    },
    {
      id: '4',
      title: 'API Authentication',
      content: 'Learn how to authenticate with the BiancaDesk API using JWT tokens and manage API keys.',
      category: 'api',
      lastUpdated: '2025-01-12'
    },
    {
      id: '5',
      title: 'Ticket Management API',
      content: 'Complete API reference for creating, updating, and retrieving tickets programmatically.',
      category: 'api',
      lastUpdated: '2025-01-11'
    },
    {
      id: '6',
      title: 'Search API Endpoints',
      content: 'API documentation for knowledge base search, indexing, and content management.',
      category: 'api',
      lastUpdated: '2025-01-10'
    },
    {
      id: '7',
      title: 'User Management',
      content: 'Administrator guide to managing users, roles, permissions, and access control.',
      category: 'admin',
      lastUpdated: '2025-01-09'
    },
    {
      id: '8',
      title: 'System Configuration',
      content: 'Configure system settings, integrations, webhooks, and escalation rules.',
      category: 'admin',
      lastUpdated: '2025-01-08'
    },
    {
      id: '9',
      title: 'Security Settings',
      content: 'Security configuration, SSL setup, authentication providers, and compliance settings.',
      category: 'admin',
      lastUpdated: '2025-01-07'
    },
    {
      id: '10',
      title: 'Development Setup',
      content: 'Set up the development environment, build process, and local testing procedures.',
      category: 'developer',
      lastUpdated: '2025-01-06'
    },
    {
      id: '11',
      title: 'Database Schema',
      content: 'Complete database schema documentation, relationships, and migration procedures.',
      category: 'developer',
      lastUpdated: '2025-01-05'
    },
    {
      id: '12',
      title: 'Deployment Guide',
      content: 'Production deployment procedures, Docker configuration, and monitoring setup.',
      category: 'developer',
      lastUpdated: '2025-01-04'
    }
  ];

  const filteredSections = documentSections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'user':
        return <Users className="h-4 w-4" />;
      case 'api':
        return <Code className="h-4 w-4" />;
      case 'admin':
        return <Settings className="h-4 w-4" />;
      case 'developer':
        return <Database className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'user':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'api':
        return 'bg-brand/10 text-brand border-brand/20';
      case 'admin':
        return 'bg-warn/10 text-warn border-warn/20';
      case 'developer':
        return 'bg-accent-2/10 text-accent-2 border-accent-2/20';
      default:
        return 'bg-bg-muted text-text-muted border-border';
    }
  };

  const renderSectionsByCategory = (category: string) => {
    const sections = filteredSections.filter(section => section.category === category);
    
    return (
      <div className="space-y-4">
        {sections.map((section) => (
          <Card key={section.id} className="aura-card hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg text-text">{section.title}</CardTitle>
                  <p className="text-sm text-text-muted">{section.content}</p>
                </div>
                <Badge className={getCategoryColor(category)}>
                  {getCategoryIcon(category)}
                  <span className="ml-1 capitalize">{category}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">
                  Last updated: {new Date(section.lastUpdated).toLocaleDateString()}
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="btn-outline">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" className="btn-outline">
                    <Download className="h-3 w-3 mr-1" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {sections.length === 0 && (
          <div className="text-center py-8 text-text-muted">
            No documentation found in this category.
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text flex items-center gap-2">
            <BookOpen className="h-8 w-8" />
            Documentation Hub
          </h1>
          <p className="text-text-muted mt-1">
            User guides, API documentation, and developer resources
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="btn-outline">
            <Download className="h-4 w-4 mr-2" />
            Download All
          </Button>
          <Button className="btn-primary">
            <ExternalLink className="h-4 w-4 mr-2" />
            Online Docs
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="aura-card">
        <CardContent className="p-4">
          <Input
            placeholder="Search documentation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input"
          />
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="aura-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">User Guides</p>
                <p className="text-2xl font-bold text-text">
                  {documentSections.filter(s => s.category === 'user').length}
                </p>
              </div>
              <Users className="h-8 w-8 text-text-muted" />
            </div>
          </CardContent>
        </Card>

        <Card className="aura-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">API Docs</p>
                <p className="text-2xl font-bold text-text">
                  {documentSections.filter(s => s.category === 'api').length}
                </p>
              </div>
              <Code className="h-8 w-8 text-text-muted" />
            </div>
          </CardContent>
        </Card>

        <Card className="aura-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Admin Guides</p>
                <p className="text-2xl font-bold text-text">
                  {documentSections.filter(s => s.category === 'admin').length}
                </p>
              </div>
              <Settings className="h-8 w-8 text-text-muted" />
            </div>
          </CardContent>
        </Card>

        <Card className="aura-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Dev Resources</p>
                <p className="text-2xl font-bold text-text">
                  {documentSections.filter(s => s.category === 'developer').length}
                </p>
              </div>
              <Database className="h-8 w-8 text-text-muted" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documentation Sections */}
      <Tabs defaultValue="user" className="space-y-6">
        <TabsList className="bg-panel border border-border rounded-xl2 shadow-aura">
          <TabsTrigger value="user" className="rounded-xl data-[state=active]:bg-brand data-[state=active]:text-brand-contrast">
            <Users className="h-4 w-4 mr-2" />
            User Guides
          </TabsTrigger>
          <TabsTrigger value="api" className="rounded-xl data-[state=active]:bg-brand data-[state=active]:text-brand-contrast">
            <Code className="h-4 w-4 mr-2" />
            API Docs
          </TabsTrigger>
          <TabsTrigger value="admin" className="rounded-xl data-[state=active]:bg-brand data-[state=active]:text-brand-contrast">
            <Settings className="h-4 w-4 mr-2" />
            Admin Guides
          </TabsTrigger>
          <TabsTrigger value="developer" className="rounded-xl data-[state=active]:bg-brand data-[state=active]:text-brand-contrast">
            <Database className="h-4 w-4 mr-2" />
            Developer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="user" className="space-y-4">
          {renderSectionsByCategory('user')}
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          {renderSectionsByCategory('api')}
        </TabsContent>

        <TabsContent value="admin" className="space-y-4">
          {renderSectionsByCategory('admin')}
        </TabsContent>

        <TabsContent value="developer" className="space-y-4">
          {renderSectionsByCategory('developer')}
        </TabsContent>
      </Tabs>
    </div>
  );
}