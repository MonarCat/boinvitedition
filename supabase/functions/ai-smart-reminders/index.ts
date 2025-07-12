import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReminderRequest {
  bookingId: string;
  clientName: string;
  clientPhone: string;
  businessName: string;
  serviceName: string;
  appointmentTime: string;
  reminderType: 'confirmation' | 'reminder_24h' | 'reminder_2h' | 'follow_up';
  clientHistory?: {
    totalBookings: number;
    lastVisit?: string;
    preferredServices?: string[];
  };
}

const generatePersonalizedMessage = async (request: ReminderRequest): Promise<string> => {
  const { clientName, businessName, serviceName, appointmentTime, reminderType, clientHistory } = request;
  
  let promptContext = `Generate a personalized ${reminderType} message for a booking:
- Client: ${clientName}
- Business: ${businessName}
- Service: ${serviceName}
- Time: ${appointmentTime}`;

  if (clientHistory) {
    promptContext += `
- Total visits: ${clientHistory.totalBookings}
- Last visit: ${clientHistory.lastVisit || 'First time'}
- Preferred services: ${clientHistory.preferredServices?.join(', ') || 'None recorded'}`;
  }

  const messageTemplates = {
    confirmation: `Create a warm booking confirmation message. Include appointment details and show appreciation for choosing the business.`,
    reminder_24h: `Create a friendly 24-hour reminder. Include the appointment details and any preparation tips if relevant.`,
    reminder_2h: `Create an urgent but polite 2-hour reminder. Ask for confirmation and provide contact info for changes.`,
    follow_up: `Create a follow-up message asking about their experience and offering future bookings.`
  };

  const prompt = `${promptContext}

${messageTemplates[reminderType]}

Guidelines:
- Keep it under 160 characters for SMS
- Use emojis sparingly but effectively
- Be warm and professional
- Include only essential information
- For loyal customers, acknowledge their loyalty subtly
- For first-time customers, be extra welcoming`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert at writing concise, personalized customer service messages for booking reminders.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 100,
        temperature: 0.8,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('AI message generation failed:', error);
    // Fallback to template message
    return getFallbackMessage(request);
  }
};

const getFallbackMessage = (request: ReminderRequest): string => {
  const { clientName, businessName, serviceName, appointmentTime, reminderType } = request;
  
  const templates = {
    confirmation: `Hi ${clientName}! 📅 Your ${serviceName} appointment at ${businessName} is confirmed for ${new Date(appointmentTime).toLocaleString()}. Thank you for choosing us!`,
    reminder_24h: `Hi ${clientName}! 📅 Reminder: Your ${serviceName} appointment at ${businessName} is tomorrow at ${new Date(appointmentTime).toLocaleString()}. Looking forward to seeing you!`,
    reminder_2h: `Hi ${clientName}! ⏰ Your ${serviceName} appointment at ${businessName} is in 2 hours (${new Date(appointmentTime).toLocaleTimeString()}). Reply YES to confirm or call us for changes.`,
    follow_up: `Hi ${clientName}! Hope you enjoyed your ${serviceName} at ${businessName}. We'd love to see you again! Book your next appointment anytime.`
  };
  
  return templates[reminderType];
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!openAIApiKey) {
    return new Response(
      JSON.stringify({ error: 'OpenAI API key not configured' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const reminderRequest: ReminderRequest = await req.json();
    
    // Generate personalized message using AI
    const personalizedMessage = await generatePersonalizedMessage(reminderRequest);
    
    // Log the generated message for analytics
    await supabase
      .from('notification_log')
      .insert({
        booking_id: reminderRequest.bookingId,
        notification_type: `ai_${reminderRequest.reminderType}`,
        recipient: reminderRequest.clientPhone,
        message: personalizedMessage,
        status: 'generated'
      });

    // Generate WhatsApp URL
    const whatsappUrl = `https://wa.me/${reminderRequest.clientPhone}?text=${encodeURIComponent(personalizedMessage)}`;

    return new Response(
      JSON.stringify({ 
        message: personalizedMessage,
        whatsappUrl,
        type: reminderRequest.reminderType
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in ai-smart-reminders function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate reminder' }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});