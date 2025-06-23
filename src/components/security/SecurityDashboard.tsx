
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Eye, Lock, CheckCircle } from 'lucide-react';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { useUserRoles } from '@/hooks/useUserRoles';

export const SecurityDashboard = () => {
  const { securityEvents, isLoading } = useSecurityMonitoring();
  const { isAdmin } = useUserRoles();

  console.log('SecurityDashboard loaded:', { eventsCount: securityEvents.length, isAdmin, isLoading });

  if (!isAdmin) {
    return (
      <div className="text-center py-6">
        <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">Security monitoring available for admin users</p>
      </div>
    );
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'MULTIPLE_FAILED_LOGINS':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'RATE_LIMIT_EXCEEDED':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'FAILED_LOGIN':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'SUCCESSFUL_LOGIN':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Eye className="h-4 w-4 text-blue-500" />;
    }
  };

  const getEventSeverity = (eventType: string) => {
    switch (eventType) {
      case 'MULTIPLE_FAILED_LOGINS':
        return 'destructive';
      case 'RATE_LIMIT_EXCEEDED':
        return 'secondary';
      case 'FAILED_LOGIN':
        return 'secondary';
      case 'SUCCESSFUL_LOGIN':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const criticalEvents = securityEvents.filter(e => e.event_type === 'MULTIPLE_FAILED_LOGINS');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{securityEvents.length}</div>
            <p className="text-xs text-muted-foreground">Total events recorded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-red-600">
              {criticalEvents.length}
            </div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">Secure</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recent Security Events</CardTitle>
          <CardDescription>Monitor and review security-related activities</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4 text-sm text-gray-500">Loading security events...</div>
          ) : securityEvents.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Shield className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No security events recorded</p>
              <p className="text-xs text-gray-400">System is secure and monitoring</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {securityEvents.slice(0, 5).map((event, index) => (
                <div key={event.id || index} className="flex items-center justify-between p-2 border rounded text-sm">
                  <div className="flex items-center gap-2">
                    {getEventIcon(event.event_type || 'DEFAULT')}
                    <div>
                      <p className="font-medium text-xs">{event.description || 'Security event detected'}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(event.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getEventSeverity(event.event_type || 'DEFAULT') as any} className="text-xs">
                    {(event.event_type || 'EVENT').replace(/_/g, ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
