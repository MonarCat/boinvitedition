import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase configuration missing');
    return new Response('Configuration error', { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const body = await req.json();
    const { action, businessId, bookingId, clientId } = body;

    // Debugging endpoint to check data
    if (action === 'check_data') {
      // Fetch data for debugging
      const bookingsPromise = supabase
        .from('bookings')
        .select('*')
        .eq(bookingId ? 'id' : 'business_id', bookingId || businessId)
        .order('created_at', { ascending: false })
        .limit(10);
        
      const clientsPromise = supabase
        .from('clients')
        .select('*')
        .eq(clientId ? 'id' : 'business_id', clientId || businessId)
        .order('created_at', { ascending: false })
        .limit(10);
        
      const transactionsPromise = supabase
        .from('client_business_transactions')
        .select('*')
        .eq(bookingId ? 'booking_id' : 'business_id', bookingId || businessId)
        .order('created_at', { ascending: false })
        .limit(10);
        
      const paymentsPromise = supabase
        .from('payment_transactions')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(10);
      
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
    
    // Manual trigger for payment processing (for debugging only)
    if (action === 'manual_process' && businessId && bookingId) {
      // 1. First, get booking details
      const { data: bookingData, error: fetchBookingError } = await supabase
        .from('bookings')
        .select(`
          id, 
          client_id, 
          service_id, 
          date, 
          time, 
          status, 
          payment_status,
          total_amount,
          business_id
        `)
        .eq('id', bookingId)
        .single();
        
      if (fetchBookingError || !bookingData) {
        console.error('Failed to fetch booking data:', fetchBookingError);
        return new Response('Booking not found', { status: 404 });
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
        .eq('id', bookingId);

      // 3. Get/update transaction data
      const { data: transactionData } = await supabase
        .from('client_business_transactions')
        .select('*')
        .eq('booking_id', bookingId)
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
          currency: 'NGN',
          status: 'completed',
          payment_method: 'manual',
          paystack_reference: `manual-${Date.now()}`,
          transaction_type: 'client_to_business',
          metadata: { 
            booking_id: bookingId,
            client_id: bookingData.client_id,
            webhook_event: 'manual'
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
              status: 'active',
              last_booking_date: bookingData.date,
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
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500 
    });
  }
});
