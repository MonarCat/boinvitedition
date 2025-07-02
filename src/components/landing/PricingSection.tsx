import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useNavigate } from 'react-router-dom';

export const PricingSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const pricingPlans = [
    {
      name: "Pay As You Go",
      price: "5% Commission",
      period: "/transaction",
      features: [
        "No monthly subscription fees",
        "Only 5% commission on payments received",
        "Unlimited staff members",
        "Unlimited bookings",
        "Full platform access",
        "QR code booking system",
        "WhatsApp notifications",
        "Advanced analytics",
        "Custom branding",
        "White-label options",
        "API access",
        "24/7 priority support"
      ],
      popular: true
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="text-lg px-8 py-3 hover:bg-gray-100">
                View Pricing Plans
                {isOpen ? <ChevronUp className="ml-2 h-5 w-5" /> : <ChevronDown className="ml-2 h-5 w-5" />}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Simple, Transparent Pricing
                </h2>
                <p className="text-lg text-gray-600">
                  Simple Pay As You Go - Only pay when you receive payments
                </p>
              </div>

              {/* Use a centered max-width container for better positioning */}
              <div className="max-w-2xl mx-auto">
                {pricingPlans.map((plan, index) => (
                  <Card 
                    key={index} 
                    className="relative border-4 border-red-500 shadow-2xl transform hover:scale-105 transition-all duration-200 bg-gradient-to-br from-red-50 to-white"
                  >
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-red-600 text-white px-6 py-2 font-bold shadow-lg text-lg">
                        <Star className="w-4 h-4 mr-1" />
                        NO MONTHLY FEE
                      </Badge>
                    </div>
                    
                    <CardHeader className="text-center pb-0">
                      <CardTitle className="text-2xl font-bold text-red-700">{plan.name}</CardTitle>
                      <p className="text-md text-red-600 font-medium">Only pay when you get paid</p>
                      
                      <div className="mt-4 mb-2">
                        <div className="text-4xl font-bold text-red-600">
                          5% commission only
                        </div>
                        <div className="text-lg text-red-600 font-bold mt-1">
                          No monthly subscription
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-6 pt-4">
                      <div className="grid md:grid-cols-2 gap-3">
                        {plan.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 font-medium">{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <Button 
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-xl font-bold shadow-lg transform transition-all duration-200 hover:shadow-xl hover:scale-105"
                        onClick={() => navigate('/auth')}
                      >
                        🚀 ALREADY ACTIVATED ON PAYG
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Payment Methods Info */}
              <div className="text-center bg-gray-50 rounded-lg p-6 mt-6 max-w-2xl mx-auto">
                <p className="text-md text-gray-700 font-medium">
                  <strong>Simple Pricing:</strong> No monthly fees, just a 5% commission on payments you receive through the platform.
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </section>
  );
};
