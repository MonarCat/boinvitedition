
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

    console.log('Creating Paystack subaccount for business:', businessId);

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

    // Get Paystack secret key
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!paystackSecretKey) {
      throw new Error('Paystack secret key not configured');
    }

    // Create subaccount with Paystack
    const paystackResponse = await fetch('https://api.paystack.co/subaccount', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        business_name: business.name,
        settlement_bank: "044", // Access Bank (default, can be changed later)
        account_number: "0123456789", // Temporary, business should update this
        percentage_charge: splitPercentage,
        description: `Subaccount for ${business.name}`,
        primary_contact_email: business.email || businessEmail,
        primary_contact_name: business.name,
        primary_contact_phone: business.phone,
        metadata: {
          business_id: businessId
        }
      })
    });

    const paystackData = await paystackResponse.json();
    console.log('Paystack Subaccount Response:', paystackData);

    if (!paystackData.status) {
      throw new Error(paystackData.message || 'Failed to create subaccount');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        subaccount_code: paystackData.data.subaccount_code,
        settlement_bank: paystackData.data.settlement_bank,
        account_number: paystackData.data.account_number,
        percentage_charge: paystackData.data.percentage_charge
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
