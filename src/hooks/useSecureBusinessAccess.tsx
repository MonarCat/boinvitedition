
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { toast } from 'sonner';

export const useSecureBusinessAccess = (businessId?: string) => {
  const { user } = useAuth();
  const { logSecurityEvent } = useSecurityMonitoring();

  const { data: hasAccess, isLoading, error } = useQuery({
    queryKey: ['business-access', businessId, user?.id],
    queryFn: async () => {
      if (!user?.id || !businessId) return false;

      // Enhanced validation with security logging
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidPattern.test(businessId)) {
        await logSecurityEvent('INVALID_BUSINESS_ID', 'Invalid business ID format detected', {
          business_id: businessId,
          user_id: user.id
        });
        throw new Error('Invalid business ID format');
      }

      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('id, user_id, name')
          .eq('id', businessId)
          .eq('user_id', user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // Log unauthorized access attempt
            await logSecurityEvent('UNAUTHORIZED_BUSINESS_ACCESS', 'User attempted to access business they do not own', {
              business_id: businessId,
              user_id: user.id
            });
            return false;
          }
          throw error;
        }

        return !!data;
      } catch (err) {
        console.error('Business access check failed:', err);
        await logSecurityEvent('BUSINESS_ACCESS_ERROR', 'Business access validation failed', {
          business_id: businessId,
          user_id: user.id,
          error: err instanceof Error ? err.message : 'Unknown error'
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
        business_id: requiredBusinessId
      });
      return false;
    }

    if (!hasAccess) {
      toast.error('Access denied: You do not own this business');
      await logSecurityEvent('ACCESS_DENIED', 'User access denied to business', {
        business_id: requiredBusinessId,
        user_id: user.id
      });
      return false;
    }

    return true;
  };

  return {
    hasAccess: hasAccess || false,
    isLoading,
    error,
    validateBusinessAccess
  };
};
