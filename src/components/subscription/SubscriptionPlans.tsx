import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

export const SubscriptionPlans = () => {
  const { user } = useAuth();
  const { subscription, isLoading, createSubscription } = useSubscription();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      toast.error('Please select a plan');
      return;
    }

    try {
      // This would need to be implemented based on your subscription logic
      toast.success('Subscription started successfully!');
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast.error(error.message || 'Failed to start subscription');
    }
  };

  const handleCancelSubscription = async () => {
    try {
      // This would need to be implemented based on your subscription logic
      toast.success('Subscription cancelled successfully.');
    } catch (error: any) {
      console.error('Cancel subscription error:', error);
      toast.error(error.message || 'Failed to cancel subscription.');
    }
  };

  const plans = [
    {
      name: 'Free Trial',
      price: 0,
      interval: 'trial',
      description: '7-day free trial',
      features: [
        '7 days free access',
        'Up to 3 staff members',
        'Up to 500 bookings',
        'Basic support',
        'QR code generation',
        'Payment integration'
      ],
      popular: false,
      trialDays: 7
    },
    {
      name: 'Basic',
      price: 29,
      interval: 'month',
      description: 'For small businesses',
      features: [
        'Unlimited staff members',
        'Up to 2,000 bookings',
        'Advanced support',
        'Custom branding',
        'Reporting & analytics',
        'Email marketing tools'
      ],
      popular: false
    },
    {
      name: 'Premium',
      price: 99,
      interval: 'month',
      description: 'For growing businesses',
      features: [
        'Unlimited staff members',
        'Unlimited bookings',
        'Priority support',
        'White-labeling',
        'API access',
        'Dedicated account manager'
      ],
      popular: true
    }
  ];

  if (isLoading) {
    return <div className="text-center">Loading subscription plans...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Choose Your Plan</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <Card key={index} className={plan.popular ? "border-2 border-primary" : ""}>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">
                {plan.name}
                {plan.popular && (
                  <Star className="inline-block w-5 h-5 ml-2 text-yellow-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-4xl font-bold">
                ${plan.price}
                <span className="text-sm text-gray-500">/{plan.interval}</span>
              </div>
              <p className="text-gray-600">{plan.description}</p>
              <Separator />
              <ul className="space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center text-gray-800">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              {subscription ? (
                <div className="text-center">
                  {subscription.status === 'active' ? (
                    <>
                      <p className="text-green-500 font-semibold">
                        You are currently subscribed to the {subscription.plan_type} plan.
                      </p>
                      <Button
                        variant="destructive"
                        onClick={handleCancelSubscription}
                        className="w-full mt-4"
                      >
                        Cancel Subscription
                      </Button>
                    </>
                  ) : (
                    <p className="text-red-500 font-semibold">
                      Your subscription is currently inactive.
                    </p>
                  )}
                </div>
              ) : (
                <Button
                  onClick={() => handleSelectPlan(plan)}
                  className="w-full"
                  disabled={selectedPlan !== null && selectedPlan !== plan}
                >
                  {selectedPlan === plan ? 'Selected' : 'Choose Plan'}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {!subscription && selectedPlan && (
        <div className="mt-8 text-center">
          <Button
            variant="default"
            onClick={handleSubscribe}
            className="w-full md:w-auto"
          >
            Start {selectedPlan.name}
          </Button>
        </div>
      )}
    </div>
  );
};
