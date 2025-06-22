
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Eye, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface AuditLogEntry {
  id: string;
  user_id: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  old_values: any;
  new_values: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface SecurityMetrics {
  failedLogins: number;
  suspiciousActivities: number;
  recentAudits: number;
  activeUsers: number;
}

export const SecurityMonitoring: React.FC = () => {
  const { hasRole, isLoading: rolesLoading } = useUserRoles();
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    failedLogins: 0,
    suspiciousActivities: 0,
    recentAudits: 0,
    activeUsers: 0
  });

  // Fetch audit logs (admin only)
  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as AuditLogEntry[];
    },
    enabled: hasRole('admin'),
  });

  // Calculate security metrics
  useEffect(() => {
    if (auditLogs) {
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const recentLogs = auditLogs.filter(log => 
        new Date(log.created_at) > last24Hours
      );

      setMetrics({
        failedLogins: recentLogs.filter(log => 
          log.action === 'FAILED_LOGIN'
        ).length,
        suspiciousActivities: recentLogs.filter(log => 
          log.action.includes('SUSPICIOUS') || 
          log.action === 'MASS_DELETE' || 
          log.action === 'PRIVILEGE_ESCALATION'
        ).length,
        recentAudits: recentLogs.length,
        activeUsers: new Set(recentLogs.map(log => log.user_id)).size
      });
    }
  }, [auditLogs]);

  if (rolesLoading) {
    return <div>Loading security dashboard...</div>;
  }

  if (!hasRole('admin')) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Access denied. Administrator privileges required.
        </AlertDescription>
      </Alert>
    );
  }

  const getActionBadgeColor = (action: string) => {
    if (action.includes('DELETE') || action.includes('FAILED')) return 'destructive';
    if (action.includes('UPDATE') || action.includes('MODIFY')) return 'warning';
    if (action.includes('CREATE') || action.includes('INSERT')) return 'success';
    return 'secondary';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Security Monitoring</h2>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Failed Logins (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {metrics.failedLogins}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4 text-orange-500" />
              Suspicious Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {metrics.suspiciousActivities}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              Recent Audits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metrics.recentAudits}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              Active Users (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics.activeUsers}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Audit Logs</CardTitle>
          <CardDescription>
            Latest security-relevant activities across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading audit logs...</div>
          ) : auditLogs && auditLogs.length > 0 ? (
            <div className="space-y-3">
              {auditLogs.slice(0, 20).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={getActionBadgeColor(log.action) as any}>
                      {log.action}
                    </Badge>
                    <div>
                      <div className="font-medium">{log.table_name}</div>
                      <div className="text-sm text-gray-500">
                        {log.user_id ? `User: ${log.user_id.slice(0, 8)}...` : 'System'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">
                      {format(new Date(log.created_at), 'MMM dd, HH:mm')}
                    </div>
                    {log.ip_address && (
                      <div className="text-xs text-gray-500">
                        IP: {log.ip_address}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No audit logs found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
