
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Smartphone, Crown, Zap, AlertCircle, CreditCard, Building2 } from 'lucide-react';
import { toast } from 'sonner';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  priceId: string;
  paystackUrl?: string;
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
    price: 2900,
    priceId: 'price_medium',
    paystackUrl: 'https://paystack.shop/pay/business-plan-2900',
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
    price: 9900,
    priceId: 'price_premium',
    paystackUrl: 'https://paystack.shop/pay/enterprise-plan-9900',
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

  const handlePlanSelection = (plan: SubscriptionPlan) => {
    if (plan.id === 'trial') {
      onSelectPlan(plan.id, plan.priceId);
    } else if (plan.paystackUrl) {
      // Open Paystack payment page in new tab
      window.open(plan.paystackUrl, '_blank');
      toast.success('Redirected to Paystack payment page');
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Methods Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Payment Options Available</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <p><strong>1. Online Payment:</strong> Pay securely via Paystack (Card, Bank Transfer, USSD)</p>
              <p><strong>2. M-Pesa Payment:</strong> Send payment to our M-Pesa account</p>
              <p><strong>3. Bank Payment:</strong> Pay via KCB Paybill - 522522, Account: 1769155</p>
            </div>
          </div>
        </div>
      </div>

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
                KES {plan.price.toLocaleString()}
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
                onClick={() => handlePlanSelection(plan)}
                disabled={isLoading || currentPlan === plan.id}
              >
                {currentPlan === plan.id ? 'Current Plan' : 
                 plan.price === 0 ? 'Start Free Trial' : 
                 'Pay with Paystack'}
              </Button>

              {plan.price > 0 && (
                <div className="text-xs text-gray-500 text-center">
                  Secure payment via Paystack
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Manual Payment Instructions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-4xl mx-auto">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Manual Payment Options
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">M-Pesa Payment</h4>
            <div className="bg-white p-4 rounded border">
              <p className="text-sm text-gray-600 mb-2">Send payment to:</p>
              <div className="space-y-1 text-sm">
                <p><strong>Paybill:</strong> 400200</p>
                <p><strong>Account:</strong> Your business email</p>
                <p><strong>Amount:</strong> Plan amount</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Bank Payment (KCB)</h4>
            <div className="bg-white p-4 rounded border">
              <p className="text-sm text-gray-600 mb-2">Bank details:</p>
              <div className="space-y-1 text-sm">
                <p><strong>Paybill:</strong> 522522</p>
                <p><strong>Account No:</strong> 1769155</p>
                <p><strong>Reference:</strong> Your business name</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> After making payment, please email your transaction receipt to 
            <a href="mailto:payments@boinvit.com" className="text-blue-600 hover:underline ml-1">
              payments@boinvit.com
            </a> with your business details for account activation.
          </p>
        </div>
      </div>
    </div>
  );
};
