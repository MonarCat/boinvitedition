
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
      const { error } = await supabase.rpc('log_security_event', {
        p_event_type: eventType,
        p_description: description,
        p_metadata: metadata
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
        event_type: item.table_name,
        description: typeof item.old_values === 'object' && item.old_values !== null && 'description' in item.old_values 
          ? String(item.old_values.description) 
          : undefined
      }));
      
      setSecurityEvents(transformedEvents);
    } catch (error) {
      console.error('Failed to fetch security events:', error);
      toast.error('Failed to load security events');
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced security monitoring functions
  const monitorFailedLogins = (attempts: number) => {
    if (attempts >= 5) {
      logSecurityEvent('MULTIPLE_FAILED_LOGINS', 'Multiple failed login attempts detected', {
        attempts,
        timestamp: new Date().toISOString(),
        severity: 'high'
      });
    }
  };

  const monitorRateLimiting = (endpoint: string, requestCount: number) => {
    if (requestCount > 100) {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', `Rate limit exceeded for endpoint: ${endpoint}`, {
        endpoint,
        request_count: requestCount,
        timestamp: new Date().toISOString(),
        severity: 'medium'
      });
    }
  };

  const monitorSuspiciousPayments = (amount: number, businessId: string) => {
    if (amount > 100000) { // Large amounts
      logSecurityEvent('LARGE_PAYMENT_ATTEMPT', 'Large payment amount detected', {
        amount,
        business_id: businessId,
        timestamp: new Date().toISOString(),
        severity: 'high'
      });
    }
  };

  const monitorUnauthorizedAccess = (resource: string, userId: string) => {
    logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', `Unauthorized access to ${resource}`, {
      resource,
      user_id: userId,
      timestamp: new Date().toISOString(),
      severity: 'high'
    });
  };

  const monitorDataExport = (exportType: string, recordCount: number) => {
    logSecurityEvent('DATA_EXPORT', `Data export performed: ${exportType}`, {
      export_type: exportType,
      record_count: recordCount,
      timestamp: new Date().toISOString(),
      severity: 'medium'
    });
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
    monitorRateLimiting,
    monitorSuspiciousPayments,
    monitorUnauthorizedAccess,
    monitorDataExport
  };
};
