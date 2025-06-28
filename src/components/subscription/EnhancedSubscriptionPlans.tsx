import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star, Zap, Users, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import { MultiProviderPayment } from '../payment/MultiProviderPayment';

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

export const EnhancedSubscriptionPlans: React.FC<EnhancedSubscriptionPlansProps> = ({
  currentPlan,
  businessId,
  customerEmail = '',
  onSelectPlan,
  isLoading = false
}) => {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showPayment, setShowPayment] = useState(false);

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
      price: 399,
      currency: 'KES',
      interval: 'month',
      description: 'Perfect for solo entrepreneurs',
      features: [
        'Up to 1 staff member',
        'Up to 500 bookings/month',
        'QR code & online booking',
        'WhatsApp notifications',
        'Payment processing',
        'Basic analytics',
        'Email support'
      ],
      popular: false,
      staffLimit: 1,
      bookingsLimit: 500,
      color: 'border-green-200'
    },
    {
      id: 'economy',
      name: 'Economy',
      price: 899,
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
    const levels = { trial: 0, starter: 1, economy: 2, medium: 3, premium: 4 };
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

  const handleSelectPlan = (plan: Plan) => {
    if (currentPlan === plan.id) return;
    
    if (plan.id === 'trial') {
      // Handle trial directly
      onSelectPlan(plan.id, plan.interval, plan.price);
    } else {
      // Show payment for paid plans
      setSelectedPlan(plan);
      setShowPayment(true);
    }
  };

  const handlePaymentSuccess = (reference: string) => {
    if (selectedPlan) {
      onSelectPlan(selectedPlan.id, selectedPlan.interval, selectedPlan.price, reference);
      setShowPayment(false);
      setSelectedPlan(null);
    }
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    setShowPayment(false);
    setSelectedPlan(null);
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
        return Zap;
    }
  };

  if (showPayment && selectedPlan) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Complete Your Subscription</h3>
          <p className="text-gray-600">
            You're subscribing to the {selectedPlan.name} plan for KSh {selectedPlan.price.toLocaleString()}/{selectedPlan.interval}
          </p>
        </div>
        
        <div className="max-w-md mx-auto">
          <MultiProviderPayment
            plan={selectedPlan}
            businessId={businessId}
            customerEmail={customerEmail}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </div>
        
        <div className="text-center">
          <Button variant="outline" onClick={() => setShowPayment(false)}>
            Back to Plans
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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

                <Button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={currentPlan === plan.id || isLoading}
                  className={`w-full ${plan.popular ? 'bg-orange-600 hover:bg-orange-700' : ''} ${
                    changeType === 'upgrade' ? 'bg-green-600 hover:bg-green-700' : ''
                  }`}
                >
                  <ButtonIcon className="w-4 h-4 mr-2" />
                  {getButtonText(plan)}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payment Information */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Secure Payment Options</h4>
          <p className="text-sm text-blue-800">
            When you select a paid plan, you'll see secure payment options including M-Pesa, Airtel Money, 
            and card payments. All payments are processed securely through Paystack.
          </p>
          <div className="mt-2 text-xs text-blue-700">
            🔒 Your subscription will be activated immediately after successful payment
          </div>
        </div>
      </div>
    </div>
  );
};
