import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  message: string;
  businessContext?: {
    businessName?: string;
    services?: string[];
    operatingHours?: string;
    location?: string;
  };
}

const bookingKnowledgeBase = `
You are a helpful AI booking assistant for Boinvit, a business management platform. Help users with:

1. BOOKING ASSISTANCE:
- How to make a booking: "Click 'Book Now' on the service you want, select your preferred date and time, then complete payment"
- Rescheduling: "You can reschedule up to 2 hours before your appointment time"
- Cancellation policy: "Free cancellation up to 4 hours before appointment"

2. COMMON QUESTIONS:
- Business hours: Check the specific business profile for operating hours
- Services available: Browse the services section on each business page
- Pricing: All prices are displayed clearly on service cards
- Payment methods: We accept M-Pesa, bank cards, and bank transfers

3. TECHNICAL SUPPORT:
- App not working: "Try refreshing the page or clearing your browser cache"
- Payment issues: "Contact our support team at +254 769 829 304"
- Booking confirmation: "You'll receive WhatsApp confirmation after successful payment"

4. GENERAL INFO:
- Platform features: Smart booking, staff management, payment processing, analytics
- Supported businesses: Salons, clinics, gyms, events, transport services
- Coverage: Available across Kenya with plans for regional expansion

Always be helpful, concise, and direct users to take action when appropriate.
`;

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
    const { message, businessContext }: ChatRequest = await req.json();

    let systemPrompt = bookingKnowledgeBase;
    
    if (businessContext) {
      systemPrompt += `\n\nCurrent business context:
- Business: ${businessContext.businessName || 'Not specified'}
- Services: ${businessContext.services?.join(', ') || 'Not specified'}
- Hours: ${businessContext.operatingHours || 'Not specified'}
- Location: ${businessContext.location || 'Not specified'}
      
Use this context to provide specific answers when relevant.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        suggestions: [
          "How do I make a booking?",
          "What are your operating hours?",
          "Can I reschedule my appointment?",
          "What payment methods do you accept?"
        ]
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in ai-chatbot function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate response' }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});