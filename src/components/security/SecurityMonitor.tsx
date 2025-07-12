import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Activity, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SecurityEvent {
  id: string;
  action: string;
  table_name: string;
  old_values: any;
  new_values: any;
  created_at: string;
  ip_address?: string;
}

export const SecurityMonitor: React.FC = () => {
  const { user } = useAuth();
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });
      setIsAdmin(data || false);
      
      if (data) {
        loadSecurityEvents();
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const loadSecurityEvents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .or('action.like.%SECURITY%,action.like.%UNAUTHORIZED%,action.like.%ADMIN%')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading security events:', error);
        toast.error('Failed to load security events');
      } else {
        setSecurityEvents(data || []);
      }
    } catch (error) {
      console.error('Exception loading security events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (action: string): string => {
    if (action.includes('UNAUTHORIZED') || action.includes('VIOLATION')) {
      return 'destructive';
    } else if (action.includes('ADMIN') || action.includes('ROLE')) {
      return 'default';
    } else {
      return 'secondary';
    }
  };

  const formatEventDescription = (event: SecurityEvent): string => {
    const description = event.old_values?.description || 'Security event occurred';
    return description.length > 100 ? `${description.substring(0, 100)}...` : description;
  };

  if (!isAdmin) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Security monitoring requires admin privileges</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Security Monitor
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={loadSecurityEvents}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : securityEvents.length === 0 ? (
          <div className="flex items-center gap-2 text-muted-foreground p-6">
            <Shield className="w-4 h-4" />
            <span>No recent security events</span>
          </div>
        ) : (
          <div className="space-y-3">
            {securityEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 p-3 border rounded-lg bg-muted/50"
              >
                <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getSeverityColor(event.action) as any}>
                      {event.action.replace(/_/g, ' ')}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground mb-1">
                    {formatEventDescription(event)}
                  </p>
                  {event.ip_address && (
                    <p className="text-xs text-muted-foreground">
                      IP: {event.ip_address}
                    </p>
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