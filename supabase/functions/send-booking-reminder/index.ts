
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReminderRequest {
  to: string;
  subject: string;
  message: string;
  bookingId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, message, bookingId }: ReminderRequest = await req.json();

    console.log('Sending booking reminder email to:', to);
    console.log('Subject:', subject);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // For now, we'll just log the email (in production, integrate with email service)
    console.log('Email content:', message);

    // Update notification log
    await supabaseClient
      .from('notification_log')
      .update({ 
        status: 'delivered',
        delivered_at: new Date().toISOString()
      })
      .eq('booking_id', bookingId)
      .eq('notification_type', 'email')
      .eq('recipient', to);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Reminder email processed',
        recipient: to 
      }),
      { 
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        } 
      }
    );

  } catch (error: any) {
    console.error("Error in send-booking-reminder function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        } 
      }
    );
  }
};

serve(handler);
