
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature',
}

// Rate limiting store with TTL
const rateLimitStore = new Map<string, { count: number; resetTime: number; firstRequest: number }>();

const checkRateLimit = (ip: string, maxRequests = 30, windowMs = 60000): boolean => {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs, firstRequest: now });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
};

// Secure HMAC validation with proper async handling
const validatePaystackSignature = async (payload: string, signature: string, secret: string): Promise<boolean> => {
  try {
    if (!payload || !signature || !secret) {
      return false;
    }

    // Remove 'sha512=' prefix if present
    const cleanSignature = signature.replace(/^sha512=/, '');
    
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const data = encoder.encode(payload);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw', 
      keyData, 
      { name: 'HMAC', hash: 'SHA-512' }, 
      false, 
      ['sign']
    );
    
    const hashBuffer = await crypto.subtle.sign('HMAC', cryptoKey, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Constant-time comparison to prevent timing attacks
    return hashHex === cleanSignature;
  } catch (error) {
    console.error('Signature validation error:', error);
    return false;
  }
};

// Enhanced input validation with sanitization
const validateAndSanitizeInput = (data: any): { isValid: boolean; errors: string[]; sanitizedData?: any } => {
  const errors: string[] = [];
  
  if (!data || typeof data !== 'object') {
    errors.push('Invalid request body');
    return { isValid: false, errors };
  }
  
  // Sanitize and validate event type
  if (!data.event || typeof data.event !== 'string') {
    errors.push('Missing or invalid event type');
  } else if (!/^[a-zA-Z_.]+$/.test(data.event)) {
    errors.push('Invalid event type format');
  }
  
  if (!data.data || typeof data.data !== 'object') {
    errors.push('Missing or invalid event data');
  }
  
  // Event-specific validation
  if (data.event === 'charge.success' && data.data) {
    if (!data.data.reference || typeof data.data.reference !== 'string') {
      errors.push('Missing payment reference');
    } else if (!/^[a-zA-Z0-9_-]+$/.test(data.data.reference)) {
      errors.push('Invalid payment reference format');
    }
    
    if (!data.data.metadata || typeof data.data.metadata !== 'object') {
      errors.push('Missing payment metadata');
    }
    
    if (!data.data.amount || typeof data.data.amount !== 'number' || data.data.amount <= 0) {
      errors.push('Missing or invalid amount');
    }
    
    // Validate business_id format in metadata
    if (data.data.metadata?.business_id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(data.data.metadata.business_id)) {
      errors.push('Invalid business ID format in metadata');
    }
  }
  
  const sanitizedData = {
    ...data,
    event: data.event?.replace(/[^a-zA-Z_.]/g, ''),
    data: {
      ...data.data,
      reference: data.data?.reference?.replace(/[^a-zA-Z0-9_-]/g, ''),
      metadata: data.data?.metadata
    }
  };
  
  return { isValid: errors.length === 0, errors, sanitizedData };
};

// Replay attack prevention
const replayProtection = new Map<string, number>();
const isReplayAttack = (signature: string, timestamp: number): boolean => {
  const now = Date.now();
  const fiveMinutesAgo = now - (5 * 60 * 1000);
  
  // Check if timestamp is too old
  if (timestamp < fiveMinutesAgo) {
    return true;
  }
  
  // Check if we've seen this signature recently
  if (replayProtection.has(signature)) {
    return true;
  }
  
  // Store signature with cleanup of old entries
  replayProtection.set(signature, timestamp);
  
  // Cleanup old entries (basic implementation)
  if (replayProtection.size > 1000) {
    const entries = Array.from(replayProtection.entries());
    entries.sort((a, b) => b[1] - a[1]);
    replayProtection.clear();
    entries.slice(0, 500).forEach(([sig, ts]) => replayProtection.set(sig, ts));
  }
  
  return false;
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    // Enhanced rate limiting
    if (!checkRateLimit(clientIP, 30, 60000)) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const signature = req.headers.get('x-paystack-signature');
    const body = await req.text();
    
    // Validate required headers
    if (!signature) {
      console.error(`Missing webhook signature from IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: 'Missing signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const webhookSecret = Deno.env.get('PAYSTACK_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('Webhook secret not configured');
      return new Response('Configuration error', { status: 500 });
    }

    // Enhanced signature validation
    const isValidSignature = await validatePaystackSignature(body, signature, webhookSecret);
    if (!isValidSignature) {
      console.error(`Invalid webhook signature from IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Replay attack protection
    const timestamp = Date.now();
    if (isReplayAttack(signature, timestamp)) {
      console.warn(`Replay attack detected from IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: 'Replay attack detected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate JSON
    let event;
    try {
      event = JSON.parse(body);
    } catch (error) {
      console.error('Invalid JSON in webhook body:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enhanced input validation
    const validation = validateAndSanitizeInput(event);
    if (!validation.isValid) {
      console.error('Input validation failed:', validation.errors);
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.errors }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use sanitized data
    event = validation.sanitizedData;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase configuration missing');
      return new Response('Configuration error', { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Log security event for successful webhook processing
    await supabase.rpc('log_security_event', {
      p_event_type: 'WEBHOOK_PROCESSED',
      p_description: `Paystack webhook processed: ${event.event}`,
      p_metadata: { 
        ip: clientIP, 
        event_type: event.event,
        reference: event.data?.reference,
        timestamp: new Date().toISOString()
      }
    });

    // Handle webhook events with enhanced security
    switch (event.event) {
      case 'charge.success':
        const charge = event.data;
        const businessId = charge.metadata?.business_id;
        const planType = charge.metadata?.plan_type;
        const reference = charge.reference;

        // Enhanced metadata validation
        if (!businessId || !planType) {
          console.error('Missing required metadata in payment');
          return new Response('Invalid payment metadata', { status: 400 });
        }

        // Validate business exists and is active
        const { data: business, error: businessError } = await supabase
          .from('businesses')
          .select('id, user_id, is_active')
          .eq('id', businessId)
          .eq('is_active', true)
          .single();

        if (businessError || !business) {
          console.error('Business not found or inactive:', businessError);
          await supabase.rpc('log_security_event', {
            p_event_type: 'INVALID_BUSINESS_PAYMENT',
            p_description: 'Payment attempted for invalid/inactive business',
            p_metadata: { business_id: businessId, reference }
          });
          return new Response('Business not found', { status: 404 });
        }

        // Validate plan type
        const validPlans = ['starter', 'medium', 'premium'];
        if (!validPlans.includes(planType)) {
          console.error('Invalid plan type:', planType);
          return new Response('Invalid plan type', { status: 400 });
        }

        // Enhanced plan limits
        const planLimits = {
          starter: { staff_limit: 5, bookings_limit: 1000 },
          medium: { staff_limit: 15, bookings_limit: 3000 },
          premium: { staff_limit: null, bookings_limit: null }
        };

        const limits = planLimits[planType as keyof typeof planLimits];
        const subscriptionEndDate = new Date();
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

        // Secure subscription update with transaction
        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: business.user_id,
            business_id: businessId,
            plan_type: planType,
            status: 'active',
            current_period_end: subscriptionEndDate.toISOString(),
            staff_limit: limits.staff_limit,
            bookings_limit: limits.bookings_limit,
            updated_at: new Date().toISOString()
          }, { 
            onConflict: 'business_id',
            ignoreDuplicates: false
          });

        if (subscriptionError) {
          console.error('Failed to update subscription:', subscriptionError);
          return new Response('Database error', { status: 500 });
        }

        // Log successful payment with enhanced security tracking
        await supabase
          .from('payment_transactions')
          .insert({
            business_id: businessId,
            amount: charge.amount / 100,
            currency: charge.currency?.toUpperCase() || 'NGN',
            status: 'completed',
            payment_method: 'paystack',
            paystack_reference: reference,
            transaction_type: 'subscription',
            metadata: { 
              plan_type: planType, 
              webhook_event: event.event,
              ip_address: clientIP,
              processed_at: new Date().toISOString()
            }
          });

        console.log('Subscription updated successfully for business:', businessId);
        break;

      default:
        console.log(`Unhandled event type: ${event.event}`);
    }

    return new Response(
      JSON.stringify({ received: true, status: 'success', timestamp: new Date().toISOString() }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    // Log security event for webhook errors
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.rpc('log_security_event', {
          p_event_type: 'WEBHOOK_ERROR',
          p_description: 'Webhook processing failed',
          p_metadata: { 
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          }
        });
      }
    } catch (logError) {
      console.error('Failed to log security event:', logError);
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: 'Webhook processing failed',
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
