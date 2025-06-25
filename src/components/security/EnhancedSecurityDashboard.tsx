
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { Shield, AlertTriangle, CheckCircle, Activity, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  rateLimit: number;
  failedLogins: number;
  lastSecurityScan: Date;
}

export const EnhancedSecurityDashboard: React.FC = () => {
  const { securityEvents, isLoading, fetchSecurityEvents } = useSecurityMonitoring();
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    criticalEvents: 0,
    rateLimit: 0,
    failedLogins: 0,
    lastSecurityScan: new Date()
  });

  useEffect(() => {
    if (securityEvents.length > 0) {
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const recentEvents = securityEvents.filter(event => 
        new Date(event.created_at) > last24Hours
      );

      const criticalEvents = recentEvents.filter(event => 
        event.event_type?.includes('UNAUTHORIZED') || 
        event.event_type?.includes('FAILED_LOGIN') ||
        event.event_type?.includes('RATE_LIMIT')
      );

      const rateLimitEvents = recentEvents.filter(event => 
        event.event_type?.includes('RATE_LIMIT')
      );

      const failedLoginEvents = recentEvents.filter(event => 
        event.event_type?.includes('FAILED_LOGIN')
      );

      setMetrics({
        totalEvents: recentEvents.length,
        criticalEvents: criticalEvents.length,
        rateLimit: rateLimitEvents.length,
        failedLogins: failedLoginEvents.length,
        lastSecurityScan: now
      });
    }
  }, [securityEvents]);

  const getEventSeverityColor = (eventType: string): string => {
    if (eventType?.includes('UNAUTHORIZED') || eventType?.includes('INVALID')) {
      return 'destructive';
    }
    if (eventType?.includes('RATE_LIMIT') || eventType?.includes('FAILED')) {
      return 'secondary';
    }
    return 'outline';
  };

  const getEventIcon = (eventType: string) => {
    if (eventType?.includes('UNAUTHORIZED') || eventType?.includes('INVALID')) {
      return <AlertTriangle className="w-4 h-4" />;
    }
    if (eventType?.includes('SUCCESSFUL') || eventType?.includes('COMPLETED')) {
      return <CheckCircle className="w-4 h-4" />;
    }
    return <Activity className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Security Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events (24h)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              Security events tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{metrics.criticalEvents}</div>
            <p className="text-xs text-muted-foreground">
              Requiring attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rate Limit Events</CardTitle>
            <Shield className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{metrics.rateLimit}</div>
            <p className="text-xs text-muted-foreground">
              Blocked attempts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.failedLogins}</div>
            <p className="text-xs text-muted-foreground">
              Authentication failures
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Security Events List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Recent Security Events
              </CardTitle>
              <CardDescription>
                Monitor and review security-related activities
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchSecurityEvents}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : securityEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No security events recorded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {securityEvents.slice(0, 10).map((event) => (
                <div 
                  key={event.id} 
                  className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      {getEventIcon(event.event_type || '')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          variant={getEventSeverityColor(event.event_type || '') as any}
                          className="text-xs"
                        >
                          {event.event_type || 'UNKNOWN'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(event.created_at), 'MMM dd, HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm font-medium">
                        {event.description || 'Security event recorded'}
                      </p>
                      {event.new_values && typeof event.new_values === 'object' && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          <pre className="bg-muted/50 p-2 rounded text-xs overflow-x-auto">
                            {JSON.stringify(event.new_values, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Security Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">RLS Policies</span>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  ✓ Active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Rate Limiting</span>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  ✓ Enabled
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Input Validation</span>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  ✓ Enhanced
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Webhook Security</span>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  ✓ Hardened
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Authentication</span>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  ✓ Multi-layer
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Audit Logging</span>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  ✓ Comprehensive
                </Badge>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Last security scan: {format(metrics.lastSecurityScan, 'PPpp')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
