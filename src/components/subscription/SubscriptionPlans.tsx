
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Smartphone } from 'lucide-react';

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
      '14-day Medium Plan trial',
      'All Medium Plan features',
      'No credit card required',
      'Email support'
    ],
    popular: true
  },
  {
    id: 'freemium',
    name: 'Freemium',
    price: 0,
    priceId: '',
    features: [
      'Up to 3 staff members',
      'Up to 100 bookings/month',
      'Basic calendar',
      'Limited analytics',
      'Community support'
    ],
    staffLimit: 3,
    bookingsLimit: 100
  },
  {
    id: 'medium',
    name: 'Medium Plan',
    price: 29,
    priceId: 'price_medium',
    features: [
      'Up to 15 staff members',
      'Up to 3,000 bookings/month',
      'QR code system',
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
    name: 'Premium Plan',
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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
      {plans.map((plan) => (
        <Card key={plan.id} className={`relative ${plan.popular ? 'border-royal-red shadow-lg' : ''}`}>
          {plan.popular && (
            <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-royal-red">
              <Star className="w-3 h-3 mr-1" />
              Most Popular
            </Badge>
          )}
          
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{plan.name}</CardTitle>
            <div className="text-3xl font-bold">
              ${plan.price}
              {plan.price > 0 && <span className="text-lg font-normal text-gray-600">/month</span>}
            </div>
            {plan.staffLimit && (
              <p className="text-sm text-gray-600">
                Up to {plan.staffLimit} staff • {plan.bookingsLimit?.toLocaleString()} bookings
              </p>
            )}
          </CardHeader>
          
          <CardContent>
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button
              className="w-full"
              variant={currentPlan === plan.id ? 'outline' : 'default'}
              onClick={() => onSelectPlan(plan.id, plan.priceId)}
              disabled={isLoading || currentPlan === plan.id}
            >
              {currentPlan === plan.id ? 'Current Plan' : 
               plan.price === 0 ? (plan.id === 'trial' ? 'Start Free Trial' : 'Get Started') : 
               <span className="flex items-center gap-2">
                 <Smartphone className="h-4 w-4" />
                 Pay with Paystack
               </span>}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
