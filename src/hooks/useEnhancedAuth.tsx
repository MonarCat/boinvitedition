
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useSecurityMonitoring } from './useSecurityMonitoring';

export type UserRole = 'admin' | 'moderator' | 'user';

export const useEnhancedAuth = () => {
  const { user, loading } = useAuth();
  const { logSecurityEvent } = useSecurityMonitoring();
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);

  // Fetch user roles
  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!user?.id) {
        setUserRoles([]);
        setRolesLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching user roles:', error);
          await logSecurityEvent('USER_ROLES_FETCH_ERROR', 'Failed to fetch user roles', {
            user_id: user.id,
            error: error.message
          });
          setUserRoles([]);
        } else {
          const roles = data.map(r => r.role as UserRole);
          setUserRoles(roles);
        }
      } catch (error) {
        console.error('Exception fetching user roles:', error);
        setUserRoles([]);
      } finally {
        setRolesLoading(false);
      }
    };

    fetchUserRoles();
  }, [user?.id, logSecurityEvent]);

  // Check if user has specific role
  const hasRole = (role: UserRole): boolean => {
    return userRoles.includes(role);
  };

  // Validate business access with enhanced security
  const validateBusinessAccess = async (businessId: string): Promise<boolean> => {
    if (!user?.id) {
      await logSecurityEvent('UNAUTHENTICATED_BUSINESS_ACCESS', 'Unauthenticated user attempted business access', {
        business_id: businessId
      });
      return false;
    }

    try {
      const { data, error } = await supabase.rpc('validate_business_access', {
        p_business_id: businessId,
        p_user_id: user.id
      });

      if (error) {
        await logSecurityEvent('BUSINESS_ACCESS_VALIDATION_ERROR', 'Error validating business access', {
          business_id: businessId,
          user_id: user.id,
          error: error.message
        });
        return false;
      }

      return data || false;
    } catch (error) {
      await logSecurityEvent('BUSINESS_ACCESS_VALIDATION_EXCEPTION', 'Exception during business access validation', {
        business_id: businessId,
        user_id: user.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  };

  return {
    user,
    loading: loading || rolesLoading,
    userRoles,
    hasRole,
    isAdmin: hasRole('admin'),
    isModerator: hasRole('moderator'),
    validateBusinessAccess
  };
};
