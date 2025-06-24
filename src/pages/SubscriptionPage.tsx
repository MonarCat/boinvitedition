import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EnhancedSubscriptionPlans } from '@/components/subscription/EnhancedSubscriptionPlans';
import { SubscriptionStatus } from '@/components/subscription/SubscriptionStatus';
import { useSubscription } from '@/hooks/useSubscription';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp, Users, CheckCircle, Smartphone, CreditCard, Wallet } from 'lucide-react';
import { toast } from 'sonner';

const SubscriptionPage = () => {
  const { user } = useAuth();
  const { subscription, isLoading } = useSubscription();

  // Get user's business
  const { data: business, isLoading: isBusinessLoading } = useQuery({
    queryKey: ['user-business', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleSelectPlan = async (planId: string, interval: string, amount: number) => {
    if (!business) return;
    
    console.log('Plan selected successfully:', { planId, interval, amount, businessId: business.id });
    toast.success(`Successfully subscribed to ${planId} plan!`);
    
    // Refresh subscription data
    window.location.reload();
  };

  if (isLoading || isBusinessLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <LoadingSkeleton lines={6} />
        </div>
      </DashboardLayout>
    );
  }

  if (!business) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Subscription Plans</h1>
            <Card className="border-orange-200 bg-orange-50 max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-orange-800">Business Setup Required</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-orange-700 mb-4">
                  You need to set up your business profile before subscribing to a plan.
                </p>
                <button
                  onClick={() => window.location.href = '/app/settings'}
                  className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
                >
                  Set Up Business
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Flexible pricing options to match your business needs. Start with a free trial, 
            pay as you grow, or choose a subscription plan with seamless multi-provider payments.
          </p>
        </div>

        {subscription && (
          <div className="max-w-2xl mx-auto">
            <SubscriptionStatus
              subscription={subscription}
              onUpgrade={() => {}}
              businessId={business.id}
            />
          </div>
        )}

        {/* Enhanced Payment Methods Information */}
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Multi-Provider Payment Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <Smartphone className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium">M-Pesa STK Push</h4>
                    <p className="text-sm text-gray-600">Instant payment from your M-Pesa account</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Wallet className="w-5 h-5 text-red-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Airtel Money</h4>
                    <p className="text-sm text-gray-600">Quick payments via Airtel Money</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Cards & More</h4>
                    <p className="text-sm text-gray-600">Visa, Mastercard, and other options</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  🔒 All payments are secured by Paystack with bank-level encryption
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <EnhancedSubscriptionPlans
          currentPlan={subscription?.plan_type}
          businessId={business.id}
          customerEmail={user?.email}
          onSelectPlan={handleSelectPlan}
          isLoading={false}
        />

        {/* Plan Comparison Details */}
        <Card className="max-w-6xl mx-auto">
          <CardHeader>
            <CardTitle>Plan Details & Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <h4 className="font-semibold">Free Trial</h4>
                </div>
                <ul className="space-y-1 text-gray-600">
                  <li>• KES 10 initialization fee</li>
                  <li>• 7 days full access</li>
                  <li>• All features unlocked</li>
                  <li>• Perfect for testing</li>
                  <li>• No monthly charges</li>
                </ul>
              </div>
             
              <div className="space-y-3">
                <Badge className="bg-blue-100 text-blue-800 mb-2">Starter</Badge>
                <h4 className="font-semibold">KES 1,020/month</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• 5 staff members</li>
                  <li>• 1,000 bookings/month</li>
                  <li>• Basic features</li>
                  <li>• Email support</li>
                </ul>
              </div>

              <div className="space-y-3">
                <Badge className="bg-orange-100 text-orange-800 mb-2">Most Popular</Badge>
                <h4 className="font-semibold">Business - KES 2,900/month</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• 15 staff members</li>
                  <li>• 5,000 bookings/month</li>
                  <li>• Advanced features</li>
                  <li>• Priority support</li>
                </ul>
              </div>

              <div className="space-y-3">
                <Badge className="bg-purple-100 text-purple-800 mb-2">Enterprise</Badge>
                <h4 className="font-semibold">KES 8,900/month</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Unlimited staff</li>
                  <li>• Unlimited bookings</li>
                  <li>• White-label solution</li>
                  <li>• 24/7 support</li>
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
