
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data: protocols
    .replace(/vbscript:/gi, '') // Remove vbscript: protocols
    .trim();
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone) && phone.length <= 20;
};

export const validateBusinessId = (businessId: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(businessId);
};

export const generateSecureToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const hashData = async (data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const validateCSRFToken = (token: string, expectedToken: string): boolean => {
  return token === expectedToken && token.length > 0;
};

export const detectSuspiciousActivity = (userAgent: string, ipAddress: string): boolean => {
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /automated/i,
    /curl/i,
    /wget/i
  ];

  return suspiciousPatterns.some(pattern => pattern.test(userAgent));
};

// Enhanced webhook signature validation using Web Crypto API
export const validateWebhookSignature = async (
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> => {
  try {
    if (!payload || !signature || !secret) {
      return false;
    }

    // Remove any prefixes from signature
    const cleanSignature = signature.replace(/^(sha512=|sha256=)/, '');
    
    // Encode the secret and payload
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(payload);

    // Import the secret as a key
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign']
    );

    // Sign the payload
    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    
    // Convert to hex string
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Timing-safe comparison
    return timingSafeEqual(hashHex, cleanSignature);
  } catch (error) {
    console.error('Webhook signature validation error:', error);
    return false;
  }
};

// Timing-safe string comparison to prevent timing attacks
const timingSafeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
};

export const sanitizeWebhookPayload = (payload: any): any => {
  if (typeof payload !== 'object' || payload === null) {
    return {};
  }

  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value;
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeWebhookPayload(value);
    }
  }
  
  return sanitized;
};

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export const logSecurityEvent = (eventType: string, details: Record<string, any>) => {
  console.warn(`Security Event: ${eventType}`, {
    timestamp: new Date().toISOString(),
    ...details
  });
  
  // Additional logging can be added here - only if gtag is available
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    try {
      window.gtag('event', 'security_event', {
        event_category: 'security',
        event_label: eventType,
        custom_parameter: JSON.stringify(details)
      });
    } catch (error) {
      console.warn('Failed to send analytics event:', error);
    }
  }
};

export const rateLimitKey = (identifier: string, action: string): string => {
  return `ratelimit:${action}:${identifier}`;
};

export const isValidRedirectUrl = (url: string, allowedDomains: string[]): boolean => {
  try {
    const urlObj = new URL(url);
    return allowedDomains.some(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
};

// Enhanced input validation with more comprehensive checks
export const validateAndSanitizeInput = (
  input: string,
  options: {
    maxLength?: number;
    allowedChars?: RegExp;
    required?: boolean;
  } = {}
): { isValid: boolean; sanitized: string; errors: string[] } => {
  const errors: string[] = [];
  
  if (options.required && (!input || input.trim().length === 0)) {
    errors.push('This field is required');
  }
  
  const sanitized = sanitizeInput(input);
  
  if (sanitized !== input) {
    errors.push('Some characters were removed for security reasons');
  }
  
  if (options.maxLength && sanitized.length > options.maxLength) {
    errors.push(`Input exceeds maximum length of ${options.maxLength} characters`);
  }
  
  if (options.allowedChars && !options.allowedChars.test(sanitized)) {
    errors.push('Input contains invalid characters');
  }
  
  return {
    isValid: errors.length === 0,
    sanitized,
    errors
  };
};
