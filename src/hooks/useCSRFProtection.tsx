
import { useState, useEffect, useCallback } from 'react';
import { generateSecureCSRFToken } from '@/utils/enhancedSecurityUtils';

interface CSRFHook {
  csrfToken: string;
  validateCSRFToken: (token: string) => boolean;
  refreshToken: () => void;
}

export const useCSRFProtection = (): CSRFHook => {
  const [csrfToken, setCsrfToken] = useState<string>('');

  const generateToken = useCallback(() => {
    const token = generateSecureCSRFToken();
    setCsrfToken(token);
    // Store in session storage for validation
    sessionStorage.setItem('csrf_token', token);
    // Add timestamp for token expiry
    sessionStorage.setItem('csrf_token_timestamp', Date.now().toString());
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
    const tokenTimestamp = sessionStorage.getItem('csrf_token_timestamp');
    
    // Check if token exists and matches
    if (!token || !storedToken || token !== storedToken || token.length < 32) {
      return false;
    }
    
    // Check if token is not expired (1 hour expiry)
    if (tokenTimestamp) {
      const timestamp = parseInt(tokenTimestamp);
      const oneHour = 60 * 60 * 1000;
      if (Date.now() - timestamp > oneHour) {
        return false;
      }
    }
    
    return true;
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
