
import React from 'react';
import { Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PlanFeature {
  name: string;
  included: boolean;
  limited?: string;
}

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: PlanFeature[];
  popular?: boolean;
  cta: string;
}

const plans: Plan[] = [
  {
    id: 'trial',
    name: 'Free Trial',
    price: 'Free',
    period: '7 days',
    description: 'Test all features with no limitations',
    features: [
      { name: 'All features included', included: true },
      { name: 'QR code booking system', included: true },
      { name: 'Unlimited staff & bookings', included: true },
      { name: 'Email notifications', included: true },
      { name: 'SMS & WhatsApp reminders', included: true },
      { name: 'Client data retention', included: true },
      { name: 'Invoice generation', included: true },
    ],
    cta: 'Start Free Trial'
  },
  {
    id: 'starter',
    name: 'Starter Plan',
    price: '$7',
    period: '/month',
    description: 'Perfect for small businesses just getting started',
    features: [
      { name: 'Staff members', included: true, limited: 'Up to 3' },
      { name: 'Monthly bookings', included: true, limited: '1,000' },
      { name: 'QR code booking system', included: true },
      { name: 'Email notifications', included: true },
      { name: 'SMS & WhatsApp reminders', included: false },
      { name: 'Add clients directly', included: false },
      { name: 'Client data retention', included: false },
      { name: 'Basic analytics', included: true },
    ],
    popular: true,
    cta: 'Choose Starter'
  },
  {
    id: 'business',
    name: 'Business Plan',
    price: '$20',
    period: '/month',
    description: 'Growing businesses with advanced needs',
    features: [
      { name: 'Staff members', included: true, limited: 'Up to 15' },
      { name: 'Monthly bookings', included: true, limited: '3,000' },
      { name: 'QR code booking system', included: true },
      { name: 'Email notifications', included: true },
      { name: 'SMS & WhatsApp reminders', included: true },
      { name: 'Add clients directly', included: true },
      { name: 'Client data retention', included: true },
      { name: 'Advanced analytics', included: true },
    ],
    cta: 'Choose Business'
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    price: '$69',
    period: '/month',
    description: 'Large organizations with unlimited needs',
    features: [
      { name: 'Staff members', included: true, limited: 'Unlimited' },
      { name: 'Monthly bookings', included: true, limited: 'Unlimited' },
      { name: 'QR code booking system', included: true },
      { name: 'Email notifications', included: true },
      { name: 'SMS & WhatsApp reminders', included: true },
      { name: 'Add clients directly', included: true },
      { name: 'Client data retention', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'API access', included: true },
      { name: 'Priority support', included: true },
    ],
    cta: 'Choose Enterprise'
  }
];

export const LandingPagePlans = () => {
  const handlePlanSelect = (planId: string) => {
    if (planId === 'trial') {
      window.location.href = '/auth?mode=signup';
    } else {
      window.location.href = '/app/subscription';
    }
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Perfect Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start with a 7-day free trial, then choose the plan that fits your business needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${plan.popular ? 'border-blue-500 border-2 shadow-lg' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-blue-600">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                <p className="text-gray-600 text-sm mt-2">{plan.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <span className={feature.included ? 'text-gray-900' : 'text-gray-400'}>
                          {feature.name}
                        </span>
                        {feature.limited && (
                          <span className="text-blue-600 font-medium ml-2">
                            ({feature.limited})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={() => handlePlanSelect(plan.id)}
                  className={`w-full mt-6 ${
                    plan.popular 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600">
            All plans include our QR code booking system, secure payments, and 24/7 support
          </p>
        </div>
      </div>
    </section>
  );
};
