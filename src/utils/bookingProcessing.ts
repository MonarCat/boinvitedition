import { supabase } from '@/integrations/supabase/client';

/**
 * Create a new booking with pending payment status
 * @param {Object} bookingData - Booking details
 * @returns {Promise} - New booking object
 */
export const createBooking = async (bookingData) => {
  try {
    // Create booking with initial "pending_payment" status
    const newBooking = {
      ...bookingData,
      status: 'pending_payment',
      payment_status: 'pending',
      created_at: new Date().toISOString(),
    };
    
    // Save booking to database
    const { data: savedBooking, error } = await supabase
      .from('bookings')
      .insert(newBooking)
      .select()
      .single();
    
    if (error) {
      console.error("Error creating booking:", error);
      throw new Error("Failed to create booking");
    }
    
    return {
      ...savedBooking,
      requiresPayment: true,
    };
  } catch (error) {
    console.error("Error creating booking:", error);
    throw new Error("Failed to create booking");
  }
};

/**
 * Update booking status after payment
 * @param {string} bookingId - Booking ID
 * @param {string} status - New status
 * @returns {Promise} - Updated booking
 */
export const updateBookingStatus = async (bookingId, status) => {
  try {
    // Get current booking status
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();
    
    if (fetchError) {
      console.error("Error fetching booking:", fetchError);
      throw new Error("Failed to fetch booking");
    }
    
    // Only allow confirmed status if payment was successful
    if (status === 'confirmed' && booking.status !== 'pending_payment') {
      throw new Error("Invalid booking status transition");
    }
    
    // Update booking status
    const { data: updatedBooking, error } = await supabase
      .from('bookings')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating booking status:", error);
      throw new Error("Failed to update booking status");
    }
    
    // Send notifications on status change
    if (status === 'confirmed') {
      // This would integrate with your notification system
      // await sendBookingConfirmation(updatedBooking);
      console.log("Booking confirmed, sending notifications");
    }
    
    return updatedBooking;
  } catch (error) {
    console.error("Error updating booking status:", error);
    throw new Error("Failed to update booking status");
  }
};
