
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Smartphone, Crown, Zap } from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  priceId: string;
  features: string[];
  staffLimit?: number;
  bookingsLimit?: number;
  popular?: boolean;
}

const plans: SubscriptionPlan[] = [
  {
    id: 'trial',
    name: 'Free Trial',
    price: 0,
    priceId: '',
    features: [
      '14-day full access trial',
      'All Premium Plan features',
      'No credit card required',
      'Email support',
      'Perfect for testing'
    ],
    popular: true
  },
  {
    id: 'medium',
    name: 'Business Plan',
    price: 29,
    priceId: 'price_medium',
    features: [
      'Up to 15 staff members',
      'Up to 3,000 bookings/month',
      'QR code booking system',
      'Advanced analytics',
      'SMS & WhatsApp notifications',
      'Payment gateway integration',
      'Email support'
    ],
    staffLimit: 15,
    bookingsLimit: 3000
  },
  {
    id: 'premium',
    name: 'Enterprise Plan',
    price: 99,
    priceId: 'price_premium',
    features: [
      'Unlimited staff members',
      'Unlimited bookings',
      'Multi-location support',
      'Advanced reporting & analytics',
      'Priority support',
      'Custom integrations',
      'API access',
      'White-label options'
    ]
  }
];

interface SubscriptionPlansProps {
  currentPlan?: string;
  onSelectPlan: (planId: string, priceId: string) => void;
  isLoading?: boolean;
}

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  currentPlan,
  onSelectPlan,
  isLoading = false
}) => {
  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'trial': return <Zap className="w-6 h-6 text-blue-600" />;
      case 'medium': return <Star className="w-6 h-6 text-purple-600" />;
      case 'premium': return <Crown className="w-6 h-6 text-gold-600" />;
      default: return <Zap className="w-6 h-6" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {plans.map((plan) => (
        <Card key={plan.id} className={`relative ${plan.popular ? 'border-blue-500 shadow-lg scale-105' : 'border-gray-200'} transition-all hover:shadow-lg`}>
          {plan.popular && (
            <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
              <Star className="w-3 h-3 mr-1" />
              Most Popular
            </Badge>
          )}
          
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-2">
              {getPlanIcon(plan.id)}
            </div>
            <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
            <div className="text-4xl font-bold text-gray-900 mt-2">
              KES {plan.price}
              {plan.price > 0 && <span className="text-lg font-normal text-gray-600">/month</span>}
            </div>
            {plan.staffLimit && (
              <p className="text-sm text-gray-600 mt-2">
                Up to {plan.staffLimit} staff • {plan.bookingsLimit?.toLocaleString()} bookings
              </p>
            )}
          </CardHeader>
          
          <CardContent className="space-y-4">
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button
              className={`w-full ${plan.popular ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
              variant={currentPlan === plan.id ? 'outline' : (plan.popular ? 'default' : 'outline')}
              onClick={() => onSelectPlan(plan.id, plan.priceId)}
              disabled={isLoading || currentPlan === plan.id}
            >
              {currentPlan === plan.id ? 'Current Plan' : 
               plan.price === 0 ? 'Start Free Trial' : 
               <span className="flex items-center gap-2">
                 <Smartphone className="h-4 w-4" />
                 Subscribe with M-Pesa
               </span>}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
