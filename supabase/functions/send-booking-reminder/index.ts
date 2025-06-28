
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookingReminderRequest {
  to: string;
  subject: string;
  bookingData: {
    clientName: string;
    clientEmail: string;
    businessName: string;
    serviceName: string;
    bookingDate: string;
    bookingTime: string;
    businessAddress?: string;
    businessPhone?: string;
  };
}

const generateCalendarAttachment = (bookingData: any): string => {
  const startDate = new Date(`${bookingData.bookingDate} ${bookingData.bookingTime}`);
  const endDate = new Date(startDate.getTime() + (60 * 60 * 1000));

  const formatDate = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Boinvit//Booking System//EN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:${bookingData.serviceName} - ${bookingData.businessName}`,
    `DESCRIPTION:Your booking for ${bookingData.serviceName} at ${bookingData.businessName}`,
    `LOCATION:${bookingData.businessAddress || bookingData.businessName}`,
    'STATUS:CONFIRMED',
    `UID:booking-${Date.now()}@boinvit.com`,
    `ORGANIZER:mailto:support@boinvit.com`,
    `ATTENDEE:mailto:${bookingData.clientEmail}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, bookingData }: BookingReminderRequest = await req.json();
    
    if (!to || !bookingData) {
      throw new Error('Missing required fields');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Generate calendar attachment
    const calendarContent = generateCalendarAttachment(bookingData);
    
    // Generate Google Calendar link
    const startDate = new Date(`${bookingData.bookingDate} ${bookingData.bookingTime}`);
    const endDate = new Date(startDate.getTime() + (60 * 60 * 1000));
    const formatGoogleDate = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, '');
    
    const calendarParams = new URLSearchParams({
      action: 'TEMPLATE',
      text: `${bookingData.serviceName} - ${bookingData.businessName}`,
      dates: `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`,
      details: `Your booking for ${bookingData.serviceName} at ${bookingData.businessName}`,
      location: bookingData.businessAddress || bookingData.businessName
    });
    const googleCalendarLink = `https://calendar.google.com/calendar/render?${calendarParams.toString()}`;

    // Create email HTML
    const emailHtml = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Booking Reminder</h1>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h2 style="color: #333; margin-top: 0;">Hi ${bookingData.clientName},</h2>
          
          <p style="color: #666; line-height: 1.6;">
            This is a friendly reminder about your upcoming booking:
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Booking Details</h3>
            <p><strong>Service:</strong> ${bookingData.serviceName}</p>
            <p><strong>Business:</strong> ${bookingData.businessName}</p>
            <p><strong>Date:</strong> ${new Date(bookingData.bookingDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${bookingData.bookingTime}</p>
            ${bookingData.businessAddress ? `<p><strong>Location:</strong> ${bookingData.businessAddress}</p>` : ''}
            ${bookingData.businessPhone ? `<p><strong>Phone:</strong> ${bookingData.businessPhone}</p>` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${googleCalendarLink}" 
               style="background: #4285f4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Add to Google Calendar
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            We look forward to serving you! If you need to reschedule or have any questions, 
            please contact ${bookingData.businessName} directly.
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
          <p>This email was sent by Boinvit Booking System</p>
          <p>© 2024 Boinvit. All rights reserved.</p>
        </div>
      </div>
    `;

    // Send email using Supabase's built-in email service
    const { error: emailError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      to,
      {
        data: {
          email_type: 'booking_reminder',
          booking_data: bookingData,
          custom_subject: subject
        }
      }
    );

    if (emailError) {
      console.error('Email sending error:', emailError);
      
      // Fallback: Log the email attempt
      await supabaseAdmin.from('notification_log').insert({
        notification_type: 'booking_reminder',
        recipient: to,
        subject: subject,
        message: emailHtml,
        status: 'failed',
        error_message: emailError.message
      });
      
      throw emailError;
    }

    // Log successful email
    await supabaseAdmin.from('notification_log').insert({
      notification_type: 'booking_reminder',
      recipient: to,
      subject: subject,
      message: emailHtml,
      status: 'sent',
      sent_at: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Booking reminder sent successfully',
        calendarAttachment: calendarContent
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in send-booking-reminder function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send booking reminder' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);
