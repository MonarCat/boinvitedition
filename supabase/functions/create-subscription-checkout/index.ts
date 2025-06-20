
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckoutRequest {
  planType: string;
  businessId: string;
  customerEmail: string;
  interval: string;
}

const planPrices = {
  starter: { monthly: 1020, quarterly: 2907, biannual: 5508, annual: 10404, '2year': 19584, '3year': 27540 },
  medium: { monthly: 2900, quarterly: 8265, biannual: 15660, annual: 29580, '2year': 55680, '3year': 78300 },
  premium: { monthly: 9900, quarterly: 28215, biannual: 53460, annual: 100980, '2year': 190080, '3year': 267300 }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { planType, businessId, customerEmail, interval }: CheckoutRequest = await req.json();

    console.log('Creating subscription checkout for:', planType, interval);

    // Get Paystack secret key
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!paystackSecretKey) {
      throw new Error('Paystack secret key not configured');
    }

    // Get plan pricing
    const planConfig = planPrices[planType as keyof typeof planPrices];
    if (!planConfig) {
      throw new Error('Invalid plan type');
    }

    const amount = planConfig[interval as keyof typeof planConfig];
    if (!amount) {
      throw new Error('Invalid billing interval');
    }

    // Create payment link with Paystack
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: customerEmail,
        amount: amount * 100, // Convert to kobo
        currency: 'KES',
        callback_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/subscription-callback`,
        metadata: {
          plan_type: planType,
          business_id: businessId,
          billing_interval: interval,
          customer_email: customerEmail
        },
        channels: ['card', 'bank', 'ussd', 'mobile_money']
      })
    });

    const paystackData = await paystackResponse.json();
    console.log('Paystack Subscription Response:', paystackData);

    if (!paystackData.status) {
      throw new Error(paystackData.message || 'Failed to create checkout session');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        checkout_url: paystackData.data.authorization_url,
        reference: paystackData.data.reference
      }),
      { 
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        } 
      }
    );

  } catch (error: any) {
    console.error("Error in create-subscription-checkout function:", error);
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
