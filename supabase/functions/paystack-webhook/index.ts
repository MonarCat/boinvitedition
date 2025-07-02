import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const validatePaystackSignature = async (body: string, signature: string, secret: string): Promise<boolean> => {
  try {
    if (!body || !signature || !secret) {
      return false;
    }

    // Remove 'sha512=' prefix if present
    const cleanSignature = signature.replace(/^sha512=/, '');
    
    // Encode the secret and body
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(body);

    // Import the secret as a key
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign']
    );

    // Sign the message
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

const validateInput = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data || typeof data !== 'object') {
    errors.push('Invalid request body');
    return { isValid: false, errors };
  }
  
  if (!data.event || typeof data.event !== 'string') {
    errors.push('Missing or invalid event type');
  }
  
  if (!data.data || typeof data.data !== 'object') {
    errors.push('Missing or invalid event data');
  }
  
  // Validate specific fields based on event type
  if (data.event === 'charge.success') {
    if (!data.data.reference || typeof data.data.reference !== 'string') {
      errors.push('Missing payment reference');
    }
    if (!data.data.metadata || typeof data.data.metadata !== 'object') {
      errors.push('Missing payment metadata');
    }
    if (!data.data.amount || typeof data.data.amount !== 'number') {
      errors.push('Missing or invalid amount');
    }
  }
  
  return { isValid: errors.length === 0, errors };
};

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

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase configuration missing');
    return new Response('Configuration error', { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}`);
      
      // Log security event
      await supabase.rpc('log_security_event', {
        p_event_type: 'WEBHOOK_RATE_LIMIT_EXCEEDED',
        p_description: `Webhook rate limit exceeded for IP: ${clientIP}`,
        p_metadata: { ip: clientIP, timestamp: new Date().toISOString() }
      });

      return new Response('Rate limit exceeded', { status: 429 });
    }

    const signature = req.headers.get('x-paystack-signature');
    const body = await req.text();
    
    // Verify webhook signature
    const webhookSecret = Deno.env.get('PAYSTACK_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('Webhook secret not configured');
      await supabase.rpc('log_security_event', {
        p_event_type: 'WEBHOOK_CONFIG_ERROR',
        p_description: 'Paystack webhook secret not configured',
        p_metadata: { ip: clientIP }
      });
      return new Response('Configuration error', { status: 500 });
    }

    if (!signature) {
      console.error('Missing webhook signature');
      await supabase.rpc('log_security_event', {
        p_event_type: 'MISSING_WEBHOOK_SIGNATURE',
        p_description: 'Webhook request missing signature',
        p_metadata: { ip: clientIP }
      });
      return new Response('Unauthorized', { status: 401 });
    }

    // Validate signature
    const isValidSignature = await validatePaystackSignature(body, signature, webhookSecret);
    if (!isValidSignature) {
      console.error('Invalid webhook signature');
      await supabase.rpc('log_security_event', {
        p_event_type: 'INVALID_WEBHOOK_SIGNATURE',
        p_description: 'Invalid Paystack webhook signature',
        p_metadata: { ip: clientIP, signature_present: !!signature }
      });
      return new Response('Unauthorized', { status: 401 });
    }

    let event;
    try {
      event = JSON.parse(body);
    } catch {
      console.error('Invalid JSON in webhook body');
      await supabase.rpc('log_security_event', {
        p_event_type: 'INVALID_WEBHOOK_JSON',
        p_description: 'Invalid JSON in webhook request',
        p_metadata: { ip: clientIP }
      });
      return new Response('Invalid JSON', { status: 400 });
    }

    // Validate input
    const validation = validateInput(event);
    if (!validation.isValid) {
      console.error('Input validation failed:', validation.errors);
      await supabase.rpc('log_security_event', {
        p_event_type: 'WEBHOOK_VALIDATION_FAILED',
        p_description: 'Webhook input validation failed',
        p_metadata: { ip: clientIP, errors: validation.errors }
      });
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.errors }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle different webhook events
    switch (event.event) {
      case 'charge.success':
        const charge = event.data;
        const businessId = charge.metadata?.business_id;
        const planType = charge.metadata?.plan_type;
        const paymentType = charge.metadata?.payment_type;
        const bookingId = charge.metadata?.booking_id;
        const reference = charge.reference;

        // Handle client-to-business payments
        if (paymentType === 'client_to_business' && businessId && bookingId) {
          console.log('Processing client-to-business payment:', { businessId, bookingId, reference });
          
          // 1. First, get booking details to access client info and service details
          const { data: bookingData, error: fetchBookingError } = await supabase
            .from('bookings')
            .select(`
              id, 
              client_id, 
              service_id, 
              date, 
              time, 
              status, 
              payment_status,
              total_amount,
              business_id
            `)
            .eq('id', bookingId)
            .single();
            
          if (fetchBookingError || !bookingData) {
            console.error('Failed to fetch booking data:', fetchBookingError);
            return new Response('Booking not found', { status: 404 });
          }

          // 2. Update booking status to confirmed and payment status to completed
          const { error: bookingError } = await supabase
            .from('bookings')
            .update({
              status: 'confirmed',
              payment_status: 'completed',
              payment_reference: reference,
              updated_at: new Date().toISOString()
            })
            .eq('id', bookingId);

          if (bookingError) {
            console.error('Failed to update booking:', bookingError);
          } else {
            console.log('Booking updated successfully:', bookingId);
          }

          // 3. Update client-business transaction status
          const { error: transactionError } = await supabase
            .from('client_business_transactions')
            .update({
              status: 'completed',
              paystack_reference: reference,
              updated_at: new Date().toISOString()
            })
            .eq('booking_id', bookingId);

          if (transactionError) {
            console.error('Failed to update transaction:', transactionError);
          }
          
          // 4. Record the payment in payment_transactions table to ensure revenue tracking
          const paymentAmount = charge.amount / 100; // Convert kobo to naira
          const { error: paymentRecordError } = await supabase
            .from('payment_transactions')
            .insert({
              business_id: businessId,
              amount: paymentAmount,
              currency: charge.currency?.toUpperCase() || 'NGN',
              status: 'completed',
              payment_method: 'paystack',
              paystack_reference: reference,
              transaction_type: 'client_to_business',
              metadata: { 
                booking_id: bookingId,
                client_id: bookingData.client_id,
                webhook_event: event.event
              }
            });
            
          if (paymentRecordError) {
            console.error('Failed to record payment transaction:', paymentRecordError);
          }
          
          // 5. Update business revenue metrics for dashboard
          const { error: revenueUpdateError } = await supabase.rpc('update_business_revenue_metrics', { 
            p_business_id: businessId,
            p_amount: paymentAmount
          });
          
          if (revenueUpdateError) {
            console.error('Failed to update business revenue metrics:', revenueUpdateError);
          }
          
          // 6. Update client status to ensure they appear in client list
          if (bookingData.client_id) {
            // First check if client exists
            const { data: clientData, error: clientFetchError } = await supabase
              .from('clients')
              .select('*')
              .eq('id', bookingData.client_id)
              .eq('business_id', businessId)
              .single();
              
            if (clientFetchError) {
              console.error('Error fetching client data:', clientFetchError);
            }
            
            // If client exists, update. If not, create new client record
            if (clientData) {
              const { error: clientUpdateError } = await supabase
                .from('clients')
                .update({ 
                  status: 'active',
                  last_booking_date: bookingData.date,
                  total_spent: (Number(clientData.total_spent || 0) + paymentAmount),
                  updated_at: new Date().toISOString()
                })
                .eq('id', bookingData.client_id)
                .eq('business_id', businessId);
                
              if (clientUpdateError) {
                console.error('Failed to update client status:', clientUpdateError);
              } else {
                console.log('Client data updated successfully');
              }
            } else {
              console.log('Client record not found, trying to fetch from booking data...');
              
              // Get booking client data
              const { data: bookingClientData, error: bookingClientError } = await supabase
                .from('bookings')
                .select('client_name, client_email, client_phone')
                .eq('id', bookingId)
                .single();
                
              if (!bookingClientError && bookingClientData) {
                // Create new client record
                const { error: createClientError } = await supabase
                  .from('clients')
                  .insert({
                    id: bookingData.client_id,
                    business_id: businessId,
                    name: bookingClientData.client_name,
                    email: bookingClientData.client_email,
                    phone: bookingClientData.client_phone,
                    status: 'active',
                    total_spent: paymentAmount,
                    last_booking_date: bookingData.date,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  });
                  
                if (createClientError) {
                  console.error('Failed to create client record:', createClientError);
                } else {
                  console.log('New client record created successfully');
                }
              }
            }
          }

          // Log successful client payment
          await supabase.rpc('log_security_event', {
            p_event_type: 'CLIENT_PAYMENT_SUCCESS',
            p_description: 'Client payment processed successfully',
            p_metadata: { 
              event_type: event.event,
              business_id: businessId,
              booking_id: bookingId,
              amount: charge.amount,
              reference: reference
            }
          });

          console.log('Client-to-business payment processed successfully');
          break;
        }

        // Handle subscription payments
        if (paymentType === 'subscription' && businessId) {
          console.log('Processing subscription payment:', { businessId, reference });
          
          // Validate business exists and user has access
          const { data: business, error: businessError } = await supabase
            .from('businesses')
            .select('id, user_id')
            .eq('id', businessId)
            .single();

          if (businessError || !business) {
            console.error('Business not found:', businessError);
            return new Response('Business not found', { status: 404 });
          }

          // Get plan limits with validation
          const planLimits = {
            starter: { staff_limit: 5, bookings_limit: 1000 },
            medium: { staff_limit: 15, bookings_limit: 3000 },
            premium: { staff_limit: null, bookings_limit: null }
          };

          const limits = planLimits[planType as keyof typeof planLimits];
          if (!limits) {
            console.error('Invalid plan type:', planType);
            return new Response('Invalid plan type', { status: 400 });
          }

          // Create subscription end date (1 month from now)
          const subscriptionEndDate = new Date();
          subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

          // Update subscription with proper error handling
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
              onConflict: 'business_id' 
            });

          if (subscriptionError) {
            console.error('Failed to update subscription:', subscriptionError);
            return new Response('Database error', { status: 500 });
          }

          // Log successful payment
          await supabase
            .from('payment_transactions')
            .insert({
              business_id: businessId,
              amount: charge.amount / 100, // Convert from kobo to naira
              currency: charge.currency?.toUpperCase() || 'NGN',
              status: 'completed',
              payment_method: 'paystack',
              paystack_reference: reference,
              transaction_type: 'subscription',
              metadata: { plan_type: planType, webhook_event: event.event }
            })
            .select()
            .single();

          // Log successful webhook processing
          await supabase.rpc('log_security_event', {
            p_event_type: 'WEBHOOK_PROCESSED_SUCCESS',
            p_description: 'Paystack webhook processed successfully',
            p_metadata: { 
              event_type: event.event,
              business_id: businessId,
              plan_type: planType,
              amount: charge.amount
            }
          });

          console.log('Subscription updated successfully for business:', businessId);
        } else {
          console.log(`Unhandled event type: ${event.event}`);
          await supabase.rpc('log_security_event', {
            p_event_type: 'UNHANDLED_WEBHOOK_EVENT',
            p_description: `Unhandled webhook event type: ${event.event}`,
            p_metadata: { event_type: event.event, ip: clientIP }
          });
        }

    return new Response(
      JSON.stringify({ received: true, status: 'success' }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    // Log the error
    if (supabase) {
      await supabase.rpc('log_security_event', {
        p_event_type: 'WEBHOOK_PROCESSING_ERROR',
        p_description: 'Webhook processing failed with error',
        p_metadata: { 
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        }
      });
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: 'Webhook processing failed'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
