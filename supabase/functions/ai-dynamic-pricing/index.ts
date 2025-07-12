import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PricingRequest {
  businessId: string;
  serviceId: string;
  currentPrice: number;
  requestedDateTime: string;
  businessType: string;
}

interface PricingAnalysis {
  suggestedPrice: number;
  priceChange: number;
  priceChangePercentage: number;
  reasoning: string;
  confidence: number;
  factors: string[];
}

const analyzeDemandPatterns = async (supabase: any, businessId: string, serviceId: string, targetDate: Date) => {
  // Get historical booking data for pattern analysis
  const dayOfWeek = targetDate.getDay();
  const hour = targetDate.getHours();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  // Fetch booking patterns for this time slot
  const { data: historicalBookings } = await supabase
    .from('bookings')
    .select('booking_date, booking_time, total_amount')
    .eq('business_id', businessId)
    .eq('service_id', serviceId)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false });

  // Analyze patterns
  const sameDayBookings = historicalBookings?.filter(booking => {
    const bookingDate = new Date(booking.booking_date);
    return bookingDate.getDay() === dayOfWeek;
  }) || [];

  const sameHourBookings = historicalBookings?.filter(booking => {
    const bookingTime = booking.booking_time;
    const bookingHour = parseInt(bookingTime.split(':')[0]);
    return Math.abs(bookingHour - hour) <= 1;
  }) || [];

  return {
    totalBookings: historicalBookings?.length || 0,
    sameDayDemand: sameDayBookings.length,
    sameHourDemand: sameHourBookings.length,
    isWeekend,
    isPeakHour: hour >= 18 || (hour >= 10 && hour <= 14), // Evening or lunch hours
    averagePrice: historicalBookings?.reduce((sum, booking) => sum + booking.total_amount, 0) / (historicalBookings?.length || 1)
  };
};

const generatePricingSuggestion = async (
  request: PricingRequest,
  demandData: any
): Promise<PricingAnalysis> => {
  const { currentPrice, businessType, requestedDateTime } = request;
  const targetDate = new Date(requestedDateTime);
  
  const prompt = `Analyze pricing optimization for a ${businessType} business:

Current price: KSh ${currentPrice}
Requested time: ${targetDate.toLocaleString()}
Historical data:
- Total bookings (30 days): ${demandData.totalBookings}
- Same day demand: ${demandData.sameDayDemand}
- Same hour demand: ${demandData.sameHourDemand}
- Is weekend: ${demandData.isWeekend}
- Is peak hour: ${demandData.isPeakHour}
- Average historical price: KSh ${demandData.averagePrice}

Provide pricing optimization based on:
1. Time-based demand (weekend vs weekday, peak vs off-peak)
2. Historical booking patterns
3. Service type and business category
4. Market positioning

Suggest a price adjustment between -20% to +30% of current price.
Consider:
- Weekend premium (5-15%)
- Peak hour premium (10-20%)
- High demand slots (15-25%)
- Low demand slots (-10% to -20%)

Respond with only a JSON object containing:
{
  "suggestedPrice": number,
  "priceChangePercentage": number,
  "reasoning": "Brief explanation",
  "confidence": number (0-100),
  "factors": ["factor1", "factor2", "factor3"]
}`;

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
          { role: 'system', content: 'You are an expert pricing analyst for service businesses. Provide data-driven pricing recommendations in JSON format only.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 300,
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const aiResponse = JSON.parse(data.choices[0].message.content);
    
    return {
      suggestedPrice: Math.round(aiResponse.suggestedPrice),
      priceChange: Math.round(aiResponse.suggestedPrice - currentPrice),
      priceChangePercentage: aiResponse.priceChangePercentage,
      reasoning: aiResponse.reasoning,
      confidence: aiResponse.confidence,
      factors: aiResponse.factors
    };
  } catch (error) {
    console.error('AI pricing analysis failed:', error);
    return getFallbackPricing(request, demandData);
  }
};

const getFallbackPricing = (request: PricingRequest, demandData: any): PricingAnalysis => {
  const { currentPrice } = request;
  const targetDate = new Date(request.requestedDateTime);
  
  let multiplier = 1.0;
  const factors: string[] = [];
  
  // Simple rule-based pricing
  if (demandData.isWeekend) {
    multiplier += 0.15;
    factors.push("Weekend premium");
  }
  
  if (demandData.isPeakHour) {
    multiplier += 0.10;
    factors.push("Peak hour demand");
  }
  
  if (demandData.sameHourDemand > demandData.totalBookings * 0.3) {
    multiplier += 0.20;
    factors.push("High demand time slot");
  } else if (demandData.sameHourDemand < demandData.totalBookings * 0.1) {
    multiplier -= 0.15;
    factors.push("Low demand time slot");
  }
  
  const suggestedPrice = Math.round(currentPrice * multiplier);
  const priceChange = suggestedPrice - currentPrice;
  const priceChangePercentage = Math.round(((multiplier - 1) * 100));
  
  return {
    suggestedPrice,
    priceChange,
    priceChangePercentage,
    reasoning: `Dynamic pricing based on ${factors.join(', ').toLowerCase()}`,
    confidence: 75,
    factors
  };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const pricingRequest: PricingRequest = await req.json();
    const targetDate = new Date(pricingRequest.requestedDateTime);
    
    // Analyze demand patterns
    const demandData = await analyzeDemandPatterns(
      supabase, 
      pricingRequest.businessId, 
      pricingRequest.serviceId, 
      targetDate
    );
    
    // Generate AI-powered pricing suggestion
    const pricingAnalysis = openAIApiKey 
      ? await generatePricingSuggestion(pricingRequest, demandData)
      : getFallbackPricing(pricingRequest, demandData);
    
    // Log pricing suggestion for analytics
    await supabase
      .from('admin_audit_logs')
      .insert({
        admin_id: pricingRequest.businessId,
        action: 'ai_pricing_suggestion',
        target_type: 'service',
        target_id: pricingRequest.serviceId,
        metadata: {
          original_price: pricingRequest.currentPrice,
          suggested_price: pricingAnalysis.suggestedPrice,
          factors: pricingAnalysis.factors,
          confidence: pricingAnalysis.confidence,
          requested_time: pricingRequest.requestedDateTime
        }
      });

    return new Response(
      JSON.stringify({
        success: true,
        analysis: pricingAnalysis,
        demandMetrics: {
          historicalBookings: demandData.totalBookings,
          timeSlotDemand: demandData.sameHourDemand,
          dayDemand: demandData.sameDayDemand
        }
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in ai-dynamic-pricing function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate pricing suggestion' }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});