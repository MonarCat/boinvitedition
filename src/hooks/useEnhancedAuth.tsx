
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
        return { allowed: true }; // Fail open for availability
      }

      return { allowed: data };
    } catch (error) {
      console.error('Rate limit check error:', error);
      return { allowed: true }; // Fail open for availability
    }
  };

  const logSecurityEvent = async (eventType: string, description: string, metadata: any = {}) => {
    try {
      await supabase.rpc('log_security_event', {
        p_event_type: eventType,
        p_description: description,
        p_metadata: metadata
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
      return { data: null, error: { message: 'Invalid email format' } };
    }

    // Check rate limiting
    const rateLimitCheck = await checkRateLimit(cleanEmail, 'login');
    if (!rateLimitCheck.allowed) {
      setIsBlocked(true);
      await logSecurityEvent('RATE_LIMIT_EXCEEDED', 'Login attempts exceeded', {
        email: cleanEmail,
        attempt_type: 'login'
      });
      toast.error('Too many login attempts. Please try again later.');
      return { data: null, error: { message: 'Rate limit exceeded' } };
    }

    try {
      const result = await signIn(cleanEmail, cleanPassword);
      
      if (result.error) {
        await logSecurityEvent('FAILED_LOGIN', 'Failed login attempt', {
          email: cleanEmail,
          error: result.error.message
        });
      } else {
        await logSecurityEvent('SUCCESSFUL_LOGIN', 'User logged in successfully', {
          email: cleanEmail
        });
      }

      return result;
    } catch (error) {
      await logSecurityEvent('LOGIN_ERROR', 'Login system error', {
        email: cleanEmail,
        error: error instanceof Error ? error.message : 'Unknown error'
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
      return { data: null, error: { message: 'Invalid email format' } };
    }

    // Check rate limiting
    const rateLimitCheck = await checkRateLimit(cleanEmail, 'signup');
    if (!rateLimitCheck.allowed) {
      await logSecurityEvent('RATE_LIMIT_EXCEEDED', 'Signup attempts exceeded', {
        email: cleanEmail,
        attempt_type: 'signup'
      });
      toast.error('Too many signup attempts. Please try again later.');
      return { data: null, error: { message: 'Rate limit exceeded' } };
    }

    try {
      const result = await signUp(cleanEmail, cleanPassword, cleanProfile);
      
      if (result.error) {
        await logSecurityEvent('FAILED_SIGNUP', 'Failed signup attempt', {
          email: cleanEmail,
          error: result.error.message
        });
      } else {
        await logSecurityEvent('SUCCESSFUL_SIGNUP', 'User signed up successfully', {
          email: cleanEmail
        });
      }

      return result;
    } catch (error) {
      await logSecurityEvent('SIGNUP_ERROR', 'Signup system error', {
        email: cleanEmail,
        error: error instanceof Error ? error.message : 'Unknown error'
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
      return { data: null, error: { message: 'Invalid email format' } };
    }

    // Check rate limiting
    const rateLimitCheck = await checkRateLimit(cleanEmail, 'reset');
    if (!rateLimitCheck.allowed) {
      await logSecurityEvent('RATE_LIMIT_EXCEEDED', 'Password reset attempts exceeded', {
        email: cleanEmail,
        attempt_type: 'reset'
      });
      toast.error('Too many reset attempts. Please try again later.');
      return { data: null, error: { message: 'Rate limit exceeded' } };
    }

    try {
      const result = await resetPassword(cleanEmail);
      
      await logSecurityEvent('PASSWORD_RESET_REQUESTED', 'Password reset requested', {
        email: cleanEmail
      });

      return result;
    } catch (error) {
      await logSecurityEvent('PASSWORD_RESET_ERROR', 'Password reset system error', {
        email: cleanEmail,
        error: error instanceof Error ? error.message : 'Unknown error'
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
