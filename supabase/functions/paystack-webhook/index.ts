
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createSecureCorsHeaders } from '../_shared/cors.ts'
import { validateWebhookSignature, sanitizeWebhookPayload } from '../_shared/security.ts'

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = await createSecureCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const paystackSecret = Deno.env.get('PAYSTACK_SECRET_KEY');
  
  if (!supabaseUrl || !supabaseKey || !paystackSecret) {
    console.error('Missing required environment variables');
    return new Response('Configuration error', { 
      status: 500, 
      headers: corsHeaders 
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Get raw body for signature validation
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature');
    
    // Validate webhook signature for security
    if (!signature || !await validateWebhookSignature(rawBody, signature, paystackSecret)) {
      console.error('Invalid webhook signature');
      
      // Log security event
      await supabase.rpc('log_security_event_enhanced', {
        p_event_type: 'INVALID_WEBHOOK_SIGNATURE',
        p_description: 'Invalid Paystack webhook signature detected',
        p_metadata: {
          origin,
          signature_provided: !!signature,
          body_length: rawBody.length
        },
        p_severity: 'high'
      });
      
      return new Response('Unauthorized', { 
        status: 401, 
        headers: corsHeaders 
      });
    }

    // Parse and sanitize the webhook payload
    const rawPayload = JSON.parse(rawBody);
    const payload = sanitizeWebhookPayload(rawPayload);
    
    console.log('Received Paystack webhook:', payload.event);

    // Log webhook reception
    await supabase.rpc('log_security_event_enhanced', {
      p_event_type: 'WEBHOOK_RECEIVED',
      p_description: `Paystack webhook received: ${payload.event}`,
      p_metadata: {
        event: payload.event,
        reference: payload.data?.reference,
        amount: payload.data?.amount
      },
      p_severity: 'low'
    });

    // Handle different webhook events
    if (payload.event === 'charge.success') {
      const { data } = payload;
      const reference = data.reference;
      const amount = data.amount / 100; // Convert from kobo to naira/KES
      const customerEmail = data.customer?.email;
      
      console.log('Processing successful charge:', { reference, amount, customerEmail });

      // Validate payment amount
      if (amount <= 0 || amount > 1000000) {
        console.error('Invalid payment amount:', amount);
        await supabase.rpc('log_security_event_enhanced', {
          p_event_type: 'SUSPICIOUS_PAYMENT_AMOUNT',
          p_description: 'Suspicious payment amount in webhook',
          p_metadata: {
            amount,
            reference,
            customer_email: customerEmail
          },
          p_severity: 'high'
        });
        
        return new Response('Invalid amount', { 
          status: 400, 
          headers: corsHeaders 
        });
      }

      // Find the corresponding transaction
      const { data: transaction, error: fetchError } = await supabase
        .from('client_business_transactions')
        .select('*')
        .eq('paystack_reference', reference)
        .single();

      if (fetchError || !transaction) {
        console.error('Transaction not found:', reference, fetchError);
        return new Response('Transaction not found', { 
          status: 404, 
          headers: corsHeaders 
        });
      }

      // Validate business ownership before processing
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select('id, user_id')
        .eq('id', transaction.business_id)
        .single();

      if (businessError || !business) {
        console.error('Business validation failed:', businessError);
        return new Response('Business validation failed', { 
          status: 403, 
          headers: corsHeaders 
        });
      }

      // Update transaction status
      const { error: updateError } = await supabase
        .from('client_business_transactions')
        .update({
          status: 'completed',
          payment_method: data.authorization?.channel || 'card',
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction.id);

      if (updateError) {
        console.error('Failed to update transaction:', updateError);
        return new Response('Update failed', { 
          status: 500, 
          headers: corsHeaders 
        });
      }

      // Update associated booking if exists
      if (transaction.booking_id) {
        const { error: bookingError } = await supabase
          .from('bookings')
          .update({
            payment_status: 'completed',
            status: 'confirmed',
            payment_reference: reference,
            updated_at: new Date().toISOString()
          })
          .eq('id', transaction.booking_id);

        if (bookingError) {
          console.error('Failed to update booking:', bookingError);
        }
      }

      // Record payment transaction for analytics
      const { error: paymentError } = await supabase
        .from('payment_transactions')
        .insert({
          business_id: transaction.business_id,
          booking_id: transaction.booking_id,
          amount: amount,
          currency: 'KES',
          status: 'completed',
          payment_method: data.authorization?.channel || 'card',
          paystack_reference: reference,
          transaction_type: 'client_to_business',
          metadata: {
            webhook_event: 'charge.success',
            customer_email: customerEmail,
            authorization: data.authorization
          }
        });

      if (paymentError) {
        console.error('Failed to record payment transaction:', paymentError);
      }

      // Log successful payment processing
      await supabase.rpc('log_security_event_enhanced', {
        p_event_type: 'PAYMENT_PROCESSED',
        p_description: 'Payment successfully processed via webhook',
        p_metadata: {
          reference,
          amount,
          business_id: transaction.business_id,
          customer_email: customerEmail
        },
        p_severity: 'low'
      });

      console.log('Payment processing completed successfully');
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    // Log webhook error
    await supabase.rpc('log_security_event_enhanced', {
      p_event_type: 'WEBHOOK_ERROR',
      p_description: 'Error processing Paystack webhook',
      p_metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        origin
      },
      p_severity: 'medium'
    });
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
