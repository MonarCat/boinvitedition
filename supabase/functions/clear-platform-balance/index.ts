import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createSecureCorsHeaders } from '../_shared/cors.ts'

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
    return new Response(JSON.stringify({ error: 'Configuration error' }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { business_id } = await req.json();
    
    if (!business_id) {
      return new Response(JSON.stringify({ error: 'business_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get business and balance information
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select(`
        id,
        name,
        email,
        platform_balance,
        user_id,
        subscriptions (
          subscription_balance_due
        )
      `)
      .eq('id', business_id)
      .single();

    if (businessError || !business) {
      console.error('Business not found:', businessError);
      return new Response(JSON.stringify({ error: 'Business not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Calculate total amount due
    const platformBalance = business.platform_balance || 0;
    const subscriptionBalance = business.subscriptions?.[0]?.subscription_balance_due || 0;
    const totalDue = platformBalance + subscriptionBalance;

    if (totalDue <= 0) {
      return new Response(JSON.stringify({ error: 'No balance due' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Convert to kobo (Paystack uses smallest currency unit)
    const amountInKobo = Math.round(totalDue * 100);

    // Get user email for Paystack
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(business.user_id);
    
    if (userError || !user) {
      console.error('User not found:', userError);
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize Paystack transaction
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: user.email || business.email,
        amount: amountInKobo,
        currency: 'KES',
        reference: `PLT_${Date.now()}_${business_id.slice(0, 8)}`,
        callback_url: `${supabaseUrl}/functions/v1/paystack-callback`,
        metadata: {
          payment_type: 'platform_clearance',
          business_id: business_id,
          business_name: business.name,
          platform_balance: platformBalance,
          subscription_balance: subscriptionBalance,
          total_due: totalDue
        }
      })
    });

    if (!paystackResponse.ok) {
      const errorData = await paystackResponse.text();
      console.error('Paystack initialization failed:', errorData);
      return new Response(JSON.stringify({ error: 'Payment initialization failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      console.error('Paystack error:', paystackData.message);
      return new Response(JSON.stringify({ error: paystackData.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Log the payment initiation
    await supabase.rpc('log_security_event_enhanced', {
      p_event_type: 'PLATFORM_PAYMENT_INITIATED',
      p_description: 'Platform balance payment initiated',
      p_metadata: {
        business_id,
        amount: totalDue,
        reference: paystackData.data.reference
      },
      p_severity: 'low'
    });

    return new Response(JSON.stringify({
      success: true,
      authorization_url: paystackData.data.authorization_url,
      access_code: paystackData.data.access_code,
      reference: paystackData.data.reference,
      amount: totalDue,
      platform_balance: platformBalance,
      subscription_balance: subscriptionBalance
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Error in clear-platform-balance:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
