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
      name: "Starter",
      price: "KES 3,000",
      period: "/month",
      description: "Perfect for small teams getting started",
      features: [
        "Up to 100 employees",
        "Unlimited meetings",
        "Basic attendance reports",
        "Email notifications",
        "Calendar sync",
        "7-day data history"
      ],
      popular: false,
      cta: "Start Free Trial"
    },
    {
      name: "Professional",
      price: "KES 7,500",
      period: "/month",
      description: "For growing organizations with multiple departments",
      features: [
        "Up to 500 employees",
        "Advanced reporting & analytics",
        "Multi-branch support",
        "WhatsApp & SMS notifications",
        "Compliance exports (PDF/Excel)",
        "AI scheduling assistant",
        "Attendance prediction",
        "Priority support",
        "90-day data history"
      ],
      popular: true,
      cta: "Start Free Trial"
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations with specific needs",
      features: [
        "Unlimited employees",
        "Custom integrations",
        "Dedicated account manager",
        "On-premise deployment option",
        "Custom branding",
        "API access",
        "SLA guarantee",
        "Training & onboarding",
        "Unlimited data retention"
      ],
      popular: false,
      cta: "Contact Sales"
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
                  Simple, Predictable Pricing
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Per-organization pricing. No per-user fees. No hidden costs.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {pricingPlans.map((plan, index) => (
                  <Card 
                    key={index} 
                    className={`relative ${plan.popular ? 'border-2 border-primary shadow-xl scale-105' : 'border shadow-lg'} transition-all duration-300 hover:shadow-xl`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                        <Badge className="bg-primary text-white px-4 py-1 font-bold shadow-lg">
                          <Star className="w-3 h-3 mr-1" />
                          MOST POPULAR
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-4 pt-8">
                      <CardTitle className="text-2xl font-bold text-gray-900">{plan.name}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                      
                      <div className="mt-4">
                        <div className="flex items-baseline justify-center">
                          <span className="text-4xl font-bold text-primary">{plan.price}</span>
                          {plan.period && <span className="text-gray-500 ml-1">{plan.period}</span>}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        {plan.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <Button 
                        className={`w-full py-5 text-base font-semibold ${plan.popular ? 'bg-primary hover:bg-primary/90 text-white' : ''}`}
                        variant={plan.popular ? 'default' : 'outline'}
                        onClick={() => plan.name === 'Enterprise' ? navigate('/contact') : navigate('/auth')}
                      >
                        {plan.cta}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Trust Message */}
              <div className="text-center bg-gradient-to-r from-primary/5 to-blue-50 rounded-xl p-8 mt-8 max-w-3xl mx-auto border border-primary/10">
                <h3 className="text-xl font-bold text-gray-900 mb-3">14-Day Free Trial on All Plans</h3>
                <p className="text-lg text-gray-700">
                  Try Boinvit risk-free. No credit card required. Cancel anytime.
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </section>
  );
};
