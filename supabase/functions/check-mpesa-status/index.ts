
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

    console.log('Checking payment status for:', checkoutRequestId);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check transaction status in our database
    const { data: transaction, error } = await supabaseClient
      .from('payment_transactions')
      .select('*')
      .eq('paystack_reference', checkoutRequestId)
      .single();

    if (error || !transaction) {
      console.error('Transaction not found:', error);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Transaction not found'
        }),
        { 
          status: 404,
          headers: { 
            "Content-Type": "application/json", 
            ...corsHeaders 
          } 
        }
      );
    }

    // For mock transactions, simulate completion after 10 seconds
    if (transaction.metadata?.is_mock) {
      const createdAt = new Date(transaction.created_at);
      const now = new Date();
      const timeDiff = now.getTime() - createdAt.getTime();
      
      if (timeDiff > 10000) { // 10 seconds
        // Update transaction to completed
        await supabaseClient
          .from('payment_transactions')
          .update({
            status: 'success',
            updated_at: new Date().toISOString()
          })
          .eq('id', transaction.id);

        return new Response(
          JSON.stringify({ 
            success: true,
            status: 'completed',
            reference: transaction.paystack_reference,
            amount: transaction.amount,
            rawStatus: 'success'
          }),
          { 
            headers: { 
              "Content-Type": "application/json", 
              ...corsHeaders 
            } 
          }
        );
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        status: transaction.status === 'success' ? 'completed' : 'pending',
        reference: transaction.paystack_reference,
        amount: transaction.amount,
        rawStatus: transaction.status
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
