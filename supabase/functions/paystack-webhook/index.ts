
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const signature = req.headers.get('x-paystack-signature')
    const body = await req.text()
    
    // Verify webhook signature
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY')
    const webhookSecret = Deno.env.get('PAYSTACK_WEBHOOK_SECRET')
    
    if (!signature || !webhookSecret) {
      throw new Error('Missing webhook signature or secret')
    }

    const event = JSON.parse(body)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Handle different webhook events
    switch (event.event) {
      case 'charge.success':
        const charge = event.data
        const businessId = charge.metadata.business_id
        const planType = charge.metadata.plan_type
        const reference = charge.reference

        // Get plan limits
        const planLimits = {
          medium: { staff_limit: 15, bookings_limit: 1000 },
          premium: { staff_limit: null, bookings_limit: null }
        }

        const limits = planLimits[planType as keyof typeof planLimits] || { staff_limit: 5, bookings_limit: 100 }

        // Create or update subscription record
        const subscriptionEndDate = new Date()
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1)

        await supabase
          .from('subscriptions')
          .upsert({
            business_id: businessId,
            plan_type: planType,
            status: 'active',
            current_period_end: subscriptionEndDate.toISOString(),
            paystack_reference: reference,
            staff_limit: limits.staff_limit,
            bookings_limit: limits.bookings_limit,
            updated_at: new Date().toISOString()
          }, { 
            onConflict: 'business_id' 
          })
        
        break

      default:
        console.log(`Unhandled event type: ${event.event}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
