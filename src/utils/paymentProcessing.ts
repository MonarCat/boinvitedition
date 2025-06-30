import { supabase } from '@/integrations/supabase/client';

/**
 * Process payment for a booking with PAYG commission handling
 * @param {Object} booking - The booking details
 * @param {Object} paymentInfo - Payment information
 * @param {Object} user - Current user info
 * @returns {Promise} - Payment processing result
 */
export const processBookingPayment = async (booking, paymentInfo, user) => {
  try {
    // Check user subscription type
    const { data: userSubscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (subscriptionError && subscriptionError.code !== 'PGRST116') {
      console.error("Error fetching subscription:", subscriptionError);
      throw new Error("Failed to retrieve user subscription");
    }
    
    let serviceFee = 0;
    
    // Calculate service fee based on subscription type
    if (!userSubscription || userSubscription.plan_type === 'payg') {
      // Apply 5% commission for PAYG users
      serviceFee = booking.amount * 0.05;
    } else if (['trial', 'starter', 'economy'].includes(userSubscription.plan_type)) {
      // Apply standard fees for Basic/Economy users - 3%
      serviceFee = booking.amount * 0.03;
    }
    // Premium users don't pay commission
    
    const totalAmount = booking.amount;
    const netAmount = booking.amount - serviceFee;
    
    // Process the payment
    const { data: paymentResult, error: paymentError } = await supabase
      .from('payment_transactions')
      .insert({
        booking_id: booking.id,
        business_id: booking.business_id,
        amount: totalAmount,
        business_amount: netAmount,
        platform_fee: serviceFee,
        currency: booking.currency || 'KES',
        payment_method: paymentInfo.method,
        payment_reference: paymentInfo.reference,
        status: 'completed',
        transaction_type: 'client_to_business',
        metadata: {
          subscription_type: userSubscription?.plan_type || 'payg',
          commission_rate: userSubscription?.plan_type === 'payg' ? 0.05 : 0.03,
          booking_details: {
            service_name: booking.service_name,
            customer_name: booking.customer_name,
            date: booking.date
          }
        }
      })
      .select()
      .single();
    
    if (paymentError) {
      console.error("Payment processing error:", paymentError);
      throw new Error("Failed to process payment");
    }
    
    // Update booking status after successful payment
    const { error: bookingError } = await supabase
      .from('bookings')
      .update({ 
        status: 'confirmed',
        payment_status: 'paid',
        payment_id: paymentResult.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', booking.id);
    
    if (bookingError) {
      console.error("Booking update error:", bookingError);
      throw new Error("Failed to update booking status");
    }
    
    return {
      success: true,
      data: {
        payment: paymentResult,
        netAmount,
        serviceFee,
        totalAmount
      }
    };
  } catch (error) {
    console.error("Payment processing error:", error);
    return {
      success: false,
      error: error.message || "Failed to process payment"
    };
  }
};
