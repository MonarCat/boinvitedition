
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SubscriptionData {
  id: string;
  user_id: string;
  business_id: string;
  plan_type: 'trial' | 'starter' | 'medium' | 'premium';
  status: 'active' | 'expired' | 'cancelled';
  trial_ends_at: string | null;
  current_period_end: string;
  paystack_reference?: string;
  staff_limit?: number;
  bookings_limit?: number;
  payment_interval?: string;
  created_at: string;
  updated_at: string;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch current subscription
  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching subscription:', error);
        return null;
      }
      
      return data as SubscriptionData | null;
    },
    enabled: !!user,
  });

  // Check if subscription is active
  const isActive = subscription && 
    subscription.status === 'active' && 
    new Date(subscription.current_period_end) > new Date();

  // Create or upgrade subscription using the new database function
  const createSubscriptionMutation = useMutation({
    mutationFn: async ({ 
      planType, 
      businessId, 
      paymentInterval = 'monthly',
      amount,
      paystackReference 
    }: { 
      planType: string; 
      businessId: string;
      paymentInterval?: string;
      amount?: number;
      paystackReference?: string;
    }) => {
      console.log('Creating subscription:', { planType, businessId, paystackReference });
      
      // Use the new database function for subscription updates
      const { data, error } = await supabase.rpc('update_subscription_after_payment', {
        p_business_id: businessId,
        p_plan_type: planType,
        p_paystack_reference: paystackReference || null
      });

      if (error) {
        console.error('Subscription update error:', error);
        throw error;
      }

      console.log('Subscription updated successfully:', data);
      return data;
    },
    onSuccess: (data, variables) => {
      console.log('Subscription mutation success:', { data, variables });
      
      if (variables.planType === 'trial') {
        toast.success('Free trial started! You have 7 days of full access.');
      } else {
        const isUpgrade = subscription && getPlanLevel(variables.planType) > getPlanLevel(subscription.plan_type);
        const isDowngrade = subscription && getPlanLevel(variables.planType) < getPlanLevel(subscription.plan_type);
        
        if (isUpgrade) {
          toast.success(`Successfully upgraded to ${variables.planType} plan!`);
        } else if (isDowngrade) {
          toast.success(`Successfully changed to ${variables.planType} plan!`);
        } else {
          toast.success(`Successfully subscribed to ${variables.planType} plan!`);
        }
      }
      
      // Invalidate and refetch subscription data
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
    onError: (error: any) => {
      console.error('Subscription error:', error);
      toast.error('Failed to update subscription. Please try again.');
    },
  });

  // Helper function to determine plan hierarchy
  const getPlanLevel = (planType: string): number => {
    const levels = { trial: 0, starter: 1, medium: 2, premium: 3 };
    return levels[planType as keyof typeof levels] || 0;
  };

  return {
    subscription,
    isLoading,
    isActive,
    createSubscription: createSubscriptionMutation.mutate,
    isCreatingSubscription: createSubscriptionMutation.isPending,
    getPlanLevel
  };
};
