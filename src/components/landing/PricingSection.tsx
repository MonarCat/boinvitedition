
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useNavigate } from 'react-router-dom';

export const PricingSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const pricingPlans = [
    {
      name: "Free Trial",
      price: "KES 10 One-time fee",
      period: "/7 days",
      features: [
        "Full Medium Plan access",
        "All premium features",
        "No credit card required",
        "Email support",
        "Complete business management"
      ],
      popular: true
    },
    {
      name: "Starter Plan",
      price: "KES 399",
      period: "/month",
      features: [
        "Up to 1 staff member",
        "500 bookings/month",
        "QR code booking system",
        "WhatsApp notifications",
        "Basic analytics",
        "Email support"
      ],
      popular: false
    },
    {
      name: "Economy Plan",
      price: "KES 899",
      period: "/month",
      features: [
        "Up to 5 staff members",
        "1,000 bookings/month",
        "QR code booking system",
        "WhatsApp notifications",
        "Basic analytics",
        "Email support"
      ],
      popular: false
    },
    {
      name: "Business Plan",
      price: "KES 2900",
      period: "/month",
      features: [
        "Up to 15 staff members",
        "3,000 bookings/month",
        "QR code booking system",
        "WhatsApp notifications",
        "Advanced analytics",
        "Priority email support",
        "Custom branding"
      ],
      popular: false
    },
    {
      name: "Enterprise Plan",
      price: "KES 8900",
      period: "/month",
      features: [
        "Unlimited staff & bookings",
        "Multi-location support",
        "Advanced reporting",
        "API access",
        "Priority support",
        "Custom integrations",
        "White-label options"
      ],
      popular: false
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="text-lg px-8 py-3">
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
                  Choose the plan that fits your business needs - start with a free trial
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
                {pricingPlans.map((plan, index) => (
                  <Card key={index} className={`relative hover:shadow-lg transition-shadow ${plan.popular ? 'border-royal-red' : ''}`}>
                    {plan.popular && (
                      <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-royal-red text-white">
                        Most Popular
                      </Badge>
                    )}
                    <CardHeader className="text-center">
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <div className="mt-4">
                        <span className="text-2xl font-bold text-royal-red">{plan.price}</span>
                        <span className="text-gray-600">{plan.period}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            <span className="text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className={`w-full mt-4 ${plan.popular ? 'bg-royal-red hover:bg-royal-red/90 text-white' : 'border-royal-red text-royal-red hover:bg-royal-red hover:text-white'}`}
                        variant={plan.popular ? 'default' : 'outline'}
                        onClick={() => navigate('/auth')}
                      >
                        Get Started
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </section>
  );
};
