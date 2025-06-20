
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const handler = async (req: Request): Promise<Response> => {
  try {
    const url = new URL(req.url);
    const reference = url.searchParams.get('reference');
    
    if (!reference) {
      throw new Error('No reference provided');
    }

    console.log('Processing subscription callback for reference:', reference);

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

    // Verify transaction with Paystack
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
      }
    });

    const paystackData = await paystackResponse.json();
    console.log('Paystack Verification Response:', paystackData);

    if (!paystackData.status || paystackData.data.status !== 'success') {
      // Redirect to failure page
      return Response.redirect(`${Deno.env.get('SUPABASE_URL')}/subscription?payment=failed`, 302);
    }

    const metadata = paystackData.data.metadata;
    const { plan_type, business_id, billing_interval } = metadata;

    // Calculate subscription end date based on billing interval
    const now = new Date();
    let periodEnd = new Date(now);
    
    switch (billing_interval) {
      case 'quarterly':
        periodEnd.setMonth(periodEnd.getMonth() + 3);
        break;
      case 'biannual':
        periodEnd.setMonth(periodEnd.getMonth() + 6);
        break;
      case 'annual':
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        break;
      case '2year':
        periodEnd.setFullYear(periodEnd.getFullYear() + 2);
        break;
      case '3year':
        periodEnd.setFullYear(periodEnd.getFullYear() + 3);
        break;
      default: // monthly
        periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // Set plan limits based on plan type
    let staffLimit = null;
    let bookingsLimit = null;
    let notificationChannels = { email: true, sms: true, whatsapp: true };
    let featureFlags = { can_add_clients: true, client_data_retention: true };

    if (plan_type === 'starter') {
      staffLimit = 5;
      bookingsLimit = 1000;
      notificationChannels = { email: true, sms: false, whatsapp: false };
      featureFlags = { can_add_clients: false, client_data_retention: false };
    } else if (plan_type === 'medium') {
      staffLimit = 15;
      bookingsLimit = 3000;
    }

    // Get user_id from business
    const { data: business } = await supabaseClient
      .from('businesses')
      .select('user_id')
      .eq('id', business_id)
      .single();

    // Create or update subscription
    const { error: subscriptionError } = await supabaseClient
      .from('subscriptions')
      .upsert({
        user_id: business?.user_id,
        business_id: business_id,
        plan_type: plan_type,
        status: 'active',
        current_period_end: periodEnd.toISOString(),
        payment_interval: billing_interval,
        staff_limit: staffLimit,
        bookings_limit: bookingsLimit,
        notification_channels: notificationChannels,
        feature_flags: featureFlags,
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'business_id' 
      });

    if (subscriptionError) {
      console.error('Subscription creation error:', subscriptionError);
      throw subscriptionError;
    }

    // Log payment transaction
    await supabaseClient
      .from('payment_transactions')
      .insert({
        business_id: business_id,
        paystack_reference: reference,
        transaction_type: 'subscription_payment',
        amount: paystackData.data.amount / 100,
        currency: paystackData.data.currency,
        status: 'success',
        payment_method: paystackData.data.channel,
        metadata: metadata
      });

    // Redirect to success page
    return Response.redirect(`${Deno.env.get('SUPABASE_URL')}/app/subscription?payment=success&plan=${plan_type}`, 302);

  } catch (error: any) {
    console.error("Error in subscription-callback function:", error);
    return Response.redirect(`${Deno.env.get('SU)BASE_URL')}/app/subscription?payment=failed`, 302);
  }
};

serve(handler);
