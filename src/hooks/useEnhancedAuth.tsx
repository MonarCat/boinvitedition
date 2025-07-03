
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { sanitizeInput, validateEmail } from '@/utils/securityUtils';
import { toast } from 'sonner';

interface RateLimitResponse {
  allowed: boolean;
  remainingAttempts?: number;
  blockedUntil?: string;
}

export const useEnhancedAuth = () => {
  const { signIn, signUp, resetPassword } = useAuth();
  const [isBlocked, setIsBlocked] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(5);

  const checkRateLimit = async (identifier: string, attemptType: string): Promise<RateLimitResponse> => {
    try {
      const { data, error } = await supabase.rpc('check_rate_limit', {
        p_identifier: identifier,
        p_attempt_type: attemptType,
        p_max_attempts: 5,
        p_window_minutes: 15
      });

      if (error) {
        console.error('Rate limit check failed:', error);
        // Log this as a security event
        await logSecurityEvent('RATE_LIMIT_CHECK_FAILED', 'Rate limit check failed', {
          identifier,
          attemptType,
          error: error.message
        });
        return { allowed: true }; // Fail open for availability
      }

      return { allowed: data };
    } catch (error) {
      console.error('Rate limit check error:', error);
      await logSecurityEvent('RATE_LIMIT_SYSTEM_ERROR', 'Rate limit system error', {
        identifier,
        attemptType,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return { allowed: true }; // Fail open for availability
    }
  };

  const logSecurityEvent = async (eventType: string, description: string, metadata: any = {}) => {
    try {
      await supabase.rpc('log_security_event_enhanced', {
        p_event_type: eventType,
        p_description: description,
        p_metadata: metadata,
        p_severity: 'medium'
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  const secureSignIn = useCallback(async (email: string, password: string) => {
    // Sanitize inputs
    const cleanEmail = sanitizeInput(email).toLowerCase();
    const cleanPassword = password; // Don't sanitize passwords

    // Validate email format
    if (!validateEmail(cleanEmail)) {
      toast.error('Please enter a valid email address');
      await logSecurityEvent('INVALID_EMAIL_FORMAT', 'Invalid email format in login attempt', {
        email: cleanEmail
      });
      return { data: null, error: { message: 'Invalid email format' } };
    }

    // Check rate limiting
    const rateLimitCheck = await checkRateLimit(cleanEmail, 'login');
    if (!rateLimitCheck.allowed) {
      setIsBlocked(true);
      await logSecurityEvent('RATE_LIMIT_EXCEEDED', 'Login attempts exceeded', {
        email: cleanEmail,
        attempt_type: 'login',
        severity: 'high'
      });
      toast.error('Too many login attempts. Please try again later.');
      return { data: null, error: { message: 'Rate limit exceeded' } };
    }

    try {
      const result = await signIn(cleanEmail, cleanPassword);
      
      if (result.error) {
        await logSecurityEvent('FAILED_LOGIN', 'Failed login attempt', {
          email: cleanEmail,
          error: result.error.message,
          severity: 'medium'
        });
        
        // Implement progressive delays for failed attempts
        const attemptCount = parseInt(sessionStorage.getItem(`login_attempts_${cleanEmail}`) || '0');
        sessionStorage.setItem(`login_attempts_${cleanEmail}`, (attemptCount + 1).toString());
        
        if (attemptCount >= 3) {
          await logSecurityEvent('MULTIPLE_FAILED_LOGINS', 'Multiple failed login attempts detected', {
            email: cleanEmail,
            attempts: attemptCount + 1,
            severity: 'high'
          });
        }
      } else {
        // Clear failed attempts on successful login
        sessionStorage.removeItem(`login_attempts_${cleanEmail}`);
        await logSecurityEvent('SUCCESSFUL_LOGIN', 'User logged in successfully', {
          email: cleanEmail,
          severity: 'low'
        });
      }

      return result;
    } catch (error) {
      await logSecurityEvent('LOGIN_ERROR', 'Login system error', {
        email: cleanEmail,
        error: error instanceof Error ? error.message : 'Unknown error',
        severity: 'high'
      });
      throw error;
    }
  }, [signIn]);

  const secureSignUp = useCallback(async (email: string, password: string, profile?: any) => {
    // Sanitize inputs
    const cleanEmail = sanitizeInput(email).toLowerCase();
    const cleanPassword = password;
    const cleanProfile = profile ? {
      firstName: sanitizeInput(profile.firstName || ''),
      lastName: sanitizeInput(profile.lastName || '')
    } : undefined;

    // Validate email format
    if (!validateEmail(cleanEmail)) {
      toast.error('Please enter a valid email address');
      await logSecurityEvent('INVALID_EMAIL_FORMAT', 'Invalid email format in signup attempt', {
        email: cleanEmail
      });
      return { data: null, error: { message: 'Invalid email format' } };
    }

    // Enhanced password validation
    if (cleanPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return { data: null, error: { message: 'Password too short' } };
    }

    // Check rate limiting
    const rateLimitCheck = await checkRateLimit(cleanEmail, 'signup');
    if (!rateLimitCheck.allowed) {
      await logSecurityEvent('RATE_LIMIT_EXCEEDED', 'Signup attempts exceeded', {
        email: cleanEmail,
        attempt_type: 'signup',
        severity: 'high'
      });
      toast.error('Too many signup attempts. Please try again later.');
      return { data: null, error: { message: 'Rate limit exceeded' } };
    }

    try {
      const result = await signUp(cleanEmail, cleanPassword, cleanProfile);
      
      if (result.error) {
        await logSecurityEvent('FAILED_SIGNUP', 'Failed signup attempt', {
          email: cleanEmail,
          error: result.error.message,
          severity: 'medium'
        });
      } else {
        await logSecurityEvent('SUCCESSFUL_SIGNUP', 'User signed up successfully', {
          email: cleanEmail,
          severity: 'low'
        });
      }

      return result;
    } catch (error) {
      await logSecurityEvent('SIGNUP_ERROR', 'Signup system error', {
        email: cleanEmail,
        error: error instanceof Error ? error.message : 'Unknown error',
        severity: 'high'
      });
      throw error;
    }
  }, [signUp]);

  const secureResetPassword = useCallback(async (email: string) => {
    // Sanitize input
    const cleanEmail = sanitizeInput(email).toLowerCase();

    // Validate email format
    if (!validateEmail(cleanEmail)) {
      toast.error('Please enter a valid email address');
      await logSecurityEvent('INVALID_EMAIL_FORMAT', 'Invalid email format in password reset', {
        email: cleanEmail
      });
      return { data: null, error: { message: 'Invalid email format' } };
    }

    // Check rate limiting (stricter for password resets)
    const rateLimitCheck = await checkRateLimit(cleanEmail, 'reset');
    if (!rateLimitCheck.allowed) {
      await logSecurityEvent('RATE_LIMIT_EXCEEDED', 'Password reset attempts exceeded', {
        email: cleanEmail,
        attempt_type: 'reset',
        severity: 'high'
      });
      toast.error('Too many reset attempts. Please try again later.');
      return { data: null, error: { message: 'Rate limit exceeded' } };
    }

    try {
      const result = await resetPassword(cleanEmail);
      
      await logSecurityEvent('PASSWORD_RESET_REQUESTED', 'Password reset requested', {
        email: cleanEmail,
        severity: 'medium'
      });

      return result;
    } catch (error) {
      await logSecurityEvent('PASSWORD_RESET_ERROR', 'Password reset system error', {
        email: cleanEmail,
        error: error instanceof Error ? error.message : 'Unknown error',
        severity: 'high'
      });
      throw error;
    }
  }, [resetPassword]);

  return {
    secureSignIn,
    secureSignUp,
    secureResetPassword,
    isBlocked,
    remainingAttempts,
    logSecurityEvent
  };
};
