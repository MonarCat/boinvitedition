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
import { toast } from 'sonner';
import { CheckCircle } from 'lucide-react';

const SubscriptionPage = () => {
  const { user } = useAuth();
  const { subscription, isLoading, createSubscription, isCreatingSubscription } = useSubscription();

  // Get user's business with better error handling
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
    retry: 3,
  });

  const handleSelectPlan = (planId: string, interval: string) => {
    if (!business) {
      console.error('No business found for user:', user?.id);
      toast.error('Please set up your business profile first');
      return;
    }

    console.log('Creating subscription for business:', business.id, 'Plan:', planId, 'Interval:', interval);
    
    if (planId === 'trial' || planId === 'payasyougo') {
      createSubscription({ planType: planId, businessId: business.id, interval });
    } else {
      // For paid plans, create checkout and redirect
      createSubscription({ planType: planId, businessId: business.id, interval });
    }
  };

  const handleUpgrade = () => {
    // Scroll to plans section
    const plansSection = document.querySelector('[data-plans-section]');
    if (plansSection) {
      plansSection.scrollIntoView({ behavior: 'smooth' });
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

  // Show business creation prompt if no business found
  if (!business && !businessError) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Subscription Plans</h1>
            <div className="max-w-2xl mx-auto">
              <Card className="border-orange-200 bg-orange-50">
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
            Choose the perfect plan for your business. Start with a 7-day free trial or pay only when you earn with our Pay-as-you-go option.
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

        <div data-plans-section>
          <EnhancedSubscriptionPlans
            currentPlan={subscription?.plan_type}
            onSelectPlan={handleSelectPlan}
            businessId={business?.id || ''}
          />
        </div>

        {/* Enhanced Payment Integration Notice */}
        <Card className="max-w-4xl mx-auto border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              Enhanced Payment Options Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-900">Direct M-Pesa STK Push</h4>
                <ul className="space-y-1 text-green-700">
                  <li>• Instant payment prompts on your phone</li>
                  <li>• No need to leave the platform</li>
                  <li>• Secure Safaricom integration</li>
                  <li>• Real-time payment confirmation</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-green-900">Paystack Gateway</h4>
                <ul className="space-y-1 text-green-700">
                  <li>• Multiple payment options</li>
                  <li>• International card support</li>
                  <li>• Bank transfers available</li>
                  <li>• Mobile money integration</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Plan Comparison & Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Free Trial</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• KES 10 setup fee</li>
                  <li>• 7 days full access</li>
                  <li>• All features included</li>
                  <li>• Perfect for testing</li>
                  <li>• QR code system</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Pay As You Go</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• No monthly fees</li>
                  <li>• 7.5% per booking</li>
                  <li>• Auto payment splitting</li>
                  <li>• All premium features</li>
                  <li>• Perfect for irregular bookings</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Starter Plan</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Up to 5 staff members</li>
                  <li>• 1,000 bookings/month</li>
                  <li>• QR code system</li>
                  <li>• Basic analytics</li>
                  <li>• Email support</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Business Plan</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Up to 15 staff members</li>
                  <li>• 3,000 bookings/month</li>
                  <li>• QR code system</li>
                  <li>• Advanced analytics</li>
                  <li>• Priority support</li>
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
