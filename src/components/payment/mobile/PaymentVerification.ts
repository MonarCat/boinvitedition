
import { supabase } from '@/integrations/supabase/client';

export async function verifyPaymentAndUpdateBooking(reference, bookingId) {
  try {
    // Log verification attempt
    console.log(`Verifying payment: ${reference} for booking: ${bookingId}`);
    
    // First, check if we already have this payment recorded in our database
    const { data: existingPayment, error: existingError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('paystack_reference', reference)
      .single();
    
    if (existingError && existingError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" - other errors are actual problems
      console.error('Error checking for existing payment:', existingError);
      return { success: false, error: 'Failed to verify payment status' };
    }
    
    if (existingPayment && existingPayment.status === 'completed') {
      console.log('Payment already verified and marked as completed');
      
      // Update booking status if needed
      await updateBookingStatus(bookingId, 'paid');
      
      return { 
        success: true,
        data: {
          verified: true,
          paymentId: existingPayment.id,
          bookingId: bookingId
        }
      };
    }
    
    // Get booking details to calculate amounts and get business info
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        total_amount, 
        business_id, 
        client_id,
        customer_name,
        customer_email,
        customer_phone,
        service_id,
        booking_date,
        booking_time
      `)
      .eq('id', bookingId)
      .single();
      
    if (bookingError) {
      console.error('Error fetching booking:', bookingError);
      return { success: false, error: 'Failed to fetch booking details' };
    }
    
    const totalAmount = booking.total_amount;
    const platformFee = totalAmount * 0.05; // 5% platform fee
    const businessAmount = totalAmount - platformFee;

    console.log('Payment verification amounts:', {
      totalAmount,
      platformFee,
      businessAmount,
      businessId: booking.business_id
    });

    // Record the payment transaction for analytics and dashboard
    const { data: paymentRecord, error: paymentError } = await supabase
      .from('payment_transactions')
      .insert({
        paystack_reference: reference,
        booking_id: bookingId,
        business_id: booking.business_id,
        status: 'completed',
        payment_method: 'paystack',
        amount: totalAmount,
        business_amount: businessAmount,
        platform_fee_amount: platformFee,
        currency: 'KES',
        transaction_type: 'client_to_business',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (paymentError) {
      console.error('Error recording payment transaction:', paymentError);
      return { success: false, error: 'Failed to record payment transaction' };
    }
    
    console.log('Payment transaction recorded successfully:', paymentRecord);

    // Record client-business transaction for earnings tracking
    const { data: clientTransaction, error: clientTransactionError } = await supabase
      .from('client_business_transactions')
      .insert({
        client_email: booking.customer_email,
        client_phone: booking.customer_phone,
        business_id: booking.business_id,
        booking_id: bookingId,
        amount: totalAmount,
        platform_fee: platformFee,
        business_amount: businessAmount,
        payment_reference: reference,
        paystack_reference: reference,
        payment_method: 'paystack',
        status: 'completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (clientTransactionError) {
      console.error('Error recording client transaction:', clientTransactionError);
      // Don't fail the whole process, but log the error
    } else {
      console.log('Client business transaction recorded:', clientTransaction);
    }
    
    // Update booking status to 'paid' and mark as confirmed
    const bookingResult = await updateBookingStatus(bookingId, 'paid');
    if (!bookingResult.success) {
      console.error('Failed to update booking status:', bookingResult.error);
      // Don't fail the whole process since payment was recorded
    }
    
    console.log('Payment verification completed successfully');
    
    return {
      success: true,
      data: {
        verified: true,
        paymentId: paymentRecord.id,
        bookingId: bookingId,
        totalAmount: totalAmount,
        businessAmount: businessAmount,
        platformFee: platformFee
      }
    };
  } catch (error) {
    console.error('Payment verification error:', error);
    return { success: false, error: 'Internal server error during payment verification' };
  }
}

async function updateBookingStatus(bookingId, status) {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({ 
        payment_status: status,
        status: status === 'paid' ? 'confirmed' : 'pending',
        updated_at: new Date().toISOString() 
      })
      .eq('id', bookingId);
    
    if (error) {
      console.error('Error updating booking status:', error);
      return { success: false, error: 'Failed to update booking status' };
    }
    
    console.log(`Booking ${bookingId} status updated to: ${status}`);
    return { success: true };
  } catch (error) {
    console.error('Booking status update error:', error);
    return { success: false, error: 'Internal server error during booking update' };
  }
}
