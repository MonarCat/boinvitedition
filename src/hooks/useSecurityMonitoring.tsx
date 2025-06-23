
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SecurityEvent {
  id: string;
  action: string;
  table_name: string;
  record_id: string | null;
  old_values: any;
  new_values: any;
  user_id: string;
  created_at: string;
  event_type?: string;
  description?: string;
}

export const useSecurityMonitoring = () => {
  const { user } = useAuth();
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const logSecurityEvent = async (
    eventType: string,
    description: string,
    metadata: Record<string, any> = {}
  ) => {
    try {
      // Use direct insert instead of RPC since the function might not be in types yet
      const { error } = await supabase
        .from('audit_log')
        .insert({
          action: 'SECURITY_EVENT',
          table_name: eventType,
          old_values: { description },
          new_values: metadata,
          user_id: user?.id
        });
      
      if (error) {
        console.error('Failed to log security event:', error);
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  const fetchSecurityEvents = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .eq('action', 'SECURITY_EVENT')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Transform the data to match SecurityEvent interface
      const transformedEvents: SecurityEvent[] = (data || []).map(item => ({
        id: item.id,
        action: item.action,
        table_name: item.table_name || 'security',
        record_id: item.record_id,
        old_values: item.old_values,
        new_values: item.new_values,
        user_id: item.user_id,
        created_at: item.created_at,
        event_type: item.table_name, // Map table_name to event_type
        description: item.old_values?.description // Extract description from old_values
      }));
      
      setSecurityEvents(transformedEvents);
    } catch (error) {
      console.error('Failed to fetch security events:', error);
      toast.error('Failed to load security events');
    } finally {
      setIsLoading(false);
    }
  };

  // Monitor suspicious activities
  const monitorFailedLogins = () => {
    const failedAttempts = parseInt(localStorage.getItem('failed_login_attempts') || '0');
    if (failedAttempts >= 5) {
      logSecurityEvent('MULTIPLE_FAILED_LOGINS', 'Multiple failed login attempts detected', {
        attempts: failedAttempts,
        timestamp: new Date().toISOString()
      });
    }
  };

  const monitorRateLimiting = (endpoint: string, requestCount: number) => {
    if (requestCount > 100) { // 100 requests per minute threshold
      logSecurityEvent('RATE_LIMIT_EXCEEDED', `Rate limit exceeded for endpoint: ${endpoint}`, {
        endpoint,
        request_count: requestCount,
        timestamp: new Date().toISOString()
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchSecurityEvents();
    }
  }, [user]);

  return {
    securityEvents,
    isLoading,
    logSecurityEvent,
    fetchSecurityEvents,
    monitorFailedLogins,
    monitorRateLimiting
  };
};
