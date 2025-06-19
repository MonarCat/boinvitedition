
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, ExternalLink, Smartphone, Building2 } from 'lucide-react';

interface PaystackPlan {
  id: string;
  name: string;
  price: number;
  paystackUrl: string;
  description: string;
}

const paystackPlans: PaystackPlan[] = [
  {
    id: 'business',
    name: 'Business Plan',
    price: 2900,
    paystackUrl: 'https://paystack.shop/pay/business-plan-2900',
    description: 'Perfect for growing businesses with up to 15 staff members'
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan', 
    price: 9900,
    paystackUrl: 'https://paystack.shop/pay/enterprise-plan-9900',
    description: 'Unlimited features for large organizations'
  }
];

export const PaystackIntegration = () => {
  const handlePaystackPayment = (plan: PaystackPlan) => {
    window.open(plan.paystackUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Secure Online Payment</h2>
        <p className="text-gray-600">Pay safely using your preferred method via Paystack</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {paystackPlans.map((plan) => (
          <Card key={plan.id} className="border-blue-200 hover:shadow-lg transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                {plan.name}
              </CardTitle>
              <p className="text-2xl font-bold text-blue-600">
                KES {plan.price.toLocaleString()}<span className="text-sm font-normal">/month</span>
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-sm">{plan.description}</p>
              
              <Button 
                onClick={() => handlePaystackPayment(plan)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Pay with Paystack
              </Button>
              
              <div className="text-xs text-gray-500 text-center">
                Accepts: Cards, Bank Transfer, USSD, Mobile Money
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-medium text-green-900 mb-2">Why Paystack?</h3>
        <ul className="text-sm text-green-800 space-y-1">
          <li>✓ Bank-level security with SSL encryption</li>
          <li>✓ Multiple payment options (Cards, Banks, Mobile Money)</li>
          <li>✓ Instant account activation after payment</li>
          <li>✓ Local payment methods for Kenya</li>
        </ul>
      </div>

      {/* Alternative Payment Methods */}
      <div className="border-t pt-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Alternative Payment Methods
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">M-Pesa Payment</h4>
            <div className="text-sm space-y-1">
              <p>Paybill: <strong>400200</strong></p>
              <p>Account: <strong>Your Email</strong></p>
              <p>Send receipt to: payments@boinvit.com</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">KCB Bank Payment</h4>
            <div className="text-sm space-y-1">
              <p>Paybill: <strong>522522</strong></p>
              <p>Account: <strong>1769155</strong></p>
              <p>Reference: <strong>Your Business Name</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
