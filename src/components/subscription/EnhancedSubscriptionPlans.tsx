
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Crown, Star, Zap, Smartphone, CreditCard, AlertCircle } from 'lucide-react';
import { MpesaSTKPush } from '@/components/payment/MpesaSTKPush';
import { PaystackPayment } from '@/components/payment/PaystackPayment';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice?: number;
  features: string[];
  popular?: boolean;
  color: string;
  icon: React.ReactNode;
  staffLimit?: number;
  bookingsLimit?: number;
}

interface EnhancedSubscriptionPlansProps {
  currentPlan?: string;
  onSelectPlan: (planId: string, interval: string) => void;
  businessId: string;
}

const plans: SubscriptionPlan[] = [
  {
    id: 'trial',
    name: 'Free Trial',
    description: 'KES 10 one-time setup fee to initialize your business account',
    monthlyPrice: 10,
    features: [
      '7 days full access',
      'All features included', 
      'Unlimited staff & bookings',
      'QR code system',
      'Email & SMS notifications'
    ],
    color: 'bg-gray-50 border-gray-200',
    icon: <Zap className="h-6 w-6" />
  },
  {
    id: 'payasyougo',
    name: 'Pay As You Go',
    description: 'Perfect for businesses with irregular bookings - only pay when you earn',
    monthlyPrice: 0,
    features: [
      'No monthly fees',
      '7.5% commission per booking',
      'Automatic payment splitting',
      'Unlimited staff',
      'All premium features',
      'QR code system'
    ],
    color: 'bg-blue-50 border-blue-200',
    icon: <Star className="h-6 w-6" />,
    popular: true
  },
  {
    id: 'starter',
    name: 'Starter Plan',
    description: 'Great for small businesses getting started',
    monthlyPrice: 1020,
    yearlyPrice: 10200,
    staffLimit: 5,
    bookingsLimit: 1000,
    features: [
      'Up to 5 staff members',
      '1,000 bookings/month',
      'Basic analytics',
      'Email support',
      'QR code system'
    ],
    color: 'bg-green-50 border-green-200',
    icon: <Zap className="h-6 w-6" />
  },
  {
    id: 'medium',
    name: 'Business Plan',
    description: 'Perfect for growing businesses',
    monthlyPrice: 2900,
    yearlyPrice: 29000,
    staffLimit: 15,
    bookingsLimit: 3000,
    features: [
      'Up to 15 staff members',
      '3,000 bookings/month',
      'Advanced analytics',
      'Priority support',
      'SMS & WhatsApp notifications',
      'QR code system'
    ],
    color: 'bg-purple-50 border-purple-200',
    icon: <Crown className="h-6 w-6" />
  },
  {
    id: 'premium',
    name: 'Enterprise Plan',
    description: 'Unlimited features for large organizations',
    monthlyPrice: 9900,
    yearlyPrice: 99000,
    features: [
      'Unlimited staff',
      'Unlimited bookings',
      'Advanced analytics',
      'Priority support',
      'API access',
      'Custom integrations',
      'QR code system'
    ],
    color: 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300',
    icon: <Crown className="h-6 w-6 text-purple-600" />
  }
];

const paymentIntervals = [
  { id: 'monthly', name: 'Monthly', discount: 0 },
  { id: 'quarterly', name: '3 Months', discount: 5 },
  { id: 'biannual', name: '6 Months', discount: 10 },
  { id: 'annual', name: '1 Year', discount: 15 },
  { id: '2year', name: '2 Years', discount: 20 },
  { id: '3year', name: '3 Years', discount: 25 }
];

export const EnhancedSubscriptionPlans: React.FC<EnhancedSubscriptionPlansProps> = ({
  currentPlan,
  onSelectPlan,
  businessId
}) => {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedInterval, setSelectedInterval] = useState('monthly');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa');

  const calculateDiscountedPrice = (basePrice: number, discount: number, interval: string) => {
    const discountedPrice = basePrice * (1 - discount / 100);
    const multiplier = interval === 'quarterly' ? 3 : interval === 'biannual' ? 6 : interval === 'annual' ? 12 : interval === '2year' ? 24 : interval === '3year' ? 36 : 1;
    return Math.floor(discountedPrice * multiplier);
  };

  const handlePlanSelection = (plan: SubscriptionPlan) => {
    if (plan.id === 'trial') {
      // Direct payment for trial
      setSelectedPlan(plan);
    } else if (plan.id === 'payasyougo') {
      // No upfront payment, just setup
      onSelectPlan(plan.id, 'monthly');
      toast.success('Pay-as-you-go plan activated! You\'ll be charged 7.5% per successful booking.');
    } else {
      setSelectedPlan(plan);
    }
  };

  const handlePaymentSuccess = (reference: string) => {
    if (selectedPlan) {
      onSelectPlan(selectedPlan.id, selectedInterval);
      setSelectedPlan(null);
      toast.success('Payment successful! Your subscription is now active.');
    }
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    toast.error('Payment failed. Please try again.');
  };

  const getDisplayPrice = (plan: SubscriptionPlan, interval: string) => {
    if (plan.id === 'trial') return plan.monthlyPrice;
    if (plan.id === 'payasyougo') return 0;
    
    const intervalData = paymentIntervals.find(p => p.id === interval);
    if (!intervalData) return plan.monthlyPrice;
    
    return calculateDiscountedPrice(plan.monthlyPrice, intervalData.discount, interval);
  };

  if (selectedPlan) {
    const intervalData = paymentIntervals.find(p => p.id === selectedInterval);
    const totalAmount = getDisplayPrice(selectedPlan, selectedInterval);
    
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {selectedPlan.icon}
              Complete Payment for {selectedPlan.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Plan:</span>
                <span>{selectedPlan.name}</span>
              </div>
              {selectedPlan.id !== 'trial' && (
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Billing Period:</span>
                  <span>{intervalData?.name}</span>
                </div>
              )}
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total Amount:</span>
                <span>KES {totalAmount.toLocaleString()}</span>
              </div>
              {intervalData && intervalData.discount > 0 && (
                <p className="text-sm text-green-600 mt-2">
                  Save {intervalData.discount}% with {intervalData.name} billing!
                </p>
              )}
            </div>

            <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'mpesa' | 'card')}>
              <TabsList className="w-full">
                <TabsTrigger value="mpesa" className="flex-1">
                  <Smartphone className="w-4 h-4 mr-2" />
                  M-Pesa
                </TabsTrigger>
                <TabsTrigger value="card" className="flex-1">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Card/Bank
                </TabsTrigger>
              </TabsList>

              <TabsContent value="mpesa">
                <MpesaSTKPush
                  amount={totalAmount}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  description={`${selectedPlan.name} - ${intervalData?.name || 'One-time'} Payment`}
                  metadata={{
                    planId: selectedPlan.id,
                    businessId: businessId,
                    userId: user?.id,
                    interval: selectedInterval
                  }}
                />
              </TabsContent>

              <TabsContent value="card">
                <PaystackPayment
                  amount={totalAmount}
                  email={user?.email || ''}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  metadata={{
                    planId: selectedPlan.id,
                    businessId: businessId,
                    userId: user?.id,
                    interval: selectedInterval
                  }}
                />
              </TabsContent>
            </Tabs>

            <Button 
              variant="outline" 
              onClick={() => setSelectedPlan(null)}
              className="w-full"
            >
              Back to Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Payment Interval Selector (excluding trial and payasyougo) */}
      <div className="max-w-4xl mx-auto">
        <h3 className="text-lg font-semibold mb-4 text-center">Choose Billing Period</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {paymentIntervals.map((interval) => (
            <Button
              key={interval.id}
              variant={selectedInterval === interval.id ? "default" : "outline"}
              onClick={() => setSelectedInterval(interval.id)}
              className="text-xs flex flex-col h-auto py-2"
            >
              <span>{interval.name}</span>
              {interval.discount > 0 && (
                <Badge variant="secondary" className="text-xs mt-1">
                  Save {interval.discount}%
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.id;
          const displayPrice = getDisplayPrice(plan, selectedInterval);
          const intervalData = paymentIntervals.find(p => p.id === selectedInterval);
          
          return (
            <Card 
              key={plan.id}
              className={`relative ${plan.color} ${isCurrentPlan ? 'ring-2 ring-purple-500' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-600">
                  Most Popular
                </Badge>
              )}
              
              {isCurrentPlan && (
                <Badge className="absolute -top-2 right-4 bg-purple-600">
                  Current Plan
                </Badge>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-2">
                  {plan.icon}
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-gray-900">
                  {plan.id === 'payasyougo' ? (
                    <div>
                      <span className="text-lg">7.5%</span>
                      <div className="text-sm font-normal text-gray-600">per booking</div>
                    </div>
                  ) : (
                    <div>
                      KES {displayPrice.toLocaleString()}
                      {plan.id !== 'trial' && (
                        <div className="text-sm font-normal text-gray-600">
                          /{intervalData?.name.toLowerCase()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {plan.id !== 'trial' && plan.id !== 'payasyougo' && intervalData && intervalData.discount > 0 && (
                  <p className="text-sm text-green-600">
                    Save {intervalData.discount}% vs monthly billing
                  </p>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm">{plan.description}</p>
                
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {plan.id === 'payasyougo' && (
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-blue-800">
                        <p className="font-medium mb-1">How it works:</p>
                        <p>• Clients pay for bookings upfront</p>
                        <p>• You receive 92.5% automatically</p>
                        <p>• We keep 7.5% as platform fee</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  {isCurrentPlan ? (
                    <Button disabled className="w-full">
                      Current Plan
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handlePlanSelection(plan)}
                      className="w-full"
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.id === 'trial' ? 'Start Free Trial' : 
                       plan.id === 'payasyougo' ? 'Activate Plan' : 
                       'Choose Plan'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
