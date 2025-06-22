
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useErrorHandler } from '@/hooks/useErrorHandler';

export const useSecureBusinessAccess = (businessId?: string) => {
  const { user } = useAuth();
  const { handleError } = useErrorHandler();

  // Verify business ownership with enhanced security
  const { data: hasAccess, isLoading, error } = useQuery({
    queryKey: ['business-access', businessId, user?.id],
    queryFn: async () => {
      if (!businessId || !user) return false;

      try {
        // First check if the business exists and user has access
        const { data: business, error: businessError } = await supabase
          .from('businesses')
          .select('id, user_id, is_active')
          .eq('id', businessId)
          .eq('user_id', user.id)
          .single();

        if (businessError) {
          if (businessError.code === 'PGRST116') {
            // No rows returned - user doesn't own this business
            return false;
          }
          throw businessError;
        }

        // Additional security check - ensure business is active
        if (!business.is_active) {
          handleError(new Error('Business is not active'), 'business-access');
          return false;
        }

        // Log access attempt (in production, this could go to audit log)
        console.log('Business access granted:', {
          businessId,
          userId: user.id,
          timestamp: new Date().toISOString()
        });

        return true;
      } catch (error) {
        handleError(error, 'business-access-check');
        return false;
      }
    },
    enabled: !!(businessId && user),
    retry: false, // Don't retry on auth failures
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    hasAccess: hasAccess === true,
    isLoading,
    error
  };
};

// Hook for validating business operations
export const useBusinessOperationValidator = () => {
  const { handleError } = useErrorHandler();

  const validateBusinessOperation = async (
    businessId: string, 
    operation: string,
    data?: any
  ): Promise<boolean> => {
    try {
      // Rate limiting check
      const rateLimitKey = `business_${businessId}_${operation}`;
      const lastOperation = localStorage.getItem(rateLimitKey);
      const now = Date.now();
      
      if (lastOperation && (now - parseInt(lastOperation)) < 1000) {
        throw new Error('Operation rate limit exceeded. Please wait before trying again.');
      }
      
      localStorage.setItem(rateLimitKey, now.toString());

      // Validate data based on operation type
      if (operation === 'create_service' || operation === 'update_service') {
        if (!data?.name || data.name.length < 2 || data.name.length > 100) {
          throw new Error('Service name must be between 2 and 100 characters');
        }
        if (!data?.price || data.price <= 0 || data.price > 10000) {
          throw new Error('Service price must be between $0.01 and $10,000');
        }
        if (!data?.duration_minutes || data.duration_minutes < 5 || data.duration_minutes > 480) {
          throw new Error('Service duration must be between 5 minutes and 8 hours');
        }
      }

      if (operation === 'create_staff' || operation === 'update_staff') {
        if (!data?.name || data.name.length < 2 || data.name.length > 100) {
          throw new Error('Staff name must be between 2 and 100 characters');
        }
        if (!data?.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
          throw new Error('Valid email address is required');
        }
      }

      return true;
    } catch (error) {
      handleError(error, `business-operation-${operation}`);
      return false;
    }
  };

  return { validateBusinessOperation };
};
