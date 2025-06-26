
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertTriangle, Activity, Eye, Lock, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { format } from 'date-fns';
import { toast } from 'sonner';

export const EnhancedSecurityDashboard: React.FC = () => {
  const { securityEvents, isLoading, fetchSecurityEvents } = useSecurityMonitoring();
  const [activeThreats, setActiveThreats] = useState(0);
  const [securityScore, setSecurityScore] = useState(85);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);

  useEffect(() => {
    fetchSecurityEvents();
    calculateSecurityMetrics();
  }, []);

  const calculateSecurityMetrics = () => {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentEvents = securityEvents.filter(event => 
      new Date(event.created_at) > last24h
    );
    
    const highSeverityEvents = recentEvents.filter(event => 
      event.new_values && 
      typeof event.new_values === 'object' && 
      'severity' in event.new_values &&
      event.new_values.severity === 'high'
    );
    
    setActiveThreats(highSeverityEvents.length);
    setRecentAlerts(recentEvents.slice(0, 5));
    
    // Calculate security score based on recent activity
    let score = 100;
    score -= highSeverityEvents.length * 10;
    score -= recentEvents.length * 2;
    setSecurityScore(Math.max(score, 0));
  };

  const getEventSeverityColor = (event: any) => {
    const severity = event.new_values?.severity || 'low';
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'UNAUTHORIZED_ACCESS':
      case 'BUSINESS_ACCESS_DENIED':
        return <Lock className="w-4 h-4" />;
      case 'HIGH_VALUE_PAYMENT':
      case 'HIGH_PAYMENT_FREQUENCY':
        return <AlertTriangle className="w-4 h-4" />;
      case 'RATE_LIMIT_EXCEEDED':
        return <Clock className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const refreshSecurityData = () => {
    fetchSecurityEvents();
    calculateSecurityMetrics();
    toast.success('Security data refreshed');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Security Score</p>
                <p className="text-2xl font-bold text-green-600">{securityScore}%</p>
              </div>
              <Shield className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Threats</p>
                <p className="text-2xl font-bold text-red-600">{activeThreats}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Events (24h)</p>
                <p className="text-2xl font-bold">{recentAlerts.length}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monitoring</p>
                <p className="text-sm font-bold text-green-600">Active</p>
              </div>
              <Eye className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Tabs */}
      <Tabs defaultValue="events" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="events">Security Events</TabsTrigger>
            <TabsTrigger value="alerts">Recent Alerts</TabsTrigger>
            <TabsTrigger value="settings">Security Settings</TabsTrigger>
          </TabsList>
          
          <Button onClick={refreshSecurityData} variant="outline" size="sm">
            <Activity className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Security Events Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityEvents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No security events recorded</p>
                  </div>
                ) : (
                  securityEvents.slice(0, 10).map((event) => (
                    <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="mt-1">
                        {getEventIcon(event.table_name)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{event.table_name}</span>
                          <Badge variant={getEventSeverityColor(event)}>
                            {event.new_values?.severity || 'low'}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          {event.description || 'Security event detected'}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{format(new Date(event.created_at), 'MMM dd, HH:mm')}</span>
                          {event.new_values?.business_id && (
                            <span>Business: {event.new_values.business_id.slice(0, 8)}...</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAlerts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-300" />
                    <p>No recent alerts - all systems secure</p>
                  </div>
                ) : (
                  recentAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-center gap-3 p-3 border rounded-lg bg-orange-50">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{alert.table_name}</p>
                        <p className="text-sm text-gray-600">
                          {alert.description || 'Security alert triggered'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(alert.created_at), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Security Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Enhanced Monitoring</p>
                    <p className="text-sm text-gray-600">Real-time security event tracking</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Rate Limiting</p>
                    <p className="text-sm text-gray-600">Protection against abuse</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Access Control</p>
                    <p className="text-sm text-gray-600">Business ownership validation</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Payment Security</p>
                    <p className="text-sm text-gray-600">Transaction monitoring and validation</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
