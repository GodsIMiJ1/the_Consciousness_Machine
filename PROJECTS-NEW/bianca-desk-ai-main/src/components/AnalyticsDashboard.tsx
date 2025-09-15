import { useState, useEffect } from 'react';
import { BarChart, LineChart, PieChart, TrendingUp, Users, AlertTriangle, Clock, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  ticketsCreated: number;
  avgResponseTime: number;
  errorRate: number;
  uptime: number;
}

interface UsageMetric {
  timestamp: string;
  value: number;
  category: string;
}

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalUsers: 156,
    activeUsers: 42,
    ticketsCreated: 89,
    avgResponseTime: 245,
    errorRate: 0.12,
    uptime: 99.9
  });

  const [usageMetrics] = useState<UsageMetric[]>([
    { timestamp: '2025-01-01', value: 120, category: 'page_views' },
    { timestamp: '2025-01-02', value: 145, category: 'page_views' },
    { timestamp: '2025-01-03', value: 178, category: 'page_views' },
    { timestamp: '2025-01-04', value: 134, category: 'page_views' },
    { timestamp: '2025-01-05', value: 198, category: 'page_views' },
    { timestamp: '2025-01-06', value: 167, category: 'page_views' },
    { timestamp: '2025-01-07', value: 223, category: 'page_views' },
  ]);

  const errorMetrics = [
    { type: '4xx Errors', count: 23, percentage: 0.08 },
    { type: '5xx Errors', count: 12, percentage: 0.04 },
    { type: 'Timeouts', count: 5, percentage: 0.02 },
    { type: 'Network Errors', count: 8, percentage: 0.03 },
  ];

  const userActivityMetrics = [
    { action: 'Login', count: 342, trend: '+12%' },
    { action: 'Ticket Created', count: 89, trend: '+5%' },
    { action: 'Search Query', count: 567, trend: '+18%' },
    { action: 'Settings Updated', count: 34, trend: '-3%' },
  ];

  const performanceMetrics = [
    { metric: 'Average Load Time', value: '1.2s', status: 'good' },
    { metric: 'Time to Interactive', value: '2.1s', status: 'good' },
    { metric: 'Largest Contentful Paint', value: '1.8s', status: 'good' },
    { metric: 'Cumulative Layout Shift', value: '0.05', status: 'excellent' },
  ];

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setAnalyticsData(prev => ({
        ...prev,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 5) - 2,
        avgResponseTime: prev.avgResponseTime + Math.floor(Math.random() * 20) - 10,
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'good':
        return 'bg-brand/10 text-brand border-brand/20';
      case 'warning':
        return 'bg-warn/10 text-warn border-warn/20';
      case 'poor':
        return 'bg-error/10 text-error border-error/20';
      default:
        return 'bg-bg-muted text-text-muted border-border';
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend.startsWith('+')) {
      return <TrendingUp className="h-3 w-3 text-accent" />;
    } else if (trend.startsWith('-')) {
      return <TrendingUp className="h-3 w-3 text-error rotate-180" />;
    }
    return null;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text flex items-center gap-2">
            <Activity className="h-8 w-8" />
            Analytics & Monitoring
          </h1>
          <p className="text-text-muted mt-1">
            Real-time performance metrics, usage analytics, and error tracking
          </p>
        </div>
        
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32 bg-bg border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1d">Last 24h</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 3 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="aura-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Total Users</p>
                <p className="text-2xl font-bold text-text">{analyticsData.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-text-muted" />
            </div>
          </CardContent>
        </Card>

        <Card className="aura-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Active Users</p>
                <p className="text-2xl font-bold text-accent">{analyticsData.activeUsers}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-accent animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="aura-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Tickets Created</p>
                <p className="text-2xl font-bold text-text">{analyticsData.ticketsCreated}</p>
              </div>
              <BarChart className="h-8 w-8 text-text-muted" />
            </div>
          </CardContent>
        </Card>

        <Card className="aura-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Avg Response</p>
                <p className="text-2xl font-bold text-text">{analyticsData.avgResponseTime}ms</p>
              </div>
              <Clock className="h-8 w-8 text-text-muted" />
            </div>
          </CardContent>
        </Card>

        <Card className="aura-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Error Rate</p>
                <p className="text-2xl font-bold text-error">{analyticsData.errorRate}%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-error" />
            </div>
          </CardContent>
        </Card>

        <Card className="aura-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Uptime</p>
                <p className="text-2xl font-bold text-accent">{analyticsData.uptime}%</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                <span className="text-xs font-bold text-accent">UP</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="usage" className="space-y-6">
        <TabsList className="bg-panel border border-border rounded-xl2 shadow-aura">
          <TabsTrigger value="usage" className="rounded-xl data-[state=active]:bg-brand data-[state=active]:text-brand-contrast">
            <BarChart className="h-4 w-4 mr-2" />
            Usage
          </TabsTrigger>
          <TabsTrigger value="performance" className="rounded-xl data-[state=active]:bg-brand data-[state=active]:text-brand-contrast">
            <TrendingUp className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="errors" className="rounded-xl data-[state=active]:bg-brand data-[state=active]:text-brand-contrast">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Errors
          </TabsTrigger>
          <TabsTrigger value="users" className="rounded-xl data-[state=active]:bg-brand data-[state=active]:text-brand-contrast">
            <Users className="h-4 w-4 mr-2" />
            User Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-6">
          <Card className="aura-card">
            <CardHeader>
              <CardTitle className="text-text">Usage Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center space-y-2">
                  <LineChart className="h-12 w-12 text-text-muted mx-auto" />
                  <p className="text-text-muted">Usage chart visualization</p>
                  <p className="text-sm text-text-muted">Page views over time: {usageMetrics.length} data points</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="aura-card">
              <CardHeader>
                <CardTitle className="text-text">Core Web Vitals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {performanceMetrics.map((metric) => (
                  <div key={metric.metric} className="flex items-center justify-between">
                    <span className="text-sm text-text">{metric.metric}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text">{metric.value}</span>
                      <Badge className={getStatusColor(metric.status)}>
                        {metric.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="aura-card">
              <CardHeader>
                <CardTitle className="text-text">Response Times</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <TrendingUp className="h-8 w-8 text-text-muted mx-auto" />
                    <p className="text-text-muted">Response time chart</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="errors" className="space-y-6">
          <Card className="aura-card">
            <CardHeader>
              <CardTitle className="text-text">Error Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {errorMetrics.map((error) => (
                <div key={error.type} className="flex items-center justify-between p-3 rounded-lg bg-bg-muted/50">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-error" />
                    <span className="text-sm text-text">{error.type}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-text">{error.count}</span>
                    <Badge className="bg-error/10 text-error border-error/20">
                      {error.percentage}%
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card className="aura-card">
            <CardHeader>
              <CardTitle className="text-text">User Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userActivityMetrics.map((activity) => (
                <div key={activity.action} className="flex items-center justify-between p-3 rounded-lg bg-bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-text-muted" />
                    <span className="text-sm text-text">{activity.action}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-text">{activity.count}</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(activity.trend)}
                      <span className={`text-xs ${activity.trend.startsWith('+') ? 'text-accent' : 'text-error'}`}>
                        {activity.trend}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}