
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { validateBusinessId } from '@/utils/securityUtils';
import { toast } from 'sonner';

export const useSecureBusinessValidation = () => {
  const { user } = useAuth();
  const { logSecurityEvent } = useSecurityMonitoring();

  const validateBusinessOwnership = useCallback(async (businessId: string): Promise<boolean> => {
    if (!user?.id) {
      await logSecurityEvent('UNAUTHENTICATED_BUSINESS_ACCESS', 'Unauthenticated user attempted business access', {
        business_id: businessId,
        severity: 'high'
      });
      return false;
    }

    if (!validateBusinessId(businessId)) {
      await logSecurityEvent('INVALID_BUSINESS_ID_FORMAT', 'Invalid business ID format detected', {
        business_id: businessId,
        user_id: user.id,
        severity: 'high'
      });
      return false;
    }

    try {
      const { data, error } = await supabase.rpc('secure_validate_business_ownership', {
        p_business_id: businessId,
        p_user_id: user.id
      });

      if (error) {
        await logSecurityEvent('BUSINESS_VALIDATION_ERROR', 'Business ownership validation failed', {
          business_id: businessId,
          user_id: user.id,
          error: error.message,
          severity: 'medium'
        });
        return false;
      }

      if (!data) {
        await logSecurityEvent('UNAUTHORIZED_BUSINESS_ACCESS', 'User attempted to access non-owned business', {
          business_id: businessId,
          user_id: user.id,
          severity: 'high'
        });
      }

      return data || false;
    } catch (err) {
      await logSecurityEvent('BUSINESS_VALIDATION_EXCEPTION', 'Exception during business ownership validation', {
        business_id: businessId,
        user_id: user.id,
        error: err instanceof Error ? err.message : 'Unknown error',
        severity: 'high'
      });
      return false;
    }
  }, [user, logSecurityEvent]);

  const secureBusinessAction = useCallback(async (
    businessId: string,
    action: string,
    callback: () => Promise<any>
  ): Promise<any> => {
    const isOwner = await validateBusinessOwnership(businessId);
    
    if (!isOwner) {
      toast.error('Access denied: You do not have permission to perform this action');
      return null;
    }

    try {
      const result = await callback();
      
      await logSecurityEvent('SECURE_BUSINESS_ACTION', `Secure business action performed: ${action}`, {
        business_id: businessId,
        user_id: user?.id,
        action,
        success: true,
        severity: 'low'
      });
      
      return result;
    } catch (error) {
      await logSecurityEvent('SECURE_BUSINESS_ACTION_FAILED', `Secure business action failed: ${action}`, {
        business_id: businessId,
        user_id: user?.id,
        action,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
        severity: 'medium'
      });
      throw error;
    }
  }, [validateBusinessOwnership, user, logSecurityEvent]);

  return {
    validateBusinessOwnership,
    secureBusinessAction
  };
};
