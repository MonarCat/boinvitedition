
import { createHmac } from 'crypto';

export const validatePaystackSignature = async (
  body: string, 
  signature: string, 
  secret: string
): Promise<boolean> => {
  try {
    if (!body || !signature || !secret) {
      return false;
    }

    // Remove 'sha512=' prefix if present
    const cleanSignature = signature.replace(/^sha512=/, '');
    
    // Create HMAC hash using the secret
    const hash = createHmac('sha512', secret)
      .update(body, 'utf8')
      .digest('hex');
    
    // Compare signatures using timing-safe comparison
    return timingSafeEqual(hash, cleanSignature);
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

export const validateWebhookTimestamp = (timestamp: string): boolean => {
  try {
    const webhookTime = new Date(timestamp);
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    return webhookTime >= fiveMinutesAgo && webhookTime <= now;
  } catch {
    return false;
  }
};

export const sanitizeWebhookData = (data: any): any => {
  if (typeof data !== 'object' || data === null) {
    return {};
  }

  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Basic sanitization for webhook data
      sanitized[key] = value
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .trim();
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value;
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeWebhookData(value);
    }
  }
  
  return sanitized;
};
