
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rate limiting store with cleanup
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

const checkRateLimit = (ip: string, maxRequests = 50, windowMs = 60000): boolean => {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
};

const validateWebhookSignature = async (payload: string, signature: string, secret: string): Promise<boolean> => {
  try {
    if (!payload || !signature || !secret) {
      return false;
    }

    // Remove any prefix from signature
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
    console.error('Signature validation error:', error);
    return false;
  }
};

// Timing-safe string comparison
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

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let supabaseClient: any;

  try {
    supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}`);
      
      // Log security event
      await supabaseClient.rpc('log_security_event', {
        p_event_type: 'WEBHOOK_RATE_LIMIT',
        p_description: `Enhanced webhook rate limit exceeded for IP: ${clientIP}`,
        p_metadata: { ip: clientIP, timestamp: new Date().toISOString() }
      });

      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const body = await req.text();
    const signature = req.headers.get('x-webhook-signature') || '';
    const webhookSecret = Deno.env.get('WEBHOOK_SECRET');

    // Validate webhook signature
    if (!webhookSecret) {
      console.warn('Webhook secret not configured');
      
      await supabaseClient.rpc('log_security_event', {
        p_event_type: 'WEBHOOK_CONFIG_ERROR',
        p_description: 'Webhook secret not configured',
        p_metadata: { ip: clientIP }
      });

      return new Response(
        JSON.stringify({ error: 'Configuration error' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const isValidSignature = await validateWebhookSignature(body, signature, webhookSecret);
    
    if (!isValidSignature) {
      console.warn(`Invalid webhook signature from IP: ${clientIP}`);
      
      // Log security event
      await supabaseClient.rpc('log_security_event', {
        p_event_type: 'INVALID_WEBHOOK_SIGNATURE',
        p_description: `Invalid enhanced webhook signature detected`,
        p_metadata: { 
          ip: clientIP, 
          signature_present: signature.length > 0,
          timestamp: new Date().toISOString()
        }
      });

      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Process webhook payload
    let webhookData;
    try {
      webhookData = JSON.parse(body);
    } catch (error) {
      console.error('Invalid JSON payload:', error);
      
      await supabaseClient.rpc('log_security_event', {
        p_event_type: 'INVALID_WEBHOOK_JSON',
        p_description: 'Invalid JSON in enhanced webhook payload',
        p_metadata: { ip: clientIP }
      });
      
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Log successful webhook processing
    await supabaseClient.rpc('log_security_event', {
      p_event_type: 'WEBHOOK_PROCESSED_SUCCESS',
      p_description: 'Enhanced webhook processed successfully',
      p_metadata: { 
        webhook_type: webhookData.type || 'unknown',
        ip: clientIP,
        timestamp: new Date().toISOString()
      }
    });

    console.log('Enhanced webhook processed successfully:', webhookData.type || 'unknown');

    return new Response(
      JSON.stringify({ success: true, processed: true }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Enhanced webhook processing error:', error);
    
    // Log the error if supabase client is available
    if (supabaseClient) {
      try {
        await supabaseClient.rpc('log_security_event', {
          p_event_type: 'WEBHOOK_PROCESSING_ERROR',
          p_description: 'Enhanced webhook processing failed',
          p_metadata: { 
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          }
        });
      } catch (logError) {
        console.error('Failed to log webhook error:', logError);
      }
    }
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})
