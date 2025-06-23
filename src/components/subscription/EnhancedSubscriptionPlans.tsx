
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star, Zap, Users, Calendar } from 'lucide-react';
import { MultiProviderPayment } from '@/components/payment/MultiProviderPayment';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
  onSelectPlan: (planId: string, interval: string, amount: number) => void;
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Updated pricing structure
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
      id: 'business',
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
      id: 'enterprise',
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

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (reference: string) => {
    setShowPaymentModal(false);
    onSelectPlan(selectedPlan!.id, selectedPlan!.interval, selectedPlan!.price);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${plan.color} ${plan.popular ? 'ring-2 ring-orange-500' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-orange-500 text-white px-3 py-1">
                  <Star className="w-3 h-3 mr-1" />
                  Most Popular
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
                disabled={isLoading || currentPlan === plan.id}
                className={`w-full ${plan.popular ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
                variant={currentPlan === plan.id ? 'outline' : 'default'}
              >
                {currentPlan === plan.id ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Current Plan
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    {plan.id === 'trial' ? 'Start Free Trial' : 'Subscribe Now'}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Subscription</DialogTitle>
          </DialogHeader>
          {selectedPlan && (
            <MultiProviderPayment
              plan={selectedPlan}
              businessId={businessId}
              customerEmail={customerEmail}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
