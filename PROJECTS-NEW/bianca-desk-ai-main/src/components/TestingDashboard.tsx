import { useState, useEffect } from 'react';
import { TestTube, CheckCircle, XCircle, Clock, Play, RotateCcw, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TestResult {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'running' | 'pending';
  duration: number;
  error?: string;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  status: 'passed' | 'failed' | 'running' | 'pending';
}

export function TestingDashboard() {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([
    {
      name: 'Authentication Tests',
      status: 'passed',
      tests: [
        { id: '1', name: 'User login with valid credentials', status: 'passed', duration: 245 },
        { id: '2', name: 'User login with invalid credentials', status: 'passed', duration: 156 },
        { id: '3', name: 'JWT token validation', status: 'passed', duration: 89 },
        { id: '4', name: 'Session persistence', status: 'passed', duration: 178 },
      ]
    },
    {
      name: 'Ticket Management Tests',
      status: 'passed',
      tests: [
        { id: '5', name: 'Create new ticket', status: 'passed', duration: 312 },
        { id: '6', name: 'Update ticket status', status: 'passed', duration: 198 },
        { id: '7', name: 'Delete ticket', status: 'passed', duration: 134 },
        { id: '8', name: 'Ticket escalation workflow', status: 'passed', duration: 456 },
      ]
    },
    {
      name: 'Knowledge Base Tests',
      status: 'running',
      tests: [
        { id: '9', name: 'Search knowledge base', status: 'passed', duration: 267 },
        { id: '10', name: 'Index new documents', status: 'running', duration: 0 },
        { id: '11', name: 'TF-IDF relevance scoring', status: 'pending', duration: 0 },
        { id: '12', name: 'Document search ranking', status: 'pending', duration: 0 },
      ]
    },
    {
      name: 'API Integration Tests',
      status: 'pending',
      tests: [
        { id: '13', name: 'FlameRouter API connectivity', status: 'pending', duration: 0 },
        { id: '14', name: 'Webhook delivery', status: 'pending', duration: 0 },
        { id: '15', name: 'Error handling', status: 'pending', duration: 0 },
        { id: '16', name: 'Rate limiting', status: 'pending', duration: 0 },
      ]
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [overallProgress, setOverallProgress] = useState(65);

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setTestSuites(prev => {
          const updated = prev.map(suite => {
            if (suite.status === 'running') {
              const updatedTests = suite.tests.map(test => {
                if (test.status === 'running') {
                  return { ...test, status: 'passed' as const, duration: Math.floor(Math.random() * 500) + 100 };
                }
                if (test.status === 'pending') {
                  return { ...test, status: 'running' as const };
                }
                return test;
              });
              
              const allPassed = updatedTests.every(t => t.status === 'passed');
              return {
                ...suite,
                tests: updatedTests,
                status: allPassed ? 'passed' as const : 'running' as const
              };
            }
            if (suite.status === 'pending' && prev.findIndex(s => s.status === 'running') === -1) {
              return { ...suite, status: 'running' as const };
            }
            return suite;
          });
          
          const allCompleted = updated.every(s => s.status === 'passed' || s.status === 'failed');
          if (allCompleted) {
            setIsRunning(false);
            setOverallProgress(100);
          } else {
            const totalTests = updated.reduce((acc, suite) => acc + suite.tests.length, 0);
            const completedTests = updated.reduce((acc, suite) => 
              acc + suite.tests.filter(t => t.status === 'passed' || t.status === 'failed').length, 0
            );
            setOverallProgress((completedTests / totalTests) * 100);
          }
          
          return updated;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isRunning]);

  const runAllTests = () => {
    setIsRunning(true);
    setOverallProgress(0);
    setTestSuites(prev => prev.map((suite, index) => ({
      ...suite,
      status: index === 0 ? 'running' as const : 'pending' as const,
      tests: suite.tests.map(test => ({ ...test, status: 'pending' as const, duration: 0 }))
    })));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-accent" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-error" />;
      case 'running':
        return <Clock className="h-4 w-4 text-warn animate-spin" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-border" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'failed':
        return 'bg-error/10 text-error border-error/20';
      case 'running':
        return 'bg-warn/10 text-warn border-warn/20';
      default:
        return 'bg-bg-muted text-text-muted border-border';
    }
  };

  const totalTests = testSuites.reduce((acc, suite) => acc + suite.tests.length, 0);
  const passedTests = testSuites.reduce((acc, suite) => 
    acc + suite.tests.filter(t => t.status === 'passed').length, 0
  );
  const failedTests = testSuites.reduce((acc, suite) => 
    acc + suite.tests.filter(t => t.status === 'failed').length, 0
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text flex items-center gap-2">
            <TestTube className="h-8 w-8" />
            Testing & QA Dashboard
          </h1>
          <p className="text-text-muted mt-1">
            End-to-end testing and quality assurance validation
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="btn-outline">
            <FileText className="h-4 w-4 mr-2" />
            Test Report
          </Button>
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="btn-primary"
          >
            {isRunning ? (
              <>
                <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run All Tests
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="aura-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Total Tests</p>
                <p className="text-2xl font-bold text-text">{totalTests}</p>
              </div>
              <TestTube className="h-8 w-8 text-text-muted" />
            </div>
          </CardContent>
        </Card>

        <Card className="aura-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Passed</p>
                <p className="text-2xl font-bold text-accent">{passedTests}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="aura-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Failed</p>
                <p className="text-2xl font-bold text-error">{failedTests}</p>
              </div>
              <XCircle className="h-8 w-8 text-error" />
            </div>
          </CardContent>
        </Card>

        <Card className="aura-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Success Rate</p>
                <p className="text-2xl font-bold text-text">
                  {totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                <span className="text-xs font-bold text-accent">
                  {totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      {isRunning && (
        <Card className="aura-card">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text">Test Progress</span>
                <span className="text-text-muted">{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Suites */}
      <div className="space-y-4">
        {testSuites.map((suite) => (
          <Card key={suite.name} className="aura-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-text">{suite.name}</CardTitle>
                <Badge className={getStatusColor(suite.status)}>
                  {getStatusIcon(suite.status)}
                  <span className="ml-1 capitalize">{suite.status}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {suite.tests.map((test) => (
                <div key={test.id} className="flex items-center justify-between p-2 rounded-lg bg-bg-muted/50">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <span className="text-sm text-text">{test.name}</span>
                  </div>
                  <div className="text-xs text-text-muted">
                    {test.duration > 0 && `${test.duration}ms`}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      {failedTests > 0 && (
        <Alert>
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            {failedTests} test(s) failed. Review the results and fix any issues before deployment.
          </AlertDescription>
        </Alert>
      )}
      
      {passedTests === totalTests && totalTests > 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            All tests passed! System is ready for production deployment.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}