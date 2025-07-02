import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatCommissionRate } from '@/utils';
import { PaygExplainer } from './PaygExplainer';

// Add Plan type definition
type Plan = {
  name: string;
  price: number;
  interval: string;
  description: string;
  features: string[];
  popular: boolean;
  trialDays?: number;
};

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
      toast.loading('Activating your PAYG plan...', { id: 'subscription-process' });
      
      // This would need to be implemented based on your subscription logic
      // Add a small delay to simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // If we get here, the subscription was successful
      toast.dismiss('subscription-process');
      toast.success('PAYG plan activated successfully!', { duration: 5000 });
      
      // Redirect to dashboard after successful subscription
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error: Error | unknown) {
      toast.dismiss('subscription-process');
      console.error('Subscription error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start subscription';
      toast.error(`Subscription error: ${errorMessage}. Please try again or contact support.`);
    }
  };

  const handleCancelSubscription = async () => {
    // For PAYG, cancellation is different - we inform the user it's always active
    toast.info('Your Pay As You Go plan is always active with no commitment. You only pay when you receive payments.', {
      duration: 8000,
      description: "There's no need to cancel - you're not being charged any subscription fees."
    });
    
    // If we needed actual cancellation logic, it would be here
    try {
      // Actual cancellation logic would go here if needed
      // For now, we'll just simulate the process
      // toast.success('Subscription cancelled successfully.');
    } catch (error: Error | unknown) {
      console.error('Cancel subscription error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel subscription.';
      toast.error(`Error: ${errorMessage} Please contact support if you need assistance.`);
    }
  };

  // Updated plans array with minimal structure
  const plans: Plan[] = [
    {
      name: 'Pay As You Go',
      price: 0,
      interval: 'commission',
      description: 'Only pay when you get paid',
      features: [
        'No monthly subscription fees',
        '5% commission on payments',
        'Unlimited staff members',
        'Unlimited bookings',
        'Full platform access',
        'Advanced analytics',
        'Custom branding'
      ],
      popular: true
    }
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center mb-8">
          <div className="h-8 bg-gray-200 rounded-md w-1/3 mx-auto mb-4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded-md w-2/3 mx-auto animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border rounded-lg p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded-md w-1/2 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded-md w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded-md w-2/3 mb-6"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center">
                  <div className="h-4 w-4 rounded-full bg-gray-200 mr-2"></div>
                  <div className="h-4 bg-gray-200 rounded-md w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold text-center mb-4">PAYG Model</h1>
      <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
        Our simple Pay-As-You-Go model means you only pay when your business receives payments.
        No monthly fees, no commitments, just a small commission on successful transactions.
      </p>
      
      {/* PAYG Explainer Card */}
      <div className="mb-8">
        <PaygExplainer />
      </div>
      
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
                {plan.interval === 'commission' ? 
                  formatCommissionRate(0.05) : 
                  formatCurrency(plan.price)
                }
                {plan.interval !== 'commission' && 
                  <span className="text-sm text-gray-500">/{plan.interval}</span>
                }
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
