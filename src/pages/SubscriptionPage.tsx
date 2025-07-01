
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
import { Clock, TrendingUp, Users, CheckCircle, Smartphone, CreditCard, Wallet, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const SubscriptionPage = () => {
  const { user } = useAuth();
  const { subscription, isLoading, createSubscription, isCreatingSubscription } = useSubscription();

  // Get user's business
  const { data: business, isLoading: isBusinessLoading, error: businessError } = useQuery({
    queryKey: ['user-business', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      console.log('Fetching business for user:', user.id);
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) {
        console.error('Business fetch error:', error);
        throw error;
      }
      
      console.log('Business data:', data);
      return data;
    },
    enabled: !!user,
  });

  const handleSelectPlan = async (planId: string, interval: string, amount: number, paystackReference?: string) => {
    if (!business) {
      toast.error('❌ No business found. Please set up your business first.');
      return;
    }
    
    console.log('Selecting plan:', { planId, interval, amount, businessId: business.id, paystackReference });
    
    try {
      toast.loading('🔄 Activating your plan...', { id: 'plan-activation' });
      
      await createSubscription({
        planType: planId,
        businessId: business.id,
        paymentInterval: interval,
        amount,
        paystackReference
      });
      
      toast.dismiss('plan-activation');
      
    } catch (error) {
      console.error('Failed to select plan:', error);
      toast.dismiss('plan-activation');
      toast.error(`❌ Plan activation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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

  if (businessError) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Subscription Plans</h1>
            <Card className="border-red-200 bg-red-50 max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Error Loading Business
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-700 mb-4">
                  There was an error loading your business information: {businessError.message}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Retry
                </button>
              </CardContent>
            </Card>
          </div>
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
                <CardTitle className="text-orange-800 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Business Setup Required
                </CardTitle>
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
            Flexible pricing options to match your business needs. Secure payments with instant activation.
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
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                Secure Payment Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <Smartphone className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-green-800">M-Pesa & Mobile Money</h4>
                    <p className="text-sm text-green-700">Pay directly from your mobile wallet</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-green-800">Cards & Bank Transfer</h4>
                    <p className="text-sm text-green-700">Visa, Mastercard, and bank transfers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Wallet className="w-5 h-5 text-purple-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-green-800">Instant Activation</h4>
                    <p className="text-sm text-green-700">Your plan activates immediately after payment</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-green-100 rounded-lg">
                <p className="text-sm text-green-800">
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
          isLoading={isCreatingSubscription}
        />

        {/* Plan Comparison Details */}
        <Card className="max-w-6xl mx-auto">
          <CardHeader>
            <CardTitle>Plan Details & Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 text-sm">
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
                <Badge className="bg-green-100 text-green-800 mb-2">Starter</Badge>
                <h4 className="font-semibold">KES 399/month</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• 1 staff member</li>
                  <li>• 500 bookings/month</li>
                  <li>• Basic features</li>
                  <li>• Email support</li>
                </ul>
              </div>
             
              <div className="space-y-3">
                <Badge className="bg-blue-100 text-blue-800 mb-2">Economy</Badge>
                <h4 className="font-semibold">KES 899/month</h4>
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
