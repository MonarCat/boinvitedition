
import React, { useState, useEffect, ReactNode } from 'react';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface SecureBusinessGuardProps {
  businessId: string;
  children: ReactNode;
  requiredRole?: 'admin' | 'moderator' | 'user';
  fallback?: ReactNode;
}

export const SecureBusinessGuard: React.FC<SecureBusinessGuardProps> = ({
  businessId,
  children,
  requiredRole,
  fallback
}) => {
  const { user, loading, hasRole, validateBusinessAccess } = useEnhancedAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user || loading) {
        setIsValidating(false);
        return;
      }

      try {
        // Check role requirements first
        if (requiredRole && !hasRole(requiredRole)) {
          setHasAccess(false);
          setIsValidating(false);
          toast.error(`Access denied: ${requiredRole} role required`);
          return;
        }

        // Validate business access
        const businessAccess = await validateBusinessAccess(businessId);
        setHasAccess(businessAccess);

        if (!businessAccess) {
          toast.error('Access denied: You do not have permission to access this business');
        }
      } catch (error) {
        console.error('Access validation error:', error);
        setHasAccess(false);
        toast.error('Access validation failed');
      } finally {
        setIsValidating(false);
      }
    };

    if (businessId) {
      checkAccess();
    }
  }, [user, loading, businessId, requiredRole, hasRole, validateBusinessAccess]);

  if (loading || isValidating) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>Validating access permissions...</AlertDescription>
      </Alert>
    );
  }

  if (!user) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Authentication required to access this resource</AlertDescription>
      </Alert>
    );
  }

  if (hasAccess === false) {
    return fallback || (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Access denied: You do not have permission to access this business resource
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};
