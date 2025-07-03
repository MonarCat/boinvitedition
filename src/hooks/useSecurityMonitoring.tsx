
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
  ip_address?: string;
  user_agent?: string;
}

export const useSecurityMonitoring = () => {
  const { user } = useAuth();
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const logSecurityEvent = async (
    eventType: string,
    description: string,
    metadata: Record<string, any> = {},
    severity: string = 'medium'
  ) => {
    try {
      if (!user) {
        console.warn('User not authenticated, cannot log security event');
        return;
      }

      const { error } = await supabase.rpc('log_security_event_enhanced', {
        p_event_type: eventType,
        p_description: description,
        p_metadata: metadata,
        p_severity: severity
      });
      
      if (error) {
        console.error('Failed to log security event:', error);
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  const fetchSecurityEvents = async () => {
    if (!user) {
      console.log('User not authenticated, skipping security events fetch');
      return;
    }
    
    setIsLoading(true);
    try {
      // First check if the user session is still valid
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.log('Session invalid, refreshing...');
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.error('Failed to refresh session:', refreshError);
          toast.error('Session expired. Please sign in again.');
          return;
        }
      }

      const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .eq('action', 'SECURITY_EVENT')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        if (error.code === 'PGRST301') {
          // JWT expired - try refresh once more
          const { error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            console.error('Failed to refresh session:', refreshError);
            toast.error('Session expired. Please sign in again.');
            return;
          }
          // Retry the request after refresh
          const { data: retryData, error: retryError } = await supabase
            .from('audit_log')
            .select('*')
            .eq('action', 'SECURITY_EVENT')
            .order('created_at', { ascending: false })
            .limit(50);
          
          if (retryError) {
            throw retryError;
          }
          
          setSecurityEvents(transformSecurityEvents(retryData || []));
          return;
        }
        throw error;
      }
      
      setSecurityEvents(transformSecurityEvents(data || []));
    } catch (error) {
      console.error('Failed to fetch security events:', error);
      toast.error('Failed to load security events');
    } finally {
      setIsLoading(false);
    }
  };

  const transformSecurityEvents = (data: any[]): SecurityEvent[] => {
    return data.map(item => ({
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
        : undefined,
      ip_address: item.ip_address,
      user_agent: item.user_agent
    }));
  };

  // Enhanced security monitoring functions with better threat detection
  const monitorFailedLogins = async (attempts: number, email: string) => {
    if (attempts >= 3) {
      await logSecurityEvent('MULTIPLE_FAILED_LOGINS', 'Multiple failed login attempts detected', {
        attempts,
        email,
        timestamp: new Date().toISOString(),
        ip_address: await getClientIP()
      }, attempts >= 5 ? 'high' : 'medium');
    }
  };

  const monitorRateLimiting = async (endpoint: string, requestCount: number, identifier: string) => {
    if (requestCount > 50) {
      await logSecurityEvent('RATE_LIMIT_WARNING', `High request volume detected for endpoint: ${endpoint}`, {
        endpoint,
        request_count: requestCount,
        identifier,
        timestamp: new Date().toISOString()
      }, requestCount > 100 ? 'high' : 'medium');
    }
  };

  const monitorSuspiciousPayments = async (amount: number, businessId: string, clientEmail?: string) => {
    // Enhanced payment monitoring with multiple thresholds
    if (amount > 100000) { // Large amounts (>100k KES)
      await logSecurityEvent('LARGE_PAYMENT_ATTEMPT', 'Large payment amount detected', {
        amount,
        business_id: businessId,
        client_email: clientEmail,
        timestamp: new Date().toISOString()
      }, 'high');
    } else if (amount > 50000) {
      await logSecurityEvent('MEDIUM_PAYMENT_ALERT', 'Medium-large payment detected', {
        amount,
        business_id: businessId,
        client_email: clientEmail,
        timestamp: new Date().toISOString()
      }, 'medium');
    }
  };

  const monitorUnauthorizedAccess = async (resource: string, userId: string, businessId?: string) => {
    await logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', `Unauthorized access to ${resource}`, {
      resource,
      user_id: userId,
      business_id: businessId,
      timestamp: new Date().toISOString(),
      ip_address: await getClientIP()
    }, 'high');
  };

  const monitorDataExport = async (exportType: string, recordCount: number, businessId?: string) => {
    await logSecurityEvent('DATA_EXPORT', `Data export performed: ${exportType}`, {
      export_type: exportType,
      record_count: recordCount,
      business_id: businessId,
      timestamp: new Date().toISOString()
    }, recordCount > 1000 ? 'medium' : 'low');
  };

  const monitorBusinessAccess = async (businessId: string, action: string, success: boolean) => {
    if (!success) {
      await logSecurityEvent('BUSINESS_ACCESS_DENIED', `Access denied to business: ${action}`, {
        business_id: businessId,
        action,
        user_id: user?.id,
        timestamp: new Date().toISOString()
      }, 'medium');
    }
  };

  // Helper function to get client IP (limited in browser context)
  const getClientIP = async (): Promise<string | undefined> => {
    try {
      // This would typically be handled by the server
      return 'client-side'; // Placeholder
    } catch {
      return undefined;
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
    monitorRateLimiting,
    monitorSuspiciousPayments,
    monitorUnauthorizedAccess,
    monitorDataExport,
    monitorBusinessAccess
  };
};
