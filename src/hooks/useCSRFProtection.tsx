
import { useState, useEffect, useCallback } from 'react';
import { generateSecureToken } from '@/utils/securityUtils';

interface CSRFHook {
  csrfToken: string;
  validateCSRFToken: (token: string) => boolean;
  refreshToken: () => void;
}

export const useCSRFProtection = (): CSRFHook => {
  const [csrfToken, setCsrfToken] = useState<string>('');

  const generateToken = useCallback(() => {
    const token = generateSecureToken();
    setCsrfToken(token);
    // Store in session storage for validation
    sessionStorage.setItem('csrf_token', token);
    return token;
  }, []);

  useEffect(() => {
    // Check if we have a valid token in session storage
    const existingToken = sessionStorage.getItem('csrf_token');
    if (existingToken && existingToken.length > 20) {
      setCsrfToken(existingToken);
    } else {
      generateToken();
    }
  }, [generateToken]);

  const validateCSRFToken = useCallback((token: string): boolean => {
    const storedToken = sessionStorage.getItem('csrf_token');
    return !!(token && storedToken && token === storedToken && token.length > 20);
  }, []);

  const refreshToken = useCallback(() => {
    generateToken();
  }, [generateToken]);

  return {
    csrfToken,
    validateCSRFToken,
    refreshToken
  };
};
