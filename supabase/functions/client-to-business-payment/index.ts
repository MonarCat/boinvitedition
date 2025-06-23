
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { clientEmail, clientPhone, businessId, amount, bookingId, paymentMethod = 'paystack' } = await req.json()

    // Enhanced validation
    if (!clientEmail || !businessId || !amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Security: Validate amount limits
    if (amount > 65000) {
      return new Response(
        JSON.stringify({ error: 'Amount exceeds maximum limit of KSh 65,000' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (amount < 10) {
      return new Response(
        JSON.stringify({ error: 'Minimum amount is KSh 10' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Calculate platform fee (5% standard, 6% for instant payout)
    const platformFeeRate = 0.05
    const platformFee = amount * platformFeeRate
    const businessAmount = amount - platformFee

    // Get Paystack secret key
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY')
    if (!paystackSecretKey) {
      throw new Error('Paystack secret key not configured')
    }

    // Create secure payment reference
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substr(2, 9)
    const paymentReference = `client-biz-${timestamp}-${randomId}`

    // Initialize payment with Paystack
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: clientEmail,
        amount: amount * 100, // Convert to kobo
        currency: 'KES',
        reference: paymentReference,
        callback_url: `${req.headers.get('origin')}/payment-success`,
        metadata: {
          business_id: businessId,
          booking_id: bookingId,
          client_email: clientEmail,
          client_phone: clientPhone,
          payment_type: 'client_to_business',
          platform_fee: platformFee,
          business_amount: businessAmount,
          timestamp: timestamp
        }
      })
    })

    const paystackData = await paystackResponse.json()

    if (!paystackData.status) {
      throw new Error(paystackData.message || 'Payment initialization failed')
    }

    // Create transaction record in Supabase
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { error: insertError } = await supabase
      .from('client_business_transactions')
      .insert({
        client_email: clientEmail,
        client_phone: clientPhone,
        business_id: businessId,
        booking_id: bookingId,
        amount: amount,
        platform_fee: platformFee,
        business_amount: businessAmount,
        payment_reference: paymentReference,
        paystack_reference: paystackData.data.reference,
        payment_method: paymentMethod,
        status: 'pending'
      })

    if (insertError) {
      console.error('Error creating transaction record:', insertError)
      // Don't fail the payment if logging fails
    }

    console.log('Payment initialized successfully:', {
      reference: paymentReference,
      amount: amount,
      businessId: businessId,
      clientEmail: clientEmail
    })

    return new Response(
      JSON.stringify({
        success: true,
        authorization_url: paystackData.data.authorization_url,
        reference: paystackData.data.reference,
        access_code: paystackData.data.access_code,
        payment_reference: paymentReference
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Client-to-business payment error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
