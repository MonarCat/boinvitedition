
import { supabase } from '@/integrations/supabase/client';

// Enhanced input validation with server-side verification
export const validateInputWithBackend = async (
  input: string,
  fieldType: 'email' | 'phone' | 'text' | 'url',
  businessId?: string
): Promise<{ isValid: boolean; errors: string[]; sanitized: string }> => {
  const errors: string[] = [];
  let sanitized = input.trim();

  // Client-side validation first
  switch (fieldType) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sanitized)) {
        errors.push('Invalid email format');
      }
      break;
    
    case 'phone':
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(sanitized)) {
        errors.push('Invalid phone number format');
      }
      break;
    
    case 'url':
      try {
        new URL(sanitized);
      } catch {
        errors.push('Invalid URL format');
      }
      break;
  }

  // Basic sanitization
  sanitized = sanitized
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');

  // Additional security checks
  const suspiciousPatterns = [
    /script\s*>/i,
    /eval\s*\(/i,
    /document\s*\./i,
    /window\s*\./i
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(sanitized))) {
    errors.push('Input contains potentially dangerous content');
    
    // Log security event
    if (businessId) {
      try {
        await supabase.rpc('log_security_event_enhanced', {
          p_event_type: 'SUSPICIOUS_INPUT_DETECTED',
          p_description: 'Suspicious input pattern detected',
          p_metadata: {
            field_type: fieldType,
            business_id: businessId,
            input_sample: sanitized.substring(0, 50)
          },
          p_severity: 'high'
        });
      } catch (error) {
        console.warn('Failed to log security event:', error);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
};

// Rate limiting for form submissions
export const checkFormSubmissionRateLimit = async (
  identifier: string,
  formType: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('safe_rate_limit_check', {
      p_identifier: identifier,
      p_attempt_type: `form_${formType}`,
      p_max_attempts: 10,
      p_window_minutes: 5
    });

    if (error) {
      console.warn('Rate limit check failed:', error);
      return true; // Allow if check fails
    }

    return data;
  } catch (error) {
    console.warn('Rate limit check exception:', error);
    return true; // Allow if check fails
  }
};

// Enhanced payment amount validation
export const validatePaymentAmount = (
  amount: number,
  currency: string = 'KES'
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (typeof amount !== 'number' || isNaN(amount)) {
    errors.push('Amount must be a valid number');
    return { isValid: false, errors };
  }

  if (amount <= 0) {
    errors.push('Amount must be greater than zero');
  }

  // Currency-specific limits
  const limits: Record<string, number> = {
    KES: 1000000, // 1M KES
    USD: 10000,   // 10K USD
    EUR: 9000,    // 9K EUR
    GBP: 8000     // 8K GBP
  };

  const maxAmount = limits[currency] || limits.KES;
  if (amount > maxAmount) {
    errors.push(`Amount exceeds maximum limit of ${maxAmount} ${currency}`);
  }

  // Check for suspicious amounts (round numbers that are very high)
  if (amount >= 100000 && amount % 10000 === 0) {
    errors.push('Large round amounts require additional verification');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Enhanced input validation with XSS prevention (alias for compatibility)
export const validateInputSecure = (input: string, fieldType: 'email' | 'phone' | 'text' | 'url'): { isValid: boolean; sanitized: string; errors: string[] } => {
  const errors: string[] = [];
  let sanitized = input.trim();
  
  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/<[^>]*>/g, ''); // Remove HTML tags
  sanitized = sanitized.replace(/javascript:/gi, ''); // Remove javascript: URLs
  sanitized = sanitized.replace(/data:/gi, ''); // Remove data: URLs
  sanitized = sanitized.replace(/vbscript:/gi, ''); // Remove vbscript: URLs
  
  // Field-specific validation
  switch (fieldType) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sanitized)) {
        errors.push('Invalid email format');
      }
      if (sanitized.length > 254) {
        errors.push('Email too long');
      }
      break;
      
    case 'phone':
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,20}$/;
      if (!phoneRegex.test(sanitized)) {
        errors.push('Invalid phone format');
      }
      break;
      
    case 'url':
      try {
        const url = new URL(sanitized);
        if (!['http:', 'https:'].includes(url.protocol)) {
          errors.push('Only HTTP/HTTPS URLs allowed');
        }
      } catch {
        errors.push('Invalid URL format');
      }
      break;
      
    case 'text':
      // Check for excessive length
      if (sanitized.length > 10000) {
        errors.push('Text too long');
      }
      // Check for suspicious patterns
      if (/\b(eval|Function|setTimeout|setInterval)\b/i.test(sanitized)) {
        errors.push('Potentially dangerous content detected');
      }
      break;
  }
  
  return {
    isValid: errors.length === 0,
    sanitized,
    errors
  };
};

// Security headers for API requests
export const getSecurityHeaders = (csrfToken?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };
  
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }
  
  return headers;
};

// Enhanced CSRF token generation
export const generateSecureCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Business context validation
export const validateBusinessContext = async (
  businessId: string,
  action: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('validate_business_access', {
      p_business_id: businessId
    });

    if (error) {
      console.error('Business validation error:', error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error('Business validation exception:', error);
    return false;
  }
};
