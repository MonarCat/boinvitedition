// Enhanced security utilities with comprehensive validation and sanitization

// XSS Prevention
export const sanitizeHtml = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>'"]/g, (char) => {
      const htmlEntities: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;'
      };
      return htmlEntities[char] || char;
    });
};

// Enhanced input sanitization
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .replace(/[<>'"&]/g, (char) => {
      const entities: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return entities[char] || char;
    })
    .slice(0, 1000); // Limit length
};

// Enhanced email validation
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  
  // RFC 5322 compliant regex (simplified)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  return emailRegex.test(email) && email.length <= 254;
};

// Business ID validation
export const validateBusinessId = (id: string): boolean => {
  if (!id || typeof id !== 'string') return false;
  
  // UUID v4 format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

// Phone number validation (international format)
export const validatePhoneNumber = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return false;
  
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Must be between 7 and 15 digits (international standard)
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
};

// Sanitize phone number
export const sanitizePhoneNumber = (phone: string): string => {
  if (!phone || typeof phone !== 'string') return '';
  
  // Keep only digits, +, -, (, ), and spaces
  return phone.replace(/[^0-9+\-() ]/g, '').slice(0, 20);
};

// Password strength validation
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;
  
  if (!password || typeof password !== 'string') {
    return { isValid: false, score: 0, feedback: ['Password is required'] };
  }
  
  // Length check
  if (password.length >= 8) score += 1;
  else feedback.push('Use at least 8 characters');
  
  if (password.length >= 12) score += 1;
  
  // Character variety checks
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Include lowercase letters');
  
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Include uppercase letters');
  
  if (/\d/.test(password)) score += 1;
  else feedback.push('Include numbers');
  
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  else feedback.push('Include special characters');
  
  // Common password checks
  const commonPasswords = ['password', '123456', 'qwerty', 'abc123', 'password123'];
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    score -= 2;
    feedback.push('Avoid common passwords');
  }
  
  return {
    isValid: score >= 4 && feedback.length === 0,
    score: Math.max(0, Math.min(5, score)),
    feedback
  };
};

// URL validation
export const validateUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

// Sanitize URL
export const sanitizeUrl = (url: string): string => {
  if (!url || typeof url !== 'string') return '';
  
  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return '';
    }
    return urlObj.toString();
  } catch {
    return '';
  }
};

// File name sanitization
export const sanitizeFileName = (fileName: string): string => {
  if (!fileName || typeof fileName !== 'string') return '';
  
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .slice(0, 100);
};

// SQL injection prevention for user-provided search terms
export const sanitizeSearchTerm = (term: string): string => {
  if (!term || typeof term !== 'string') return '';
  
  return term
    .replace(/['"`;\\]/g, '') // Remove SQL special characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .slice(0, 100);
};

// Content Security Policy helper
export const generateCSPNonce = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Rate limiting helper
export const createRateLimiter = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  return (identifier: string): boolean => {
    const now = Date.now();
    const record = requests.get(identifier);
    
    if (!record || now > record.resetTime) {
      requests.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (record.count >= maxRequests) {
      return false;
    }
    
    record.count++;
    return true;
  };
};

// Secure random string generation
export const generateSecureToken = (length: number = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Content validation for rich text
export const validateRichTextContent = (content: string): boolean => {
  if (!content || typeof content !== 'string') return false;
  
  // Basic HTML validation - only allow safe tags
  const allowedTags = /<\/?(?:p|br|strong|em|u|ol|ul|li|h[1-6]|blockquote)\b[^>]*>/gi;
  const strippedContent = content.replace(allowedTags, '');
  
  // Check for remaining HTML tags (potentially unsafe)
  return !/<[^>]+>/g.test(strippedContent);
};

// IP address validation
export const validateIPAddress = (ip: string): boolean => {
  if (!ip || typeof ip !== 'string') return false;
  
  // IPv4 regex
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  
  // IPv6 regex (simplified)
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};
