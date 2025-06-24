
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { validateBusinessId } from '@/utils/securityUtils';
import { toast } from 'sonner';

export const useSecureBusinessAccess = (businessId?: string) => {
  const { user } = useAuth();
  const { logSecurityEvent } = useSecurityMonitoring();

  const { data: hasAccess, isLoading, error } = useQuery({
    queryKey: ['business-access', businessId, user?.id],
    queryFn: async () => {
      if (!user?.id || !businessId) return false;

      // Enhanced validation with security logging
      if (!validateBusinessId(businessId)) {
        await logSecurityEvent('INVALID_BUSINESS_ID', 'Invalid business ID format detected', {
          business_id: businessId,
          user_id: user.id,
          severity: 'high'
        });
        throw new Error('Invalid business ID format');
      }

      try {
        // Use the new security function
        const { data, error } = await supabase.rpc('is_business_owner', {
          _business_id: businessId
        });

        if (error) {
          await logSecurityEvent('BUSINESS_ACCESS_ERROR', 'Business access validation failed', {
            business_id: businessId,
            user_id: user.id,
            error: error.message,
            severity: 'medium'
          });
          throw error;
        }

        if (!data) {
          await logSecurityEvent('UNAUTHORIZED_BUSINESS_ACCESS', 'User attempted to access business they do not own', {
            business_id: businessId,
            user_id: user.id,
            severity: 'high'
          });
        }

        return data;
      } catch (err) {
        console.error('Business access check failed:', err);
        await logSecurityEvent('BUSINESS_ACCESS_ERROR', 'Business access validation failed', {
          business_id: businessId,
          user_id: user.id,
          error: err instanceof Error ? err.message : 'Unknown error',
          severity: 'high'
        });
        throw err;
      }
    },
    enabled: !!user?.id && !!businessId,
    retry: false,
  });

  const validateBusinessAccess = async (requiredBusinessId: string): Promise<boolean> => {
    if (!user?.id) {
      toast.error('Authentication required');
      await logSecurityEvent('UNAUTHENTICATED_ACCESS', 'Unauthenticated user attempted business access', {
        business_id: requiredBusinessId,
        severity: 'high'
      });
      return false;
    }

    if (!validateBusinessId(requiredBusinessId)) {
      toast.error('Invalid business identifier');
      await logSecurityEvent('INVALID_BUSINESS_ID', 'Invalid business ID in access validation', {
        business_id: requiredBusinessId,
        user_id: user.id,
        severity: 'high'
      });
      return false;
    }

    if (!hasAccess) {
      toast.error('Access denied: You do not own this business');
      await logSecurityEvent('ACCESS_DENIED', 'User access denied to business', {
        business_id: requiredBusinessId,
        user_id: user.id,
        severity: 'high'
      });
      return false;
    }

    return true;
  };

  const auditBusinessAction = async (action: string, details: Record<string, any> = {}) => {
    if (!businessId || !user?.id) return;

    await logSecurityEvent('BUSINESS_ACTION', `Business action performed: ${action}`, {
      business_id: businessId,
      user_id: user.id,
      action,
      ...details,
      severity: 'low'
    });
  };

  return {
    hasAccess: hasAccess || false,
    isLoading,
    error,
    validateBusinessAccess,
    auditBusinessAction
  };
};
