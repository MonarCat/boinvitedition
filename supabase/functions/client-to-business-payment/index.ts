
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== Client-to-Business Payment Function Started ===');
    
    const requestBody = await req.json().catch(() => ({}));
    console.log('Request body:', requestBody);

    const { clientEmail, clientPhone, businessId, amount, bookingId, paymentMethod = 'paystack' } = requestBody;

    // Enhanced validation with detailed error messages
    if (!clientEmail) {
      console.error('Missing clientEmail');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Client email is required' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!businessId) {
      console.error('Missing businessId');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Business ID is required' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!amount || isNaN(Number(amount))) {
      console.error('Invalid amount:', amount);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Valid amount is required' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const numericAmount = Number(amount);

    // Security: Validate amount limits
    if (numericAmount > 65000) {
      console.error('Amount exceeds limit:', numericAmount);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Amount exceeds maximum limit of KSh 65,000' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (numericAmount < 10) {
      console.error('Amount below minimum:', numericAmount);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Minimum amount is KSh 10' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Calculate platform fee (5% standard)
    const platformFeeRate = 0.05;
    const platformFee = numericAmount * platformFeeRate;
    const businessAmount = numericAmount - platformFee;

    console.log('Fee calculation:', { numericAmount, platformFee, businessAmount });

    // Get Paystack secret key
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!paystackSecretKey) {
      console.error('Paystack secret key not configured');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Payment service configuration error. Please contact support.' 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create secure payment reference
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const paymentReference = `client-biz-${timestamp}-${randomId}`;

    console.log('Payment reference generated:', paymentReference);

    let paystackResponse;
    let paystackData;

    if (paymentMethod === 'mpesa' && clientPhone) {
      // Format phone number for M-Pesa (ensure it starts with 254)
      let formattedPhone = clientPhone.replace(/\D/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '254' + formattedPhone.slice(1);
      }
      if (!formattedPhone.startsWith('254')) {
        formattedPhone = '254' + formattedPhone;
      }

      console.log('Initiating M-Pesa payment for phone:', formattedPhone);

      // Initialize M-Pesa payment with Paystack
      paystackResponse = await fetch('https://api.paystack.co/charge', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: clientEmail,
          amount: numericAmount * 100, // Convert to kobo
          currency: 'KES',
          mobile_money: {
            phone: formattedPhone,
            provider: 'mpesa'
          },
          reference: paymentReference,
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
      });
    } else {
      // Initialize regular payment with Paystack
      const origin = req.headers.get('origin') || 'https://prfowczgawhjapsdpncq.supabase.co';
      
      console.log('Initiating regular payment with origin:', origin);

      paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: clientEmail,
          amount: numericAmount * 100, // Convert to kobo
          currency: 'KES',
          reference: paymentReference,
          callback_url: `${origin}/payment-success`,
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
      });
    }

    console.log('Paystack response status:', paystackResponse.status);

    if (!paystackResponse.ok) {
      const errorText = await paystackResponse.text();
      console.error('Paystack API error:', paystackResponse.status, errorText);
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Payment service temporarily unavailable. Please try again later.' 
        }),
        { 
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    paystackData = await paystackResponse.json();
    console.log('Paystack response data:', paystackData);

    if (!paystackData.status) {
      console.error('Paystack payment failed:', paystackData);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: paystackData.message || 'Payment initialization failed. Please try again.' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create transaction record in Supabase
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Creating transaction record...');

    const { error: insertError } = await supabase
      .from('client_business_transactions')
      .insert({
        client_email: clientEmail,
        client_phone: clientPhone,
        business_id: businessId,
        booking_id: bookingId,
        amount: numericAmount,
        platform_fee: platformFee,
        business_amount: businessAmount,
        payment_reference: paymentReference,
        paystack_reference: paystackData.data.reference,
        payment_method: paymentMethod,
        status: 'pending'
      });

    if (insertError) {
      console.error('Error creating transaction record:', insertError);
      // Don't fail the payment if logging fails, but log the error
    } else {
      console.log('Transaction record created successfully');
    }

    console.log('Payment initialized successfully:', {
      reference: paymentReference,
      amount: numericAmount,
      businessId: businessId,
      clientEmail: clientEmail,
      paymentMethod: paymentMethod
    });

    // Return appropriate response based on payment method
    if (paymentMethod === 'mpesa') {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'M-Pesa payment initiated. Check your phone for the payment prompt.',
          reference: paystackData.data.reference,
          payment_reference: paymentReference,
          status: paystackData.data.status
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else {
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
      );
    }

  } catch (error) {
    console.error('Client-to-business payment error:', error);
    
    // Ensure we always return valid JSON
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'An unexpected error occurred. Please try again later.',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
