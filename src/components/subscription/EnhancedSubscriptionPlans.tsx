
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Crown, Star, Zap, TrendingUp, Clock } from 'lucide-react';
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
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'trial',
    name: 'Free Trial',
    description: '14 days of full access to test all features',
    features: [
      '14 days full access',
      'All features included',
      'No limitations during trial',
      'QR code booking system',
      'WhatsApp notifications',
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
    icon: <Clock className="w-6 h-6 text-orange-600" />
  },
  {
    id: 'payasyougo',
    name: 'Pay As You Go',
    description: 'Perfect for businesses with occasional bookings',
    features: [
      'No monthly fees',
      '7% commission per booking',
      'Prepaid bookings only',
      'Automatic payment splits',
      'QR code booking system',
      'WhatsApp notifications',
      'Real-time settlements'
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
    icon: <TrendingUp className="w-6 h-6 text-purple-600" />
  },
  {
    id: 'starter',
    name: 'Starter Plan',
    description: 'Perfect for small businesses getting started',
    features: [
      'Up to 5 staff members',
      '1,000 bookings/month',
      'QR code booking system',
      'WhatsApp notifications',
      'Basic analytics',
      'Email support'
    ],
    pricing: {
      monthly: 1020,
      quarterly: 2754, // 10% discount
      biannual: 5202, // 15% discount
      annual: 9792, // 20% discount
      twoYear: 18360, // 25% discount
      threeYear: 26010 // 30% discount
    },
    discounts: {
      quarterly: 10,
      biannual: 15,
      annual: 20,
      twoYear: 25,
      threeYear: 30
    },
    limits: { staff: 5, bookings: 1000 },
    icon: <Zap className="w-6 h-6 text-blue-600" />
  },
  {
    id: 'medium',
    name: 'Business Plan',
    description: 'Perfect for growing businesses',
    features: [
      'Up to 15 staff members',
      '3,000 bookings/month',
      'QR code booking system',
      'WhatsApp notifications',
      'Advanced analytics',
      'Priority email support',
      'Custom branding'
    ],
    pricing: {
      monthly: 2900,
      quarterly: 7830, // 10% discount
      biannual: 14790, // 15% discount
      annual: 27840, // 20% discount
      twoYear: 52200, // 25% discount
      threeYear: 73980 // 30% discount
    },
    discounts: {
      quarterly: 10,
      biannual: 15,
      annual: 20,
      twoYear: 25,
      threeYear: 30
    },
    limits: { staff: 15, bookings: 3000 },
    icon: <Star className="w-6 h-6 text-purple-600" />,
    popular: true
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
      'White-label options'
    ],
    pricing: {
      monthly: 9900,
      quarterly: 26730, // 10% discount
      biannual: 50490, // 15% discount
      annual: 95040, // 20% discount
      twoYear: 178200, // 25% discount
      threeYear: 252450 // 30% discount
    },
    discounts: {
      quarterly: 10,
      biannual: 15,
      annual: 20,
      twoYear: 25,
      threeYear: 30
    },
    limits: { staff: null, bookings: null },
    icon: <Crown className="w-6 h-6 text-gold-600" />
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
      <div className="space-y-4">
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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="quarterly">
            Quarterly
            <Badge variant="secondary" className="ml-1">-10%</Badge>
          </TabsTrigger>
          <TabsTrigger value="biannual">
            6 Months
            <Badge variant="secondary" className="ml-1">-15%</Badge>
          </TabsTrigger>
          <TabsTrigger value="annual">
            Annual
            <Badge variant="secondary" className="ml-1">-20%</Badge>
          </TabsTrigger>
          <TabsTrigger value="twoYear">
            2 Years
            <Badge variant="secondary" className="ml-1">-25%</Badge>
          </TabsTrigger>
          <TabsTrigger value="threeYear">
            3 Years
            <Badge variant="secondary" className="ml-1">-30%</Badge>
          </TabsTrigger>
        </TabsList>

        {(['monthly', 'quarterly', 'biannual', 'annual', 'twoYear', 'threeYear'] as const).map((interval) => (
          <TabsContent key={interval} value={interval} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {subscriptionPlans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`relative ${
                    plan.popular ? 'ring-2 ring-purple-500 shadow-lg' : ''
                  } ${currentPlan === plan.id ? 'ring-2 ring-green-500' : ''}`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-purple-600">
                      Most Popular
                    </Badge>
                  )}
                  {currentPlan === plan.id && (
                    <Badge className="absolute -top-2 right-4 bg-green-600">
                      Current Plan
                    </Badge>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-2">
                      {plan.icon}
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="text-3xl font-bold text-gray-900">
                      KES {plan.pricing[interval].toLocaleString()}
                      <span className="text-sm font-normal text-gray-600">
                        {interval === 'monthly' ? '/month' : 
                         interval === 'quarterly' ? '/quarter' :
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

                    <div className="pt-4">
                      {currentPlan === plan.id ? (
                        <Button disabled className="w-full">
                          Current Plan
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handlePlanSelect(plan, interval)}
                          disabled={isLoading}
                          className="w-full"
                          variant={plan.popular ? 'default' : 'outline'}
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
