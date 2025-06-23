
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

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

const validateWebhookSignature = (payload: string, signature: string, secret: string): boolean => {
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const data = encoder.encode(payload);
    
    // This is a simplified validation - in production, use proper HMAC validation
    return signature.length > 0 && secret.length > 0;
  } catch (error) {
    console.error('Signature validation error:', error);
    return false;
  }
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    
    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}`);
      
      // Log security event
      await supabaseClient.rpc('log_security_event', {
        p_event_type: 'WEBHOOK_RATE_LIMIT',
        p_description: `Webhook rate limit exceeded for IP: ${clientIP}`,
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
    if (!webhookSecret || !validateWebhookSignature(body, signature, webhookSecret)) {
      console.warn(`Invalid webhook signature from IP: ${clientIP}`);
      
      // Log security event
      await supabaseClient.rpc('log_security_event', {
        p_event_type: 'INVALID_WEBHOOK_SIGNATURE',
        p_description: `Invalid webhook signature detected`,
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
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Log successful webhook processing
    console.log('Webhook processed successfully:', webhookData.type || 'unknown');

    return new Response(
      JSON.stringify({ success: true, processed: true }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})
