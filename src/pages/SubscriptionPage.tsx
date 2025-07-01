
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
    
    // Special handling for Pay As You Go plan (no subscription needed)
    if (planId === 'payg') {
      const toastId = toast.loading('🔄 Activating Pay As You Go plan...', { id: 'plan-activation' });
      
      // Simulate activation without creating a subscription record
      setTimeout(() => {
        toast.dismiss(toastId);
        toast.success('Pay As You Go plan activated successfully!', {
          duration: 5000,
          style: {
            background: '#DC2626',
            color: '#fff',
            fontWeight: 'bold',
          },
        });
      }, 1000);
      
      return;
    }
    
    // Handle other subscription plans normally
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Pay As You Go</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our default revenue model - no monthly fees, just a 5% commission on payments you receive.
          </p>
          <div className="mt-3">
            <span className="bg-green-100 text-green-800 px-4 py-1 rounded-full text-sm font-medium inline-flex items-center">
              ✓ Active for all accounts
            </span>
          </div>
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
          onSelectPlan={handleSelectPlan}
          isLoading={isCreatingSubscription}
        />


      </div>
    </DashboardLayout>
  );
};

export default SubscriptionPage;
