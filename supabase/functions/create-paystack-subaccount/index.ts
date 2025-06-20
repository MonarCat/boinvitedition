
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubaccountRequest {
  businessId: string;
  businessEmail: string;
  splitPercentage: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessId, businessEmail, splitPercentage }: SubaccountRequest = await req.json();

    console.log('Creating subaccount for business:', businessId);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get business details
    const { data: business, error: businessError } = await supabaseClient
      .from('businesses')
      .select('name, phone, email')
      .eq('id', businessId)
      .single();

    if (businessError || !business) {
      throw new Error('Business not found');
    }

    // For now, create a mock subaccount since Paystack has IP restrictions
    const mockSubaccountCode = `ACCT_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    console.log('Mock subaccount created:', mockSubaccountCode);

    // Update the business subscription with the mock subaccount
    await supabaseClient
      .from('subscriptions')
      .update({
        paystack_subaccount_id: mockSubaccountCode,
        auto_split_enabled: true,
        split_percentage: splitPercentage,
        updated_at: new Date().toISOString()
      })
      .eq('business_id', businessId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        subaccount_code: mockSubaccountCode,
        settlement_bank: "044", // Access Bank
        account_number: "0123456789", // Mock account
        percentage_charge: splitPercentage,
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
    console.error("Error in create-paystack-subaccount function:", error);
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
