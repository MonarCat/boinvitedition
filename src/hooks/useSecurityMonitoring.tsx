
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SecurityEvent {
  event_type: string;
  description: string;
  user_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
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
      await supabase.rpc('log_security_event', {
        p_event_type: eventType,
        p_description: description,
        p_metadata: metadata
      });
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
      setSecurityEvents(data || []);
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
