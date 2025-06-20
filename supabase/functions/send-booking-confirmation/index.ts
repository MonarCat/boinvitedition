
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationRequest {
  to: string;
  subject: string;
  message: string;
  bookingId: string;
  ticketCode: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, message, bookingId, ticketCode }: ConfirmationRequest = await req.json();

    console.log('Sending booking confirmation email to:', to);
    console.log('Ticket Code:', ticketCode);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // For now, we'll just log the email (in production, integrate with email service)
    console.log('Confirmation email content:', message);

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
        message: 'Confirmation email processed',
        recipient: to,
        ticketCode 
      }),
      { 
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        } 
      }
    );

  } catch (error: any) {
    console.error("Error in send-booking-confirmation function:", error);
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
