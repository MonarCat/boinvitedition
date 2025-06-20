
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

    console.log('Initiating M-Pesa payment for:', phoneNumber, 'Amount:', amount);

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

    // For now, we'll simulate the M-Pesa payment since Paystack might have IP restrictions
    // In production, you would use Paystack's mobile money API
    const mockReference = `MOCK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Log the transaction as pending
    const { error: insertError } = await supabaseClient
      .from('payment_transactions')
      .insert({
        paystack_reference: mockReference,
        transaction_type: metadata.planId ? 'subscription_payment' : 'booking_payment',
        amount: amount,
        currency: 'KES',
        status: 'pending',
        payment_method: 'mpesa_stk',
        metadata: {
          ...metadata,
          phone_number: phoneNumber,
          description: description,
          is_mock: true
        },
        business_id: metadata.businessId,
        booking_id: metadata.bookingId,
        subscription_id: metadata.subscriptionId
      });

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error('Failed to log transaction');
    }

    console.log('Mock STK push initiated successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'M-Pesa payment initiated successfully',
        reference: mockReference,
        checkoutRequestId: mockReference,
        status: 'pending',
        mock: true
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
