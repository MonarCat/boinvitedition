
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

interface SecurityMetrics {
  failedAttempts: number;
  lastFailedAttempt?: Date;
  isBlocked: boolean;
  blockExpiresAt?: Date;
}

export const useEnhancedSecureAuth = () => {
  const { signIn, signUp, resetPassword } = useAuth();
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    failedAttempts: 0,
    isBlocked: false
  });

  const checkRateLimit = async (identifier: string, attemptType: string): Promise<RateLimitResponse> => {
    try {
      const { data, error } = await supabase.rpc('safe_rate_limit_check', {
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
        p_metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          ip_fingerprint: await generateBrowserFingerprint()
        }
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  const generateBrowserFingerprint = async (): Promise<string> => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Browser fingerprint', 2, 2);
      }
      
      const fingerprint = {
        screen: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        platform: navigator.platform,
        canvas: canvas.toDataURL().slice(-50), // Last 50 chars for brevity
        connection: (navigator as any).connection?.effectiveType || 'unknown'
      };
      
      return btoa(JSON.stringify(fingerprint)).slice(0, 32);
    } catch (error) {
      return 'fingerprint-error';
    }
  };

  const validatePasswordStrength = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return { isValid: errors.length === 0, errors };
  };

  const secureSignIn = useCallback(async (email: string, password: string) => {
    // Enhanced input sanitization
    const cleanEmail = sanitizeInput(email).toLowerCase().trim();
    const cleanPassword = password; // Don't sanitize passwords

    // Validate email format with enhanced regex
    if (!validateEmail(cleanEmail)) {
      toast.error('Please enter a valid email address');
      await logSecurityEvent('INVALID_EMAIL_FORMAT', 'Invalid email format in sign-in attempt', {
        email: cleanEmail
      });
      return { data: null, error: { message: 'Invalid email format' } };
    }

    // Check rate limiting with enhanced security
    const rateLimitCheck = await checkRateLimit(cleanEmail, 'login');
    if (!rateLimitCheck.allowed) {
      setSecurityMetrics(prev => ({ 
        ...prev, 
        isBlocked: true, 
        blockExpiresAt: new Date(Date.now() + 15 * 60 * 1000) 
      }));
      
      await logSecurityEvent('RATE_LIMIT_EXCEEDED', 'Login attempts exceeded for user', {
        email: cleanEmail,
        attempt_type: 'login'
      });
      
      toast.error('Too many login attempts. Please try again in 15 minutes.');
      return { data: null, error: { message: 'Rate limit exceeded' } };
    }

    try {
      const result = await signIn(cleanEmail, cleanPassword);
      
      if (result.error) {
        // Update security metrics
        setSecurityMetrics(prev => ({
          ...prev,
          failedAttempts: prev.failedAttempts + 1,
          lastFailedAttempt: new Date()
        }));

        await logSecurityEvent('FAILED_LOGIN', 'Failed login attempt with enhanced tracking', {
          email: cleanEmail,
          error: result.error.message,
          attempt_count: securityMetrics.failedAttempts + 1
        });

        // Enhanced error messages
        if (result.error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. Please check your credentials.');
        } else if (result.error.message.includes('Email not confirmed')) {
          toast.error('Please confirm your email address before signing in.');
        } else {
          toast.error('Sign in failed. Please try again.');
        }
      } else {
        // Reset security metrics on successful login
        setSecurityMetrics({
          failedAttempts: 0,
          isBlocked: false
        });

        await logSecurityEvent('SUCCESSFUL_LOGIN', 'User logged in successfully with enhanced security', {
          email: cleanEmail
        });
        
        toast.success('Successfully signed in!');
      }

      return result;
    } catch (error) {
      await logSecurityEvent('LOGIN_ERROR', 'Login system error with enhanced tracking', {
        email: cleanEmail,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }, [signIn, securityMetrics]);

  const secureSignUp = useCallback(async (email: string, password: string, profile?: any) => {
    // Enhanced input sanitization
    const cleanEmail = sanitizeInput(email).toLowerCase().trim();
    const cleanPassword = password;
    const cleanProfile = profile ? {
      firstName: sanitizeInput(profile.firstName || '').trim(),
      lastName: sanitizeInput(profile.lastName || '').trim()
    } : undefined;

    // Validate email format
    if (!validateEmail(cleanEmail)) {
      toast.error('Please enter a valid email address');
      return { data: null, error: { message: 'Invalid email format' } };
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(cleanPassword);
    if (!passwordValidation.isValid) {
      toast.error(`Password requirements: ${passwordValidation.errors.join(', ')}`);
      return { data: null, error: { message: 'Password does not meet requirements' } };
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
        await logSecurityEvent('FAILED_SIGNUP', 'Failed signup attempt with enhanced tracking', {
          email: cleanEmail,
          error: result.error.message
        });
      } else {
        await logSecurityEvent('SUCCESSFUL_SIGNUP', 'User signed up successfully with enhanced security', {
          email: cleanEmail
        });
        toast.success('Account created! Please check your email for confirmation.');
      }

      return result;
    } catch (error) {
      await logSecurityEvent('SIGNUP_ERROR', 'Signup system error with enhanced tracking', {
        email: cleanEmail,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }, [signUp]);

  const secureResetPassword = useCallback(async (email: string) => {
    const cleanEmail = sanitizeInput(email).toLowerCase().trim();

    if (!validateEmail(cleanEmail)) {
      toast.error('Please enter a valid email address');
      return { data: null, error: { message: 'Invalid email format' } };
    }

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
      
      await logSecurityEvent('PASSWORD_RESET_REQUESTED', 'Password reset requested with enhanced security', {
        email: cleanEmail
      });

      toast.success('Password reset email sent! Please check your inbox.');
      return result;
    } catch (error) {
      await logSecurityEvent('PASSWORD_RESET_ERROR', 'Password reset error with enhanced tracking', {
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
    securityMetrics,
    logSecurityEvent,
    validatePasswordStrength
  };
};
