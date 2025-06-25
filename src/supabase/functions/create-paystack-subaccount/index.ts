
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface SubaccountRequest {
  business_name: string;
  settlement_bank?: string;
  account_number?: string;
  percentage_charge?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!paystackSecretKey) {
      throw new Error('PAYSTACK_SECRET_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const requestData: SubaccountRequest = await req.json();
    
    const { business_name, settlement_bank, account_number, percentage_charge = 5 } = requestData;
    
    // Create subaccount with Paystack
    const paystackResponse = await fetch('https://api.paystack.co/subaccount', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        business_name,
        settlement_bank,
        account_number,
        percentage_charge, // Platform fee percentage
        description: `Subaccount for ${business_name} - Boinvit Platform`,
        primary_contact_email: 'support@boinvit.com',
        primary_contact_name: 'Boinvit Support',
        primary_contact_phone: '+254700000000',
        metadata: {
          platform: 'boinvit',
          created_at: new Date().toISOString()
        }
      }),
    });

    const paystackData = await paystackResponse.json();
    
    if (!paystackData.status) {
      throw new Error(paystackData.message || 'Failed to create subaccount');
    }

    return new Response(
      JSON.stringify({
        success: true,
        subaccount: paystackData.data,
        subaccount_code: paystackData.data.subaccount_code,
        message: 'Subaccount created successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Subaccount creation error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || 'Failed to create subaccount'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
