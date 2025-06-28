
import { supabase } from '@/integrations/supabase/client';

interface BookingReminderData {
  clientName: string;
  clientEmail: string;
  businessName: string;
  serviceName: string;
  bookingDate: string;
  bookingTime: string;
  businessAddress?: string;
  businessPhone?: string;
}

export const sendBookingReminder = async (bookingData: BookingReminderData) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-booking-reminder', {
      body: {
        to: bookingData.clientEmail,
        subject: `Booking Reminder - ${bookingData.serviceName}`,
        bookingData
      }
    });

    if (error) {
      console.error('Error sending booking reminder:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send booking reminder:', error);
    throw error;
  }
};

export const generateCalendarEvent = (bookingData: BookingReminderData): string => {
  const startDate = new Date(`${bookingData.bookingDate} ${bookingData.bookingTime}`);
  const endDate = new Date(startDate.getTime() + (60 * 60 * 1000)); // Default 1 hour duration

  const formatDate = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Boinvit//Booking System//EN',
    'BEGIN:VEVENT',
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:${bookingData.serviceName} - ${bookingData.businessName}`,
    `DESCRIPTION:Booking for ${bookingData.serviceName} at ${bookingData.businessName}`,
    `LOCATION:${bookingData.businessAddress || bookingData.businessName}`,
    'STATUS:CONFIRMED',
    `UID:booking-${Date.now()}@boinvit.com`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
};

export const createCalendarLink = (bookingData: BookingReminderData): string => {
  const startDate = new Date(`${bookingData.bookingDate} ${bookingData.bookingTime}`);
  const endDate = new Date(startDate.getTime() + (60 * 60 * 1000));

  const formatGoogleDate = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${bookingData.serviceName} - ${bookingData.businessName}`,
    dates: `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`,
    details: `Booking for ${bookingData.serviceName} at ${bookingData.businessName}${bookingData.businessPhone ? `\nPhone: ${bookingData.businessPhone}` : ''}`,
    location: bookingData.businessAddress || bookingData.businessName
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
