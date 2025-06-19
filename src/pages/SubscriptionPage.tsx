
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SubscriptionPlans } from '@/components/subscription/SubscriptionPlans';
import { SubscriptionStatus } from '@/components/subscription/SubscriptionStatus';
import { PaystackIntegration } from '@/components/payment/PaystackIntegration';
import { useSubscription } from '@/hooks/useSubscription';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

const SubscriptionPage = () => {
  const { user } = useAuth();
  const { subscription, isLoading, createSubscription, isCreatingSubscription } = useSubscription();

  // Get user's business
  const { data: business } = useQuery({
    queryKey: ['user-business', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleSelectPlan = (planId: string, priceId: string) => {
    if (!business) {
      console.error('No business found');
      return;
    }

    createSubscription({ planType: planId, businessId: business.id });
  };

  const handleUpgrade = () => {
    // Scroll to plans section or show modal
    const plansSection = document.querySelector('[data-plans-section]');
    if (plansSection) {
      plansSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <LoadingSkeleton lines={6} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Subscription Plans</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan for your business. Start with a 14-day free trial with full access to all features.
          </p>
        </div>

        {subscription && (
          <div className="max-w-2xl mx-auto">
            <SubscriptionStatus
              subscription={subscription}
              onUpgrade={handleUpgrade}
              businessId={business?.id || ''}
            />
          </div>
        )}

        <Tabs defaultValue="plans" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="plans">All Plans</TabsTrigger>
            <TabsTrigger value="payment">Payment Options</TabsTrigger>
          </TabsList>
          
          <TabsContent value="plans" className="space-y-8">
            <div data-plans-section>
              <h2 className="text-2xl font-semibold text-center mb-8">Available Plans</h2>
              <SubscriptionPlans
                currentPlan={subscription?.plan_type}
                onSelectPlan={handleSelectPlan}
                isLoading={isCreatingSubscription}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="payment" className="space-y-8">
            <PaystackIntegration />
          </TabsContent>
        </Tabs>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Plan Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Free Trial</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• 14 days full access</li>
                  <li>• All features included</li>
                  <li>• No limitations</li>
                  <li>• Perfect for testing</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Business Plan</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Up to 15 staff members</li>
                  <li>• 3,000 bookings/month</li>
                  <li>• QR code system</li>
                  <li>• Basic analytics</li>
                  <li>• Email support</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Enterprise Plan</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Unlimited staff</li>
                  <li>• Unlimited bookings</li>
                  <li>• Advanced analytics</li>
                  <li>• Priority support</li>
                  <li>• API access</li>
                  <li>• Custom integrations</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SubscriptionPage;
