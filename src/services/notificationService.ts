
import { supabase } from '@/integrations/supabase/client';

interface NotificationData {
  bookingId: string;
  businessId: string;
  type: 'email' | 'sms' | 'whatsapp';
  recipient: string;
  subject?: string;
  message: string;
}

interface NotificationChannels {
  email?: boolean;
  sms?: boolean;
  whatsapp?: boolean;
}

export class NotificationService {
  static async sendBookingReminder(bookingId: string) {
    try {
      // Get booking details with business and client info
      const { data: booking, error } = await supabase
        .from('bookings')
        .select(`
          *,
          businesses (name, phone, email, address),
          clients (name, email, phone),
          services (name, duration_minutes)
        `)
        .eq('id', bookingId)
        .single();

      if (error || !booking) {
        console.error('Failed to fetch booking for reminder:', error);
        return;
      }

      // Get subscription details separately using business_id
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('notification_channels')
        .eq('business_id', booking.business_id)
        .maybeSingle();

      const business = booking.businesses;
      const client = booking.clients;
      const service = booking.services;

      // Check subscription notification preferences
      const notificationChannels = (subscription?.notification_channels as NotificationChannels) || { email: true, sms: false, whatsapp: false };

      const reminderMessage = `
        Hi ${client.name},
        
        This is a reminder for your upcoming appointment:
        
        Service: ${service.name}
        Date: ${new Date(booking.booking_date).toLocaleDateString()}
        Time: ${booking.booking_time}
        Duration: ${service.duration_minutes} minutes
        Business: ${business.name}
        Location: ${business.address || 'Address not specified'}
        
        If you need to reschedule or cancel, please contact us at ${business.phone || business.email}.
        
        Thank you!
      `;

      // Send email reminder (always available)
      if (client.email) {
        await this.logNotification({
          bookingId,
          businessId: booking.business_id,
          type: 'email',
          recipient: client.email,
          subject: `Reminder: Appointment with ${business.name}`,
          message: reminderMessage
        });

        // Call email function
        await supabase.functions.invoke('send-booking-reminder', {
          body: {
            to: client.email,
            subject: `Reminder: Appointment with ${business.name}`,
            message: reminderMessage,
            bookingId
          }
        });
      }

      // Send SMS if enabled and phone available
      if (notificationChannels.sms && client.phone) {
        await this.logNotification({
          bookingId,
          businessId: booking.business_id,
          type: 'sms',
          recipient: client.phone,
          message: `Reminder: ${service.name} appointment tomorrow at ${booking.booking_time} with ${business.name}. Location: ${business.address || 'TBD'}`
        });

        // TODO: Implement SMS sending via edge function
      }

      // Send WhatsApp if enabled and phone available
      if (notificationChannels.whatsapp && client.phone) {
        await this.logNotification({
          bookingId,
          businessId: booking.business_id,
          type: 'whatsapp',
          recipient: client.phone,
          message: reminderMessage
        });

        // TODO: Implement WhatsApp sending via edge function
      }

      // Mark reminder as sent
      await supabase
        .from('bookings')
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq('id', bookingId);

    } catch (error) {
      console.error('Failed to send booking reminder:', error);
    }
  }

  static async logNotification(data: NotificationData) {
    try {
      await supabase
        .from('notification_log')
        .insert({
          booking_id: data.bookingId,
          business_id: data.businessId,
          notification_type: data.type,
          recipient: data.recipient,
          subject: data.subject,
          message: data.message,
          status: 'sent',
          sent_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to log notification:', error);
    }
  }

  static async sendBookingConfirmation(bookingId: string) {
    try {
      const { data: booking, error } = await supabase
        .from('bookings')
        .select(`
          *,
          businesses (name, phone, email, address),
          clients (name, email, phone),
          services (name, price, currency, duration_minutes)
        `)
        .eq('id', bookingId)
        .single();

      if (error || !booking) return;

      const business = booking.businesses;
      const client = booking.clients;
      const service = booking.services;

      const confirmationMessage = `
        Dear ${client.name},
        
        Your booking has been confirmed!
        
        Booking Details:
        Ticket Code: ${booking.ticket_code}
        Service: ${service.name}
        Date: ${new Date(booking.booking_date).toLocaleDateString()}
        Time: ${booking.booking_time}
        Duration: ${service.duration_minutes} minutes
        Amount: ${service.currency} ${service.price}
        
        Business Information:
        Name: ${business.name}
        Address: ${business.address || 'Please contact for location'}
        Phone: ${business.phone || 'Not provided'}
        
        Please arrive 5 minutes early for your appointment.
        
        Thank you for choosing ${business.name}!
      `;

      if (client.email) {
        await this.logNotification({
          bookingId,
          businessId: booking.business_id,
          type: 'email',
          recipient: client.email,
          subject: `Booking Confirmed - ${business.name}`,
          message: confirmationMessage
        });

        await supabase.functions.invoke('send-booking-confirmation', {
          body: {
            to: client.email,
            subject: `Booking Confirmed - ${business.name}`,
            message: confirmationMessage,
            bookingId,
            ticketCode: booking.ticket_code
          }
        });
      }
    } catch (error) {
      console.error('Failed to send booking confirmation:', error);
    }
  }
}
