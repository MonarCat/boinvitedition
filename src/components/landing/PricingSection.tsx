import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ChevronDown, ChevronUp, Star, TrendingUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useNavigate } from 'react-router-dom';

export const PricingSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const payAsYouGoFeatures = [
    "14-day free trial — no credit card required",
    "Only 5% platform fee on every successful booking",
    "Fees accumulate and are paid via Paystack",
    "Unlimited staff members",
    "Unlimited bookings",
    "Full platform access",
    "Advanced analytics & reporting",
    "Custom branding",
    "SMS & Email reminders",
    "Priority support",
    "Multi-location support",
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="text-lg px-8 py-3 hover:bg-gray-100 shadow-sm border-2">
                View Pricing Details
                {isOpen ? <ChevronUp className="ml-2 h-5 w-5" /> : <ChevronDown className="ml-2 h-5 w-5" />}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-8">
              <div className="mb-8">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Simple, Pay As You Go Pricing
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  No monthly fees. No hidden costs. Just a 5% platform fee on every successful booking.
                </p>
              </div>

              <div className="max-w-lg mx-auto">
                <Card className="relative border-4 border-primary shadow-2xl transform hover:scale-105 bg-gradient-to-br from-red-50 to-white transition-all duration-300">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-primary text-white px-6 py-2 font-bold shadow-lg text-base">
                      <Star className="w-4 h-4 mr-1" />
                      NO MONTHLY FEE
                    </Badge>
                  </div>

                  <CardHeader className="text-center pb-4 pt-10">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Pay As You Go</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">Perfect for every business, big or small</p>

                    <div className="mt-4">
                      <div className="flex items-baseline justify-center">
                        <span className="text-5xl font-bold text-primary">5%</span>
                        <span className="text-gray-500 ml-2">per successful booking</span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">Starting limit: KES 1,000</p>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {payAsYouGoFeatures.map((feature, index) => (
                        <div key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      className="w-full py-5 text-base font-semibold bg-primary hover:bg-primary/90 text-white"
                      onClick={() => navigate('/auth')}
                    >
                      Start 14-Day Free Trial
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* How It Works */}
              <div className="text-center bg-gradient-to-r from-primary/5 to-blue-50 rounded-xl p-8 mt-8 max-w-3xl mx-auto border border-primary/10">
                <h3 className="text-xl font-bold text-gray-900 mb-3">How It Works</h3>
                <p className="text-lg text-gray-700 mb-4">
                  Like Bolt — fees accumulate from every successful booking. You'll be reminded to pay when 
                  your balance approaches KES 1,000. Pay via Paystack to keep receiving bookings.
                </p>
                <p className="text-sm text-gray-500">
                  14-day free trial • No credit card required • Cancel anytime
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </section>
  );
};
