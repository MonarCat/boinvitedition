
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
    
    // For real implementation, verify with Paystack API
    // This would make an HTTP request to Paystack's verification endpoint
    // and check the payment status
    // 
    // For this example, we'll simulate a successful verification
    
    // Record the payment as verified - only use existing columns
    const { data: paymentRecord, error: paymentError } = await supabase
      .from('payment_transactions')
      .upsert({
        paystack_reference: reference,
        booking_id: bookingId,
        status: 'completed',
        payment_method: 'paystack',
        amount: 0, // In a real implementation, get this from the verification response
        currency: 'KES',
        transaction_type: 'client_to_business',
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (paymentError) {
      console.error('Error recording payment:', paymentError);
      return { success: false, error: 'Failed to record payment' };
    }
    
    // Update booking status
    const bookingResult = await updateBookingStatus(bookingId, 'paid');
    if (!bookingResult.success) {
      return bookingResult;
    }
    
    return {
      success: true,
      data: {
        verified: true,
        paymentId: paymentRecord.id,
        bookingId: bookingId
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
      .update({ payment_status: status, updated_at: new Date().toISOString() })
      .eq('id', bookingId);
    
    if (error) {
      console.error('Error updating booking status:', error);
      return { success: false, error: 'Failed to update booking status' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Booking status update error:', error);
    return { success: false, error: 'Internal server error during booking update' };
  }
}
