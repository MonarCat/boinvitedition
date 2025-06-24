
import { useState, useEffect, useCallback } from 'react';
import { generateSecureToken } from '@/utils/securityUtils';

export const useCSRFProtection = () => {
  const [csrfToken, setCsrfToken] = useState<string>('');

  useEffect(() => {
    // Generate CSRF token on component mount
    const token = generateSecureToken();
    setCsrfToken(token);
    
    // Store in session storage for validation
    sessionStorage.setItem('csrf_token', token);
  }, []);

  const validateCSRFToken = useCallback((token: string): boolean => {
    const storedToken = sessionStorage.getItem('csrf_token');
    return token === storedToken && token.length > 0;
  }, []);

  const refreshCSRFToken = useCallback(() => {
    const newToken = generateSecureToken();
    setCsrfToken(newToken);
    sessionStorage.setItem('csrf_token', newToken);
  }, []);

  return {
    csrfToken,
    validateCSRFToken,
    refreshCSRFToken
  };
};
