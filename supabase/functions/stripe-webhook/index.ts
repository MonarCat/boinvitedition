
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Secure webhook signature validation for Stripe
const validateStripeWebhookSignature = async (
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> => {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    // Extract timestamp and signature from Stripe signature header
    const elements = signature.split(',');
    let timestamp = '';
    let sig = '';
    
    for (const element of elements) {
      const [key, value] = element.split('=');
      if (key === 't') timestamp = value;
      if (key === 'v1') sig = value;
    }
    
    if (!timestamp || !sig) return false;
    
    // Check timestamp to prevent replay attacks (5 minutes tolerance)
    const webhookTimestamp = parseInt(timestamp) * 1000;
    const currentTime = Date.now();
    if (Math.abs(currentTime - webhookTimestamp) > 300000) { // 5 minutes
      console.error('Webhook timestamp too old');
      return false;
    }
    
    // Create the signed payload
    const signedPayload = timestamp + '.' + payload;
    
    const expectedSignature = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(signedPayload)
    );
    
    const expectedHex = Array.from(new Uint8Array(expectedSignature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return timingSafeEqual(expectedHex, sig);
  } catch (error) {
    console.error('Stripe webhook signature validation error:', error);
    return false;
  }
};

// Timing-safe comparison to prevent timing attacks
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
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('stripe-signature')
    const body = await req.text()
    
    // Get environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    
    if (!signature || !webhookSecret) {
      throw new Error('Missing webhook signature or secret')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Validate webhook signature
    const isValid = await validateStripeWebhookSignature(body, signature, webhookSecret);
    
    if (!isValid) {
      console.error('Invalid Stripe webhook signature');
      
      // Log security event
      await supabase.rpc('log_security_event_enhanced', {
        p_event_type: 'INVALID_STRIPE_WEBHOOK_SIGNATURE',
        p_description: 'Invalid Stripe webhook signature detected',
        p_metadata: {
          signature_provided: !!signature,
          body_length: body.length
        },
        p_severity: 'high'
      });
      
      return new Response('Unauthorized', { 
        status: 401, 
        headers: corsHeaders 
      });
    }

    const event = JSON.parse(body)

    // Log webhook reception
    await supabase.rpc('log_security_event_enhanced', {
      p_event_type: 'STRIPE_WEBHOOK_RECEIVED',
      p_description: `Stripe webhook received: ${event.type}`,
      p_metadata: {
        event_type: event.type,
        event_id: event.id
      },
      p_severity: 'low'
    });

    // Handle different webhook events
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object
        const businessId = session.metadata.business_id
        const planType = session.metadata.plan_type
        const subscriptionId = session.subscription

        // Create subscription record
        await supabase
          .rpc('create_paid_subscription', {
            business_id: businessId,
            plan_type: planType,
            stripe_subscription_id: subscriptionId
          })
        
        break

      case 'customer.subscription.deleted':
        // Handle subscription cancellation
        const deletedSub = event.data.object
        await supabase
          .rpc('cancel_subscription', {
            stripe_subscription_id: deletedSub.id
          })
        
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Stripe webhook processing error:', error);
    
    try {
      // Initialize Supabase client for error logging
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseKey)
      
      // Log webhook error
      await supabase.rpc('log_security_event_enhanced', {
        p_event_type: 'STRIPE_WEBHOOK_ERROR',
        p_description: 'Error processing Stripe webhook',
        p_metadata: {
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        p_severity: 'medium'
      });
    } catch (logError) {
      console.error('Failed to log security event:', logError);
    }
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
