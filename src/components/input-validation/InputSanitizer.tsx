
import React from 'react';
import DOMPurify from 'dompurify';

interface SanitizedHtmlProps {
  html: string;
  className?: string;
  allowedTags?: string[];
}

export const SanitizedHtml: React.FC<SanitizedHtmlProps> = ({ 
  html, 
  className,
  allowedTags = ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li']
}) => {
  const sanitizedHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: ['class'],
    ALLOW_DATA_ATTR: false,
  });

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

// Input validation utilities
export const validateInput = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255;
  },

  phone: (phone: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  businessName: (name: string): boolean => {
    return name.length >= 2 && name.length <= 100 && !/[<>]/.test(name);
  },

  url: (url: string): boolean => {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  },

  sanitizeString: (input: string): string => {
    return input.replace(/[<>'"]/g, '').trim();
  },

  sanitizeNumber: (input: string): number | null => {
    const num = parseFloat(input);
    return isNaN(num) ? null : num;
  }
};

// Rate limiting hook
export const useRateLimit = (maxRequests: number = 10, windowMs: number = 60000) => {
  const [requests, setRequests] = React.useState<number[]>([]);

  const checkRateLimit = (): boolean => {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Filter requests within the current window
    const recentRequests = requests.filter(time => time > windowStart);
    
    if (recentRequests.length >= maxRequests) {
      return false; // Rate limit exceeded
    }

    // Add current request
    setRequests([...recentRequests, now]);
    return true; // Request allowed
  };

  return { checkRateLimit };
};

// Input sanitizer hook - this was missing and causing the import error
export const useInputSanitizer = () => {
  const sanitizeText = (input: string, options?: { maxLength?: number }) => {
    let sanitized = input.replace(/[<>'"]/g, '').trim();
    if (options?.maxLength) {
      sanitized = sanitized.substring(0, options.maxLength);
    }
    return sanitized;
  };

  const sanitizeEmail = (email: string) => {
    return email.toLowerCase().trim().replace(/[<>'"]/g, '');
  };

  const sanitizePhone = (phone: string) => {
    return phone.replace(/[^+\d\s()-]/g, '').trim();
  };

  const validateRequired = (value: string, fieldName: string) => {
    if (!value || value.trim().length === 0) {
      return `${fieldName} is required`;
    }
    return null;
  };

  return {
    sanitizeText,
    sanitizeEmail,
    sanitizePhone,
    validateRequired
  };
};
