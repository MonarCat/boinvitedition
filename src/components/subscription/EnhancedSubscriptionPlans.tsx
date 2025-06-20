
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Crown, Star, Zap, TrendingUp, Clock, Percent } from 'lucide-react';
import { EnhancedPaymentFlow } from '@/components/payment/EnhancedPaymentFlow';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  features: string[];
  pricing: {
    monthly: number;
    quarterly: number;
    biannual: number;
    annual: number;
    twoYear: number;
    threeYear: number;
  };
  discounts: {
    quarterly: number;
    biannual: number;
    annual: number;
    twoYear: number;
    threeYear: number;
  };
  limits: {
    staff: number | null;
    bookings: number | null;
  };
  icon: React.ReactNode;
  popular?: boolean;
  color: string;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'trial',
    name: 'Free Trial',
    description: '14 days of full access with one-time setup fee',
    features: [
      '14 days complete access',
      'All premium features included',
      'QR code booking system',
      'WhatsApp notifications',
      'Client management',
      'Perfect for testing'
    ],
    pricing: {
      monthly: 10,
      quarterly: 10,
      biannual: 10,
      annual: 10,
      twoYear: 10,
      threeYear: 10
    },
    discounts: {
      quarterly: 0,
      biannual: 0,
      annual: 0,
      twoYear: 0,
      threeYear: 0
    },
    limits: { staff: null, bookings: null },
    icon: <Clock className="w-6 h-6" />,
    color: 'from-orange-500 to-amber-500'
  },
  {
    id: 'payasyougo',
    name: 'Pay As You Go',
    description: 'Perfect for businesses with occasional bookings',
    features: [
      'No monthly subscription fees',
      '7% commission per booking',
      'Clients must prepay for bookings',
      'Automatic 93% payment to you',
      'Real-time settlements',
      'QR code booking system',
      'WhatsApp notifications'
    ],
    pricing: {
      monthly: 10,
      quarterly: 10,
      biannual: 10,
      annual: 10,
      twoYear: 10,
      threeYear: 10
    },
    discounts: {
      quarterly: 0,
      biannual: 0,
      annual: 0,
      twoYear: 0,
      threeYear: 0
    },
    limits: { staff: null, bookings: null },
    icon: <Percent className="w-6 h-6" />,
    color: 'from-purple-500 to-indigo-500'
  },
  {
    id: 'starter',
    name: 'Starter Plan',
    description: 'Perfect for small businesses getting started',
    features: [
      'Up to 5 staff members',
      '1,000 bookings per month',
      'QR code booking system',
      'WhatsApp notifications',
      'Basic analytics dashboard',
      'Email support',
      'No commission fees'
    ],
    pricing: {
      monthly: 1020,
      quarterly: 2754,
      biannual: 5202,
      annual: 9792,
      twoYear: 18360,
      threeYear: 26010
    },
    discounts: {
      quarterly: 10,
      biannual: 15,
      annual: 20,
      twoYear: 25,
      threeYear: 30
    },
    limits: { staff: 5, bookings: 1000 },
    icon: <Zap className="w-6 h-6" />,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'medium',
    name: 'Business Plan',
    description: 'Perfect for growing businesses',
    features: [
      'Up to 15 staff members',
      '3,000 bookings per month',
      'QR code booking system',
      'WhatsApp notifications',
      'Advanced analytics & reports',
      'Priority email support',
      'Custom branding options',
      'No commission fees'
    ],
    pricing: {
      monthly: 2900,
      quarterly: 7830,
      biannual: 14790,
      annual: 27840,
      twoYear: 52200,
      threeYear: 73980
    },
    discounts: {
      quarterly: 10,
      biannual: 15,
      annual: 20,
      twoYear: 25,
      threeYear: 30
    },
    limits: { staff: 15, bookings: 3000 },
    icon: <Star className="w-6 h-6" />,
    popular: true,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'premium',
    name: 'Enterprise Plan',
    description: 'Unlimited features for large organizations',
    features: [
      'Unlimited staff members',
      'Unlimited bookings',
      'QR code booking system',
      'WhatsApp notifications',
      'Advanced analytics & reports',
      '24/7 priority support',
      'Custom integrations',
      'API access',
      'White-label options',
      'No commission fees'
    ],
    pricing: {
      monthly: 9900,
      quarterly: 26730,
      biannual: 50490,
      annual: 95040,
      twoYear: 178200,
      threeYear: 252450
    },
    discounts: {
      quarterly: 10,
      biannual: 15,
      annual: 20,
      twoYear: 25,
      threeYear: 30
    },
    limits: { staff: null, bookings: null },
    icon: <Crown className="w-6 h-6" />,
    color: 'from-yellow-500 to-orange-500'
  }
];

interface EnhancedSubscriptionPlansProps {
  currentPlan?: string;
  businessId?: string;
  customerEmail?: string;
  onSelectPlan: (planId: string, interval: string, amount: number) => void;
  isLoading?: boolean;
}

export const EnhancedSubscriptionPlans: React.FC<EnhancedSubscriptionPlansProps> = ({
  currentPlan,
  businessId,
  customerEmail,
  onSelectPlan,
  isLoading = false
}) => {
  const [selectedPlan, setSelectedPlan] = React.useState<SubscriptionPlan | null>(null);
  const [selectedInterval, setSelectedInterval] = React.useState<string>('monthly');
  const [showPayment, setShowPayment] = React.useState(false);

  const handlePlanSelect = (plan: SubscriptionPlan, interval: string) => {
    setSelectedPlan(plan);
    setSelectedInterval(interval);
    setShowPayment(true);
  };

  const handlePaymentSuccess = (reference: string) => {
    if (selectedPlan) {
      onSelectPlan(selectedPlan.id, selectedInterval, selectedPlan.pricing[selectedInterval as keyof typeof selectedPlan.pricing]);
      setShowPayment(false);
      setSelectedPlan(null);
    }
  };

  if (showPayment && selectedPlan) {
    return (
      <div className="space-y-6">
        <Button 
          variant="outline" 
          onClick={() => setShowPayment(false)}
          className="mb-4"
        >
          ← Back to Plans
        </Button>
        <EnhancedPaymentFlow
          planType={selectedPlan.name}
          amount={selectedPlan.pricing[selectedInterval as keyof typeof selectedPlan.pricing]}
          businessId={businessId}
          customerEmail={customerEmail}
          onSuccess={handlePaymentSuccess}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Tabs defaultValue="monthly" className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-8">
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="quarterly">
            3 Months
            <Badge variant="secondary" className="ml-1 bg-green-100 text-green-700">-10%</Badge>
          </TabsTrigger>
          <TabsTrigger value="biannual">
            6 Months  
            <Badge variant="secondary" className="ml-1 bg-green-100 text-green-700">-15%</Badge>
          </TabsTrigger>
          <TabsTrigger value="annual">
            1 Year
            <Badge variant="secondary" className="ml-1 bg-green-100 text-green-700">-20%</Badge>
          </TabsTrigger>
          <TabsTrigger value="twoYear">
            2 Years
            <Badge variant="secondary" className="ml-1 bg-green-100 text-green-700">-25%</Badge>
          </TabsTrigger>
          <TabsTrigger value="threeYear">
            3 Years
            <Badge variant="secondary" className="ml-1 bg-green-100 text-green-700">-30%</Badge>
          </TabsTrigger>
        </TabsList>

        {(['monthly', 'quarterly', 'biannual', 'annual', 'twoYear', 'threeYear'] as const).map((interval) => (
          <TabsContent key={interval} value={interval} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {subscriptionPlans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`relative transition-all duration-200 hover:shadow-lg ${
                    plan.popular ? 'ring-2 ring-purple-500 shadow-lg scale-105' : 'hover:scale-102'
                  } ${currentPlan === plan.id ? 'ring-2 ring-green-500 bg-green-50' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-purple-600 text-white px-4 py-1">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  {currentPlan === plan.id && (
                    <div className="absolute -top-4 right-4">
                      <Badge className="bg-green-600 text-white px-3 py-1">
                        Current Plan
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4 pt-6">
                    <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center text-white mb-4`}>
                      {plan.icon}
                    </div>
                    <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-gray-900">
                        KES {plan.pricing[interval].toLocaleString()}
                        <span className="text-sm font-normal text-gray-600">
                          {interval === 'monthly' ? '/month' : 
                           interval === 'quarterly' ? '/3 months' :
                           interval === 'biannual' ? '/6 months' :
                           interval === 'annual' ? '/year' :
                           interval === 'twoYear' ? '/2 years' : '/3 years'}
                        </span>
                      </div>
                      {plan.discounts[interval] > 0 && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Save {plan.discounts[interval]}%
                        </Badge>
                      )}
                      {plan.pricing[interval] === 10 && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          One-time Setup Fee
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-gray-600 text-sm text-center">{plan.description}</p>
                    
                    <div className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4">
                      {currentPlan === plan.id ? (
                        <Button disabled className="w-full bg-green-600">
                          Current Plan
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handlePlanSelect(plan, interval)}
                          disabled={isLoading}
                          className={`w-full ${plan.popular ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                          {plan.id === 'trial' ? 'Start Free Trial' :
                           plan.id === 'payasyougo' ? 'Activate Pay-As-You-Go' :
                           'Choose Plan'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
