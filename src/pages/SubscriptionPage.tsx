
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EnhancedSubscriptionPlans } from '@/components/subscription/EnhancedSubscriptionPlans';
import { SubscriptionStatus } from '@/components/subscription/SubscriptionStatus';
import { SubscriptionPageHeader } from '@/components/subscription/SubscriptionPageHeader';
import { BusinessSetupRequired } from '@/components/subscription/BusinessSetupRequired';
import { PaymentMethodsInfo } from '@/components/subscription/PaymentMethodsInfo';
import { PlanFeaturesComparison } from '@/components/subscription/PlanFeaturesComparison';
import { useSubscription } from '@/hooks/useSubscription';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

const SubscriptionPage = () => {
  const { user } = useAuth();
  const { subscription, isLoading, createSubscription, isCreatingSubscription } = useSubscription();

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

  const handleSelectPlan = (planId: string, interval: string, amount: number) => {
    if (!business) return;
    
    console.log('Selected plan:', { planId, interval, amount, businessId: business.id });
    createSubscription({ 
      planType: planId, 
      businessId: business.id,
      paymentInterval: interval 
    });
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
          <BusinessSetupRequired />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <SubscriptionPageHeader />

        {subscription && (
          <div className="max-w-2xl mx-auto">
            <SubscriptionStatus
              subscription={subscription}
              onUpgrade={() => {}}
              businessId={business.id}
            />
          </div>
        )}

        <PaymentMethodsInfo />

        <EnhancedSubscriptionPlans
          currentPlan={subscription?.plan_type}
          businessId={business.id}
          customerEmail={user?.email}
          onSelectPlan={handleSelectPlan}
          isLoading={isCreatingSubscription}
        />

        <PlanFeaturesComparison />
      </div>
    </DashboardLayout>
  );
};

export default SubscriptionPage;
