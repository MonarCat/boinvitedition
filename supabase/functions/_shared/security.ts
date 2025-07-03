
// Security utilities for edge functions

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

const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data: protocols
    .replace(/vbscript:/gi, '') // Remove vbscript: protocols
    .replace(/[\x00-\x1f\x7f-\x9f]/g, '') // Remove control characters
    .trim();
};

export const detectSuspiciousActivity = (userAgent: string, ipAddress: string): boolean => {
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /automated/i,
    /curl/i,
    /wget/i,
    /postman/i
  ];

  return suspiciousPatterns.some(pattern => pattern.test(userAgent));
};
