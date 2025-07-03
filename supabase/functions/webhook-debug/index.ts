
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createSecureCorsHeaders } from '../_shared/cors.ts'
import { detectSuspiciousActivity } from '../_shared/security.ts'

serve(async (req) => {
  const origin = req.headers.get('origin');
  const userAgent = req.headers.get('user-agent') || '';
  const corsHeaders = await createSecureCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Check for suspicious activity
  if (detectSuspiciousActivity(userAgent, '')) {
    console.warn('Suspicious activity detected:', { userAgent, origin });
    return new Response('Access denied', { 
      status: 403, 
      headers: corsHeaders 
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase configuration missing');
    return new Response('Configuration error', { 
      status: 500, 
      headers: corsHeaders 
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const body = await req.json();
    const { action, businessId, bookingId, clientId } = body;

    // Log debug access attempt
    await supabase.rpc('log_security_event_enhanced', {
      p_event_type: 'DEBUG_ENDPOINT_ACCESS',
      p_description: `Debug endpoint accessed: ${action}`,
      p_metadata: {
        action,
        businessId,
        bookingId,
        clientId,
        userAgent,
        origin
      },
      p_severity: 'low'
    });

    // Debugging endpoint to check data
    if (action === 'check_data') {
      // Validate businessId format for security
      if (businessId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(businessId)) {
        return new Response('Invalid business ID format', { 
          status: 400, 
          headers: corsHeaders 
        });
      }

      // Fetch data for debugging with limited results for security
      const bookingsPromise = supabase
        .from('bookings')
        .select('*')
        .eq(bookingId ? 'id' : 'business_id', bookingId || businessId)
        .order('created_at', { ascending: false })
        .limit(5); // Reduced limit for security
        
      const clientsPromise = supabase
        .from('clients')
        .select('*')
        .eq(clientId ? 'id' : 'business_id', clientId || businessId)
        .order('created_at', { ascending: false })
        .limit(5); // Reduced limit for security
        
      const transactionsPromise = supabase
        .from('client_business_transactions')
        .select('*')
        .eq(bookingId ? 'booking_id' : 'business_id', bookingId || businessId)
        .order('created_at', { ascending: false })
        .limit(5); // Reduced limit for security
        
      const paymentsPromise = supabase
        .from('payment_transactions')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(5); // Reduced limit for security
      
      // Execute all queries in parallel
      const [bookings, clients, transactions, payments] = await Promise.all([
        bookingsPromise, clientsPromise, transactionsPromise, paymentsPromise
      ]);
      
      return new Response(JSON.stringify({
        success: true,
        data: {
          bookings: bookings.data,
          bookingsError: bookings.error,
          clients: clients.data,
          clientsError: clients.error,
          transactions: transactions.data,
          transactionsError: transactions.error,
          payments: payments.data,
          paymentsError: payments.error
        }
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      });
    }
    
    // Manual trigger for payment processing (for debugging only - with enhanced security)
    if (action === 'manual_process' && businessId && bookingId) {
      // Enhanced validation
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(businessId) ||
          !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(bookingId)) {
        return new Response('Invalid ID format', { 
          status: 400, 
          headers: corsHeaders 
        });
      }

      // Log manual processing attempt
      await supabase.rpc('log_security_event_enhanced', {
        p_event_type: 'MANUAL_PAYMENT_PROCESSING',
        p_description: 'Manual payment processing triggered via debug endpoint',
        p_metadata: {
          businessId,
          bookingId,
          userAgent,
          origin
        },
        p_severity: 'medium'
      });

      // 1. First, get booking details with business validation
      const { data: bookingData, error: fetchBookingError } = await supabase
        .from('bookings')
        .select(`
          id, 
          client_id, 
          service_id, 
          booking_date, 
          booking_time, 
          status, 
          payment_status,
          total_amount,
          business_id
        `)
        .eq('id', bookingId)
        .eq('business_id', businessId) // Additional security check
        .single();
        
      if (fetchBookingError || !bookingData) {
        console.error('Failed to fetch booking data:', fetchBookingError);
        return new Response('Booking not found or access denied', { 
          status: 404, 
          headers: corsHeaders 
        });
      }

      // Validate payment amount
      if (!bookingData.total_amount || bookingData.total_amount <= 0 || bookingData.total_amount > 1000000) {
        console.error('Invalid payment amount:', bookingData.total_amount);
        return new Response('Invalid payment amount', { 
          status: 400, 
          headers: corsHeaders 
        });
      }

      // 2. Update booking status manually
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({
          status: 'confirmed',
          payment_status: 'completed',
          payment_reference: `manual-${Date.now()}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId)
        .eq('business_id', businessId); // Additional security check

      if (bookingError) {
        console.error('Failed to update booking:', bookingError);
        return new Response('Failed to update booking', { 
          status: 500, 
          headers: corsHeaders 
        });
      }

      // 3. Get/update transaction data
      const { data: transactionData } = await supabase
        .from('client_business_transactions')
        .select('*')
        .eq('booking_id', bookingId)
        .eq('business_id', businessId) // Additional security check
        .single();
        
      if (transactionData) {
        // Update existing transaction
        await supabase
          .from('client_business_transactions')
          .update({
            status: 'completed',
            paystack_reference: `manual-${Date.now()}`,
            updated_at: new Date().toISOString()
          })
          .eq('id', transactionData.id);
      }

      // 4. Record payment transaction
      const paymentAmount = bookingData.total_amount || 0;
      await supabase
        .from('payment_transactions')
        .insert({
          business_id: businessId,
          amount: paymentAmount,
          currency: 'KES',
          status: 'completed',
          payment_method: 'manual',
          paystack_reference: `manual-${Date.now()}`,
          transaction_type: 'client_to_business',
          metadata: { 
            booking_id: bookingId,
            client_id: bookingData.client_id,
            webhook_event: 'manual',
            processed_via: 'debug_endpoint'
          }
        });

      // 5. Update client record if it exists
      if (bookingData.client_id) {
        const { data: clientData } = await supabase
          .from('clients')
          .select('*')
          .eq('id', bookingData.client_id)
          .single();
          
        if (clientData) {
          await supabase
            .from('clients')
            .update({ 
              last_service_date: bookingData.booking_date,
              updated_at: new Date().toISOString()
            })
            .eq('id', bookingData.client_id);
        }
      }
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Manual processing successful',
        booking: bookingId,
        business: businessId
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      });
    }
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Invalid action'
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400 
    });

  } catch (error) {
    console.error('Debug endpoint error:', error);
    
    // Log debug error
    await supabase.rpc('log_security_event_enhanced', {
      p_event_type: 'DEBUG_ENDPOINT_ERROR',
      p_description: 'Error in debug endpoint',
      p_metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        userAgent,
        origin
      },
      p_severity: 'medium'
    });
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Internal server error',
      error: 'Processing failed'
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500 
    });
  }
});
