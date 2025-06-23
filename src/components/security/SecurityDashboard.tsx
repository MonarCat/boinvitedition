
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Eye, Lock } from 'lucide-react';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { useUserRoles } from '@/hooks/useUserRoles';

export const SecurityDashboard = () => {
  const { securityEvents, isLoading } = useSecurityMonitoring();
  const { isAdmin } = useUserRoles();

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Access denied. Admin privileges required.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'MULTIPLE_FAILED_LOGINS':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'RATE_LIMIT_EXCEEDED':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
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
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Security Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityEvents.length}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {securityEvents.filter(e => e.event_type === 'MULTIPLE_FAILED_LOGINS').length}
            </div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Secure</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
          <CardDescription>Monitor and review security-related activities</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading security events...</div>
          ) : securityEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No security events recorded
            </div>
          ) : (
            <div className="space-y-3">
              {securityEvents.slice(0, 10).map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getEventIcon(event.event_type)}
                    <div>
                      <p className="font-medium">{event.description}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(event.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getEventSeverity(event.event_type) as any}>
                    {event.event_type.replace(/_/g, ' ')}
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
