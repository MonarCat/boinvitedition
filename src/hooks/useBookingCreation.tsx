import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BookingData {
  businessId: string;
  serviceId: string;
  date: string;
  time: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  totalAmount: number;
  duration: number;
  staffId?: string;
}

export const useBookingCreation = () => {
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  const createBooking = async (bookingData: BookingData) => {
    console.log('Creating booking with data:', bookingData);

    // Create or get client first
    let clientId: string;
    
    // Check if client exists
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('business_id', bookingData.businessId)
      .eq('email', bookingData.customerEmail)
      .maybeSingle();

    if (existingClient) {
      clientId = existingClient.id;
      console.log('Using existing client:', clientId);
    } else {
      // Create new client
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
          business_id: bookingData.businessId,
          name: bookingData.customerName,
          email: bookingData.customerEmail,
          phone: bookingData.customerPhone || null
        })
        .select('id')
        .single();

      if (clientError) {
        console.error('Failed to create client:', clientError);
        throw new Error('Failed to create client record');
      }

      clientId = newClient.id;
      console.log('Created new client:', clientId);
    }

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        business_id: bookingData.businessId,
        client_id: clientId,
        service_id: bookingData.serviceId,
        staff_id: bookingData.staffId || null,
        booking_date: bookingData.date,
        booking_time: bookingData.time,
        duration_minutes: bookingData.duration,
        total_amount: bookingData.totalAmount,
        status: 'pending_payment',
        payment_status: 'pending',
        customer_name: bookingData.customerName,
        customer_email: bookingData.customerEmail,
        customer_phone: bookingData.customerPhone || null
      })
      .select('*')
      .single();

    if (bookingError) {
      console.error('Failed to create booking:', bookingError);
      throw new Error('Failed to create booking');
    }

    console.log('Booking created successfully:', booking.id);
    return booking;
  };

  const bookingMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: (booking) => {
      console.log('Booking creation successful:', booking.id);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      
      toast.success('Booking created successfully');
    },
    onError: (error) => {
      console.error('Booking creation failed:', error);
      toast.error('Failed to create booking. Please try again.');
    }
  });

  const createBookingWithPayment = async (bookingData: BookingData) => {
    setIsCreating(true);
    try {
      const booking = await bookingMutation.mutateAsync(bookingData);
      return booking;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createBookingWithPayment,
    isCreating: isCreating || bookingMutation.isPending
  };
};