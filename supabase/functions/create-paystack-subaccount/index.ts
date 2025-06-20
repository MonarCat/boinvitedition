
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { businessId, businessName, businessEmail, settlementBank, accountNumber } = await req.json()

    console.log('Creating Paystack subaccount for:', { businessId, businessName, businessEmail })

    // Get Paystack secret key
    const paystackKey = Deno.env.get('PAYSTACK_SECRET_KEY')
    if (!paystackKey) {
      throw new Error('Paystack secret key not configured')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Create Paystack subaccount with automatic split
    const subaccountData = {
      business_name: businessName,
      settlement_bank: settlementBank || 'test-bank', // For testing - in production use real bank codes
      account_number: accountNumber || '0123456789', // For testing - in production use real account numbers
      percentage_charge: 7.0, // Platform takes 7% commission
      description: `Auto-split subaccount for ${businessName} - 93% to business, 7% to platform`,
      primary_contact_email: businessEmail,
      primary_contact_name: businessName,
      primary_contact_phone: null,
      metadata: {
        business_id: businessId,
        split_type: 'automatic',
        business_percentage: 93,
        platform_percentage: 7
      }
    }

    console.log('Subaccount data being sent:', subaccountData)

    const subaccountResponse = await fetch('https://api.paystack.co/subaccount', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subaccountData),
    })

    if (!subaccountResponse.ok) {
      const errorText = await subaccountResponse.text()
      console.error('Paystack subaccount creation error:', errorText)
      throw new Error(`Subaccount creation failed: ${errorText}`)
    }

    const subaccountResult = await subaccountResponse.json()
    console.log('Paystack subaccount created successfully:', subaccountResult.data)

    // Update business with subaccount information
    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        paystack_subaccount_id: subaccountResult.data.subaccount_code,
        updated_at: new Date().toISOString()
      })
      .eq('id', businessId)

    if (updateError) {
      console.error('Database update error:', updateError)
      throw new Error('Failed to save subaccount information to business record')
    }

    // Update subscription to enable auto-split payments
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .update({
        auto_split_enabled: true,
        paystack_subaccount_id: subaccountResult.data.subaccount_code,
        split_percentage: 7.0,
        updated_at: new Date().toISOString()
      })
      .eq('business_id', businessId)

    if (subscriptionError) {
      console.warn('Subscription update warning:', subscriptionError)
      // This is not a critical error, subaccount was created successfully
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        subaccount_code: subaccountResult.data.subaccount_code,
        settlement_bank: subaccountResult.data.settlement_bank,
        account_number: subaccountResult.data.account_number,
        percentage_charge: subaccountResult.data.percentage_charge,
        message: 'Paystack subaccount created successfully with automatic split configuration'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in create-paystack-subaccount function:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to create Paystack subaccount'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
