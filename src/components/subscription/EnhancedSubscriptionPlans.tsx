
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star, Zap, Users, Calendar, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';
import { PaystackPlanRedirect } from './PaystackPlanRedirect';

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  description: string;
  features: string[];
  popular: boolean;
  staffLimit: number | null;
  bookingsLimit: number | null;
  color: string;
}

interface EnhancedSubscriptionPlansProps {
  currentPlan?: string;
  businessId: string;
  customerEmail?: string;
  onSelectPlan: (planId: string, interval: string, amount: number, paystackReference?: string) => void;
  isLoading?: boolean;
}

const PAYSTACK_PLAN_URLS = {
  trial: 'https://paystack.shop/pay/4qwq0f-lo6',
  starter: 'https://paystack.shop/pay/starter-plan-1020',
  medium: 'https://paystack.shop/pay/business-plan-2900',
  premium: 'https://paystack.shop/pay/enterprise-plan-9900'
};

export const EnhancedSubscriptionPlans: React.FC<EnhancedSubscriptionPlansProps> = ({
  currentPlan,
  businessId,
  customerEmail = '',
  onSelectPlan,
  isLoading = false
}) => {
  const plans: Plan[] = [
    {
      id: 'trial',
      name: 'Free Trial',
      price: 10,
      currency: 'KES',
      interval: '7 days',
      description: '7-day trial to test our platform',
      features: [
        '7 days full access',
        'Up to 3 staff members',
        'Up to 100 bookings',
        'QR code booking system',
        'Basic support',
        'Payment integration'
      ],
      popular: false,
      staffLimit: 3,
      bookingsLimit: 100,
      color: 'border-gray-200'
    },
    {
      id: 'starter',
      name: 'Starter',
      price: 1020,
      currency: 'KES',
      interval: 'month',
      description: 'Perfect for small businesses',
      features: [
        'Up to 5 staff members',
        'Up to 1,000 bookings/month',
        'QR code & online booking',
        'WhatsApp notifications',
        'Payment processing',
        'Basic analytics',
        'Email support'
      ],
      popular: false,
      staffLimit: 5,
      bookingsLimit: 1000,
      color: 'border-blue-200'
    },
    {
      id: 'medium',
      name: 'Business',
      price: 2900,
      currency: 'KES',
      interval: 'month',
      description: 'Most popular for growing businesses',
      features: [
        'Up to 15 staff members',
        'Up to 5,000 bookings/month',
        'Advanced booking management',
        'Staff attendance tracking',
        'Multi-location support',
        'Advanced analytics',
        'Priority support',
        'Custom branding'
      ],
      popular: true,
      staffLimit: 15,
      bookingsLimit: 5000,
      color: 'border-orange-200'
    },
    {
      id: 'premium',
      name: 'Enterprise',
      price: 8900,
      currency: 'KES',
      interval: 'month',
      description: 'For large enterprises',
      features: [
        'Unlimited staff members',
        'Unlimited bookings',
        'Advanced staff performance tracking',
        'White-label solution',
        'API access',
        'Custom integrations',
        'Dedicated account manager',
        '24/7 phone support'
      ],
      popular: false,
      staffLimit: null,
      bookingsLimit: null,
      color: 'border-purple-200'
    }
  ];

  const getPlanLevel = (planId: string): number => {
    const levels = { trial: 0, starter: 1, medium: 2, premium: 3 };
    return levels[planId as keyof typeof levels] || 0;
  };

  const getChangeType = (planId: string): 'upgrade' | 'downgrade' | 'same' | 'new' => {
    if (!currentPlan) return 'new';
    const currentLevel = getPlanLevel(currentPlan);
    const newLevel = getPlanLevel(planId);
    
    if (newLevel > currentLevel) return 'upgrade';
    if (newLevel < currentLevel) return 'downgrade';
    return 'same';
  };

  const handlePaystackRedirect = (plan: Plan) => {
    const paymentUrl = PAYSTACK_PLAN_URLS[plan.id as keyof typeof PAYSTACK_PLAN_URLS];
    if (paymentUrl) {
      window.open(paymentUrl, '_blank');
    }
  };

  const getButtonText = (plan: Plan) => {
    if (currentPlan === plan.id) return 'Current Plan';
    
    const changeType = getChangeType(plan.id);
    switch (changeType) {
      case 'upgrade':
        return 'Upgrade';
      case 'downgrade':
        return 'Downgrade';
      case 'new':
        return plan.id === 'trial' ? 'Start Free Trial' : 'Subscribe Now';
      default:
        return 'Subscribe Now';
    }
  };

  const getButtonIcon = (plan: Plan) => {
    if (currentPlan === plan.id) return CheckCircle;
    
    const changeType = getChangeType(plan.id);
    switch (changeType) {
      case 'upgrade':
        return ArrowUp;
      case 'downgrade':
        return ArrowDown;
      default:
        return ExternalLink;
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const changeType = getChangeType(plan.id);
          const ButtonIcon = getButtonIcon(plan);
          
          return (
            <Card 
              key={plan.id} 
              className={`relative ${plan.color} ${plan.popular ? 'ring-2 ring-orange-500' : ''} ${
                changeType === 'upgrade' ? 'ring-2 ring-green-500' : ''
              } ${changeType === 'downgrade' ? 'ring-2 ring-yellow-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-orange-500 text-white px-3 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              {changeType === 'upgrade' && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-green-500 text-white px-2 py-1">
                    <ArrowUp className="w-3 h-3 mr-1" />
                    Upgrade
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg font-semibold">{plan.name}</CardTitle>
                <div className="py-4">
                  <div className="text-3xl font-bold text-gray-900">
                    KSh {plan.price.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">per {plan.interval}</div>
                </div>
                <p className="text-sm text-gray-600">{plan.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Users className="w-3 h-3" />
                    <span>
                      {plan.staffLimit ? `Up to ${plan.staffLimit} staff` : 'Unlimited staff'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {plan.bookingsLimit ? `${plan.bookingsLimit.toLocaleString()} bookings` : 'Unlimited bookings'}
                    </span>
                  </div>
                </div>

                <PaystackPlanRedirect
                  planId={plan.id}
                  planName={plan.name}
                  price={plan.price}
                  isCurrentPlan={currentPlan === plan.id}
                  disabled={isLoading}
                  className={`${plan.popular ? 'bg-orange-600 hover:bg-orange-700' : ''} ${
                    changeType === 'upgrade' ? 'bg-green-600 hover:bg-green-700' : ''
                  }`}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Notice about external payment */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Secure Payment via Paystack</h4>
          <p className="text-sm text-blue-800">
            When you click "Pay with Paystack", you'll be redirected to our secure payment page. 
            After successful payment, your subscription will be automatically activated.
          </p>
          <div className="mt-2 text-xs text-blue-700">
            🔒 All payments are processed securely by Paystack with bank-level encryption
          </div>
        </div>
      </div>
    </div>
  );
};
