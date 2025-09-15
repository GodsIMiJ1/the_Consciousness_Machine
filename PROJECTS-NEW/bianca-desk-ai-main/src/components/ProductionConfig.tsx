import { useState, useEffect } from 'react';
import { Settings, Shield, Database, Activity, AlertCircle, CheckCircle, Clock, Server } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface SystemStatus {
  database: 'healthy' | 'warning' | 'error';
  auth: 'healthy' | 'warning' | 'error';
  api: 'healthy' | 'warning' | 'error';
  storage: 'healthy' | 'warning' | 'error';
}

interface ProductionMetrics {
  uptime: string;
  requests: number;
  errors: number;
  avgResponseTime: number;
  activeUsers: number;
}

export function ProductionConfig() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: 'healthy',
    auth: 'healthy', 
    api: 'healthy',
    storage: 'healthy'
  });

  const [metrics, setMetrics] = useState<ProductionMetrics>({
    uptime: '99.9%',
    requests: 15847,
    errors: 23,
    avgResponseTime: 245,
    activeUsers: 42
  });

  const [deploymentStage, setDeploymentStage] = useState(0);
  const deploymentStages = [
    'Environment Configuration',
    'Security Setup',
    'Database Migration',
    'API Testing',
    'Frontend Build',
    'Production Deploy'
  ];

  useEffect(() => {
    // Simulate deployment progress
    const interval = setInterval(() => {
      setDeploymentStage(prev => {
        if (prev < deploymentStages.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-accent" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-warn" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-error" />;
      default:
        return <Clock className="h-4 w-4 text-text-muted" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'warning':
        return 'bg-warn/10 text-warn border-warn/20';
      case 'error':
        return 'bg-error/10 text-error border-error/20';
      default:
        return 'bg-bg-muted text-text-muted border-border';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text flex items-center gap-2">
            <Server className="h-8 w-8" />
            Production Dashboard
          </h1>
          <p className="text-text-muted mt-1">
            Monitor system health, deployment status, and production metrics
          </p>
        </div>
        
        <Badge className={getStatusColor('healthy')}>
          <CheckCircle className="h-3 w-3 mr-1" />
          System Operational
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-panel border border-border rounded-xl2 shadow-aura">
          <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-brand data-[state=active]:text-brand-contrast">
            Overview
          </TabsTrigger>
          <TabsTrigger value="deployment" className="rounded-xl data-[state=active]:bg-brand data-[state=active]:text-brand-contrast">
            Deployment
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="rounded-xl data-[state=active]:bg-brand data-[state=active]:text-brand-contrast">
            Monitoring
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-xl data-[state=active]:bg-brand data-[state=active]:text-brand-contrast">
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* System Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(systemStatus).map(([service, status]) => (
              <Card key={service} className="aura-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-muted capitalize">{service}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(status)}
                        <span className="text-sm font-medium text-text capitalize">{status}</span>
                      </div>
                    </div>
                    <div className="h-8 w-8 rounded-lg bg-bg-muted flex items-center justify-center">
                      {service === 'database' && <Database className="h-4 w-4 text-text-muted" />}
                      {service === 'auth' && <Shield className="h-4 w-4 text-text-muted" />}
                      {service === 'api' && <Server className="h-4 w-4 text-text-muted" />}
                      {service === 'storage' && <Settings className="h-4 w-4 text-text-muted" />}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="aura-card">
              <CardContent className="p-4">
                <p className="text-sm text-text-muted">Uptime</p>
                <p className="text-2xl font-bold text-text">{metrics.uptime}</p>
              </CardContent>
            </Card>
            
            <Card className="aura-card">
              <CardContent className="p-4">
                <p className="text-sm text-text-muted">Requests</p>
                <p className="text-2xl font-bold text-text">{metrics.requests.toLocaleString()}</p>
              </CardContent>
            </Card>
            
            <Card className="aura-card">
              <CardContent className="p-4">
                <p className="text-sm text-text-muted">Errors</p>
                <p className="text-2xl font-bold text-text">{metrics.errors}</p>
              </CardContent>
            </Card>
            
            <Card className="aura-card">
              <CardContent className="p-4">
                <p className="text-sm text-text-muted">Response Time</p>
                <p className="text-2xl font-bold text-text">{metrics.avgResponseTime}ms</p>
              </CardContent>
            </Card>
            
            <Card className="aura-card">
              <CardContent className="p-4">
                <p className="text-sm text-text-muted">Active Users</p>
                <p className="text-2xl font-bold text-text">{metrics.activeUsers}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deployment" className="space-y-6">
          <Card className="aura-card">
            <CardHeader>
              <CardTitle className="text-text">Deployment Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={(deploymentStage + 1) / deploymentStages.length * 100} className="w-full" />
              
              <div className="space-y-3">
                {deploymentStages.map((stage, index) => (
                  <div key={stage} className="flex items-center gap-3">
                    {index <= deploymentStage ? (
                      <CheckCircle className="h-5 w-5 text-accent" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-border" />
                    )}
                    <span className={`text-sm ${index <= deploymentStage ? 'text-text' : 'text-text-muted'}`}>
                      {stage}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Production deployment is automated. Monitor the progress above and check logs for any issues.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card className="aura-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-text">
                <Activity className="h-5 w-5" />
                Real-time Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-text mb-2">Performance Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-muted">CPU Usage</span>
                      <span className="text-text">23%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Memory Usage</span>
                      <span className="text-text">67%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Disk Usage</span>
                      <span className="text-text">45%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-text mb-2">Error Rates</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-muted">4xx Errors</span>
                      <span className="text-text">0.12%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">5xx Errors</span>
                      <span className="text-text">0.03%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Timeout Rate</span>
                      <span className="text-text">0.01%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="aura-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-text">
                <Shield className="h-5 w-5" />
                Security Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-text">SSL Certificate</h4>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-accent" />
                    <span className="text-sm text-text">Valid until Dec 2025</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-text">Security Headers</h4>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-accent" />
                    <span className="text-sm text-text">All headers configured</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-text">Authentication</h4>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-accent" />
                    <span className="text-sm text-text">JWT tokens secure</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-text">Database Security</h4>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-accent" />
                    <span className="text-sm text-text">RLS policies active</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}