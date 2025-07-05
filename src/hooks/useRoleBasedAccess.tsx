
import { useEnhancedAuth } from './useEnhancedAuth';
import { useSecurityMonitoring } from './useSecurityMonitoring';

export const useRoleBasedAccess = () => {
  const { hasRole, isAdmin, user } = useEnhancedAuth();
  const { logSecurityEvent } = useSecurityMonitoring();

  const checkPermission = async (
    requiredRole: 'admin' | 'moderator' | 'user',
    action: string,
    resourceId?: string
  ): Promise<boolean> => {
    if (!user) {
      await logSecurityEvent('UNAUTHENTICATED_ACCESS_ATTEMPT', `Unauthenticated access attempt: ${action}`, {
        action,
        resource_id: resourceId
      });
      return false;
    }

    if (!hasRole(requiredRole)) {
      await logSecurityEvent('UNAUTHORIZED_ROLE_ACCESS', `Insufficient role for action: ${action}`, {
        action,
        required_role: requiredRole,
        user_id: user.id,
        resource_id: resourceId
      });
      return false;
    }

    return true;
  };

  const requireAdmin = async (action: string, resourceId?: string): Promise<boolean> => {
    return checkPermission('admin', action, resourceId);
  };

  const requireModerator = async (action: string, resourceId?: string): Promise<boolean> => {
    return checkPermission('moderator', action, resourceId);
  };

  return {
    hasRole,
    isAdmin,
    checkPermission,
    requireAdmin,
    requireModerator
  };
};
