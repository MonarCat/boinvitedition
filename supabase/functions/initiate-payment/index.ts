
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface PaymentRequest {
  phone?: string;
  amount: number;
  planId: string;
  businessId: string;
  customerEmail: string;
  provider: 'mpesa' | 'airtel' | 'card';
  currency: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const paymentRequest: PaymentRequest = await req.json();
    
    const { phone, amount, planId, businessId, customerEmail, provider, currency } = paymentRequest;
    
    // Generate unique reference
    const reference = `boinvit-${planId}-${Date.now()}`;
    
    let paystackResponse;
    const paystackAmount = amount * 100; // Convert to kobo/cents

    // Configure payment based on provider
    if (provider === 'mpesa') {
      // M-Pesa STK Push via Paystack
      paystackResponse = await fetch('https://api.paystack.co/charge', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: customerEmail,
          amount: paystackAmount,
          currency: 'KES',
          mobile_money: {
            phone: phone,
            provider: 'mpesa'
          },
          reference: reference,
          callback_url: `${req.url.split('/functions')[0]}/functions/payment-callback`,
          metadata: {
            plan_id: planId,
            business_id: businessId,
            provider: 'mpesa'
          }
        }),
      });
    } else if (provider === 'airtel') {
      // Airtel Money via Paystack
      paystackResponse = await fetch('https://api.paystack.co/charge', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: customerEmail,
          amount: paystackAmount,
          currency: 'KES',
          mobile_money: {
            phone: phone,
            provider: 'airtel'
          },
          reference: reference,
          callback_url: `${req.url.split('/functions')[0]}/functions/payment-callback`,
          metadata: {
            plan_id: planId,
            business_id: businessId,
            provider: 'airtel'
          }
        }),
      });
    } else if (provider === 'card') {
      // Card payment via Paystack
      paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: customerEmail,
          amount: paystackAmount,
          currency: currency.toUpperCase(),
          reference: reference,
          callback_url: `${req.url.split('/functions')[0]}/functions/payment-callback`,
          metadata: {
            plan_id: planId,
            business_id: businessId,
            provider: 'card'
          }
        }),
      });
    }

    const paystackData = await paystackResponse!.json();
    
    if (!paystackData.status) {
      throw new Error(paystackData.message || 'Payment initialization failed');
    }

    // Log payment transaction to Supabase
    const { error: insertError } = await supabase
      .from('payment_transactions')
      .insert({
        business_id: businessId,
        amount: amount,
        currency: currency.toUpperCase(),
        status: 'pending',
        payment_method: 'paystack',
        paystack_reference: reference,
        transaction_type: 'subscription',
        metadata: {
          plan_id: planId,
          provider: provider,
          phone: phone
        }
      });

    if (insertError) {
      console.error('Database insert error:', insertError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        reference: reference,
        authorization_url: paystackData.data?.authorization_url,
        access_code: paystackData.data?.access_code,
        message: `${provider.toUpperCase()} payment initiated successfully`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Payment initiation error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || 'Payment initiation failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
