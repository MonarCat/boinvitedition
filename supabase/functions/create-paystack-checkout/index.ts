
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { planType, businessId, customerEmail } = await req.json()

    // Get Paystack secret key from environment
    const paystackKey = Deno.env.get('PAYSTACK_SECRET_KEY')
    if (!paystackKey) {
      throw new Error('Paystack secret key not configured')
    }

    // Define price amounts for each plan (in kobo - smallest currency unit)
    const planPrices = {
      medium: 2900, // KES 29 in kobo
      premium: 9900  // KES 99 in kobo
    }

    if (!planPrices[planType as keyof typeof planPrices]) {
      throw new Error('Invalid plan type')
    }

    // Create Paystack transaction
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: customerEmail,
        amount: planPrices[planType as keyof typeof planPrices],
        currency: 'KES',
        callback_url: `${new URL(req.url).origin}/subscription/success`,
        metadata: {
          business_id: businessId,
          plan_type: planType,
        },
        channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer']
      }),
    })

    if (!paystackResponse.ok) {
      const error = await paystackResponse.text()
      throw new Error(`Paystack error: ${error}`)
    }

    const transaction = await paystackResponse.json()

    return new Response(
      JSON.stringify({ 
        url: transaction.data.authorization_url,
        reference: transaction.data.reference 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
