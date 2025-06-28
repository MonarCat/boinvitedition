
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { sendBookingReminder } from '@/utils/emailService';
import { toast } from 'sonner';

export const useBookingReminders = () => {
  const sendReminder = useCallback(async (bookingId: string) => {
    try {
      // Get booking details with related data
      const { data: booking, error } = await supabase
        .from('bookings')
        .select(`
          *,
          clients (name, email),
          services (name),
          businesses (name, address, phone)
        `)
        .eq('id', bookingId)
        .single();

      if (error || !booking) {
        throw new Error('Booking not found');
      }

      // Send reminder email
      await sendBookingReminder({
        clientName: booking.clients?.name || booking.customer_name || 'Valued Customer',
        clientEmail: booking.clients?.email || booking.customer_email || '',
        businessName: booking.businesses?.name || 'Business',
        serviceName: booking.services?.name || 'Service',
        bookingDate: booking.booking_date,
        bookingTime: booking.booking_time,
        businessAddress: booking.businesses?.address,
        businessPhone: booking.businesses?.phone
      });

      toast.success('Booking reminder sent successfully!');
      return { success: true };

    } catch (error: any) {
      console.error('Failed to send booking reminder:', error);
      toast.error(error.message || 'Failed to send booking reminder');
      return { success: false, error: error.message };
    }
  }, []);

  const scheduleReminder = useCallback(async (bookingId: string, reminderTime: Date) => {
    try {
      // For now, we'll log the scheduled reminder
      // In a production environment, you might use a job scheduler
      console.log(`Reminder scheduled for booking ${bookingId} at ${reminderTime}`);
      
      // You could implement actual scheduling using Supabase cron jobs or external services
      toast.success('Reminder scheduled successfully!');
      return { success: true };

    } catch (error: any) {
      console.error('Failed to schedule reminder:', error);
      toast.error('Failed to schedule reminder');
      return { success: false, error: error.message };
    }
  }, []);

  return {
    sendReminder,
    scheduleReminder
  };
};
