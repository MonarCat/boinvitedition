
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, MapPin, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface AdminAlert {
  id: string;
  business_id: string;
  alert_type: string;
  message: string;
  metadata: any;
  is_read: boolean;
  created_at: string;
}

export const AdminAlerts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: business } = useQuery({
    queryKey: ['user-business', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('businesses')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['admin-alerts', business?.id],
    queryFn: async () => {
      if (!business) return [];
      
      const { data, error } = await supabase
        .from('admin_alerts')
        .select('*')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as AdminAlert[];
    },
    enabled: !!business,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('admin_alerts')
        .update({ is_read: true })
        .eq('id', alertId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-alerts'] });
      toast.success('Alert marked as read');
    },
    onError: () => {
      toast.error('Failed to mark alert as read');
    },
  });

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'OUTSIDE_HOURS_SIGNIN':
        return <Clock className="h-4 w-4" />;
      case 'DUPLICATE_SIGNIN':
        return <AlertTriangle className="h-4 w-4" />;
      case 'SUSPICIOUS_LOCATION':
        return <MapPin className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getAlertColor = (alertType: string) => {
    switch (alertType) {
      case 'OUTSIDE_HOURS_SIGNIN':
        return 'bg-yellow-100 text-yellow-800';
      case 'DUPLICATE_SIGNIN':
        return 'bg-red-100 text-red-800';
      case 'SUSPICIOUS_LOCATION':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div>Loading alerts...</div>
        </CardContent>
      </Card>
    );
  }

  const unreadCount = alerts?.filter(alert => !alert.is_read).length || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Security Alerts
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} new</Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {!alerts || alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No security alerts</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${
                  alert.is_read ? 'bg-gray-50' : 'bg-white border-orange-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${getAlertColor(alert.alert_type)}`}>
                      {getAlertIcon(alert.alert_type)}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className={`font-medium ${alert.is_read ? 'text-gray-600' : 'text-gray-900'}`}>
                        {alert.message}
                      </h4>
                      
                      <p className="text-sm text-gray-500 mt-1">
                        {format(new Date(alert.created_at), 'PPp')}
                      </p>
                      
                      {alert.metadata && (
                        <div className="mt-2 text-xs text-gray-600">
                          {alert.alert_type === 'OUTSIDE_HOURS_SIGNIN' && alert.metadata.business_hours && (
                            <p>
                              Business hours: {alert.metadata.business_hours.start} - {alert.metadata.business_hours.end}
                            </p>
                          )}
                          {alert.metadata.staff_id && (
                            <p>Staff ID: {alert.metadata.staff_id}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {!alert.is_read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markAsReadMutation.mutate(alert.id)}
                      disabled={markAsReadMutation.isPending}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
