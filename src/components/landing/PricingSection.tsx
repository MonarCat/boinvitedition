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
                  Simple, Transparent Pricing
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Pay As You Go - Only pay when you get paid. No monthly fees, no hidden costs.
                </p>
              </div>

              {/* Use a centered max-width container for better positioning */}
              <div className="max-w-2xl mx-auto">
                {pricingPlans.map((plan, index) => (
                  <Card 
                    key={index} 
                    className="relative border-2 border-primary/20 shadow-xl transform hover:scale-[1.02] transition-all duration-300 bg-gradient-to-br from-primary/5 to-white"
                  >
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-primary text-white px-6 py-2 font-bold shadow-lg text-lg">
                        <Star className="w-4 h-4 mr-1" />
                        NO MONTHLY FEE
                      </Badge>
                    </div>
                    
                    <CardHeader className="text-center pb-0">
                      <CardTitle className="text-3xl font-bold text-primary">{plan.name}</CardTitle>
                      <p className="text-lg text-primary/80 font-medium">Only pay when you get paid</p>
                      
                      <div className="mt-6 mb-4">
                        <div className="text-5xl font-bold text-primary">
                          5% commission
                        </div>
                        <div className="text-xl text-primary/80 font-semibold mt-2">
                          No monthly subscription
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-6 pt-4">
                      <div className="grid md:grid-cols-2 gap-3">
                        {plan.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-success mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 font-medium">{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <Button 
                        className="w-full bg-primary hover:bg-primary-hover text-white py-6 text-xl font-bold shadow-lg transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                        onClick={() => navigate('/auth')}
                      >
                        🚀 Get Started with Pay As You Go
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Payment Methods Info */}
              <div className="text-center bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-8 mt-8 max-w-3xl mx-auto border border-primary/10">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Why Pay As You Go?</h3>
                <p className="text-lg text-gray-700 font-medium">
                  <strong>Risk-Free Growth:</strong> No upfront costs, no monthly fees. We only succeed when you do. 
                  Pay just 5% commission on payments received through the platform.
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </section>
  );
};