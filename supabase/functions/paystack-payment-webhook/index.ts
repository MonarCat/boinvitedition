
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-paystack-signature",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('x-paystack-signature');
    const body = await req.text();
    
    console.log('Paystack webhook received:', { signature: !!signature, bodyLength: body.length });

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify webhook signature (in production)
    const webhookSecret = Deno.env.get('PAYSTACK_WEBHOOK_SECRET');
    if (webhookSecret && signature) {
      const crypto = await import('https://deno.land/std@0.190.0/crypto/mod.ts');
      const encoder = new TextEncoder();
      const key = await crypto.importKey(
        'raw',
        encoder.encode(webhookSecret),
        { name: 'HMAC', hash: 'SHA-512' },
        false,
        ['sign']
      );
      
      const expectedSignature = await crypto.sign('HMAC', key, encoder.encode(body));
      const expectedHex = Array.from(new Uint8Array(expectedSignature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      if (signature !== expectedHex) {
        console.error('Invalid webhook signature');
        return new Response('Invalid signature', { status: 401, headers: corsHeaders });
      }
    }

    const event = JSON.parse(body);
    console.log('Processing Paystack event:', event.event);

    // Handle charge success event
    if (event.event === 'charge.success' && event.data.status === 'success') {
      const charge = event.data;
      const metadata = charge.metadata || {};
      
      console.log('Processing successful charge:', {
        reference: charge.reference,
        amount: charge.amount,
        metadata: metadata
      });

      // Log the successful payment transaction
      const { error: transactionError } = await supabaseClient
        .from('payment_transactions')
        .insert({
          paystack_reference: charge.reference,
          transaction_type: metadata.planId ? 'subscription_payment' : 'booking_payment',
          amount: charge.amount / 100, // Convert from kobo
          currency: charge.currency,
          status: 'success',
          payment_method: 'paystack',
          metadata: {
            ...metadata,
            paystack_charge_id: charge.id,
            channel: charge.channel,
            fees: charge.fees,
            customer_email: charge.customer.email,
            authorization_code: charge.authorization?.authorization_code
          },
          business_id: metadata.businessId,
          booking_id: metadata.bookingId,
          subscription_id: metadata.subscriptionId
        });

      if (transactionError) {
        console.error('Transaction logging error:', transactionError);
        throw new Error('Failed to log transaction');
      }

      // Handle subscription payments
      if (metadata.planId && metadata.businessId) {
        const planLimits = {
          starter: { staff_limit: 5, bookings_limit: 1000 },
          business: { staff_limit: 15, bookings_limit: 3000 },
          enterprise: { staff_limit: null, bookings_limit: null }
        };

        const limits = planLimits[metadata.planId as keyof typeof planLimits] || 
                      { staff_limit: 5, bookings_limit: 1000 };

        const subscriptionEndDate = new Date();
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

        const { error: subscriptionError } = await supabaseClient
          .from('subscriptions')
          .upsert({
            business_id: metadata.businessId,
            plan_type: metadata.planId,
            status: 'active',
            current_period_end: subscriptionEndDate.toISOString(),
            staff_limit: limits.staff_limit,
            bookings_limit: limits.bookings_limit,
            updated_at: new Date().toISOString()
          }, { 
            onConflict: 'business_id' 
          });

        if (subscriptionError) {
          console.error('Subscription update error:', subscriptionError);
        } else {
          console.log('Subscription updated successfully for business:', metadata.businessId);
        }
      }

      // Handle booking payments
      if (metadata.bookingId) {
        const { error: bookingError } = await supabaseClient
          .from('bookings')
          .update({
            payment_status: 'paid',
            payment_method: 'paystack',
            updated_at: new Date().toISOString()
          })
          .eq('id', metadata.bookingId);

        if (bookingError) {
          console.error('Booking update error:', bookingError);
        } else {
          console.log('Booking payment status updated:', metadata.bookingId);
        }
      }

      console.log('Paystack webhook processed successfully');
    }

    return new Response(
      JSON.stringify({ status: 'success', received: true }),
      { 
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        } 
      }
    );

  } catch (error: any) {
    console.error("Error in paystack-payment-webhook function:", error);
    return new Response(
      JSON.stringify({ 
        status: 'error',
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        } 
      }
    );
  }
};

serve(handler);
