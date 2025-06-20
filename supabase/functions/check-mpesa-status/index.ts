
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StatusCheckRequest {
  checkoutRequestId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { checkoutRequestId }: StatusCheckRequest = await req.json();

    console.log('Checking M-Pesa status for:', checkoutRequestId);

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

    // Check transaction status with Paystack
    const paystackResponse = await fetch(`https://api.paystack.co/charge/${checkoutRequestId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      }
    });

    const paystackData = await paystackResponse.json();
    console.log('Paystack Status Response:', paystackData);

    if (!paystackData.status) {
      throw new Error(paystackData.message || 'Failed to check payment status');
    }

    const transactionStatus = paystackData.data.status;
    let appStatus = 'pending';

    if (transactionStatus === 'success') {
      appStatus = 'completed';
      
      // Update transaction in database
      await supabaseClient
        .from('payment_transactions')
        .update({
          status: 'success',
          updated_at: new Date().toISOString()
        })
        .eq('paystack_reference', paystackData.data.reference);

    } else if (transactionStatus === 'failed' || transactionStatus === 'cancelled') {
      appStatus = 'failed';
      
      await supabaseClient
        .from('payment_transactions')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('paystack_reference', paystackData.data.reference);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        status: appStatus,
        reference: paystackData.data.reference,
        amount: paystackData.data.amount / 100, // Convert from kobo
        rawStatus: transactionStatus
      }),
      { 
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        } 
      }
    );

  } catch (error: any) {
    console.error("Error in check-mpesa-status function:", error);
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
