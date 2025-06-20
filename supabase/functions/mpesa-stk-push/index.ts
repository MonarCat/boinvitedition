
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface STKPushRequest {
  phoneNumber: string;
  amount: number;
  description: string;
  metadata?: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber, amount, description, metadata = {} }: STKPushRequest = await req.json();

    console.log('Initiating STK Push for:', phoneNumber, 'Amount:', amount);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get Paystack secret key
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!paystackSecretKey) {
      throw new Error('Paystack secret key not configured');
    }

    // Use Paystack's mobile money API for M-Pesa STK Push
    const paystackResponse = await fetch('https://api.paystack.co/charge', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: metadata.userEmail || 'customer@example.com',
        amount: amount * 100, // Convert to kobo
        currency: 'KES',
        mobile_money: {
          phone: phoneNumber,
          provider: 'mpesa'
        },
        metadata: {
          ...metadata,
          description,
          payment_method: 'mpesa_stk'
        }
      })
    });

    const paystackData = await paystackResponse.json();
    console.log('Paystack STK Response:', paystackData);

    if (!paystackData.status) {
      throw new Error(paystackData.message || 'Failed to initiate STK push');
    }

    // Log the transaction
    await supabaseClient
      .from('payment_transactions')
      .insert({
        paystack_reference: paystackData.data.reference,
        transaction_type: metadata.planId ? 'subscription_payment' : 'booking_payment',
        amount: amount,
        currency: 'KES',
        status: 'pending',
        payment_method: 'mpesa_stk',
        metadata: {
          ...metadata,
          paystack_charge_id: paystackData.data.id,
          phone_number: phoneNumber
        },
        business_id: metadata.businessId,
        booking_id: metadata.bookingId,
        subscription_id: metadata.subscriptionId
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'STK push initiated successfully',
        reference: paystackData.data.reference,
        checkoutRequestId: paystackData.data.id,
        status: paystackData.data.status
      }),
      { 
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        } 
      }
    );

  } catch (error: any) {
    console.error("Error in mpesa-stk-push function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
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
