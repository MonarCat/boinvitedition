
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const reference = url.pathname.split('/').pop();
    
    if (!reference) {
      throw new Error('Payment reference is required');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check Paystack transaction status
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const paystackData = await paystackResponse.json();
    
    if (!paystackData.status) {
      throw new Error('Failed to verify payment status');
    }

    const transaction = paystackData.data;
    let status = 'pending';

    // Map Paystack status to our status
    if (transaction.status === 'success') {
      status = 'success';
      
      // Update subscription if payment successful
      const metadata = transaction.metadata;
      if (metadata?.business_id && metadata?.plan_id) {
        // Get business owner
        const { data: business } = await supabase
          .from('businesses')
          .select('user_id')
          .eq('id', metadata.business_id)
          .single();

        if (business) {
          // Create subscription end date (1 month from now)
          const subscriptionEndDate = new Date();
          subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

          // Updated plan limits with new pricing
          const planLimits: { [key: string]: { staff_limit: number | null; bookings_limit: number | null } } = {
            trial: { staff_limit: 3, bookings_limit: 100 },
            starter: { staff_limit: 5, bookings_limit: 1000 },
            business: { staff_limit: 15, bookings_limit: 5000 },
            enterprise: { staff_limit: null, bookings_limit: null }
          };

          const limits = planLimits[metadata.plan_id] || { staff_limit: 3, bookings_limit: 100 };

          // Upsert subscription
          await supabase
            .from('subscriptions')
            .upsert({
              user_id: business.user_id,
              business_id: metadata.business_id,
              plan_type: metadata.plan_id,
              status: 'active',
              current_period_end: subscriptionEndDate.toISOString(),
              staff_limit: limits.staff_limit,
              bookings_limit: limits.bookings_limit,
              updated_at: new Date().toISOString()
            }, { 
              onConflict: 'business_id' 
            });
        }
      }
    } else if (transaction.status === 'failed' || transaction.status === 'cancelled') {
      status = 'failed';
    }

    // Update payment transaction status
    await supabase
      .from('payment_transactions')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('paystack_reference', reference);

    return new Response(
      JSON.stringify({
        success: true,
        status: status,
        transaction: transaction
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Status check error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        status: 'error',
        message: error.message || 'Status check failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
