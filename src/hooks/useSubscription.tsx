
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

  // Create or upgrade subscription
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
      if (planType === 'trial') {
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 7);
        
        const { data, error } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: user?.id,
            business_id: businessId,
            plan_type: 'trial',
            status: 'active',
            trial_ends_at: trialEndDate.toISOString(),
            current_period_end: trialEndDate.toISOString(),
            payment_interval: paymentInterval,
            staff_limit: 3,
            bookings_limit: 100
          }, {
            onConflict: 'business_id'
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Handle paid subscription plans
        const planLimits = {
          starter: { staff_limit: 5, bookings_limit: 1000 },
          medium: { staff_limit: 15, bookings_limit: 5000 },
          premium: { staff_limit: null, bookings_limit: null }
        };

        const limits = planLimits[planType as keyof typeof planLimits] || planLimits.starter;
        const subscriptionEndDate = new Date();
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

        const { data, error } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: user?.id,
            business_id: businessId,
            plan_type: planType,
            status: 'active',
            current_period_end: subscriptionEndDate.toISOString(),
            payment_interval: paymentInterval,
            staff_limit: limits.staff_limit,
            bookings_limit: limits.bookings_limit,
            paystack_reference: paystackReference
          }, {
            onConflict: 'business_id'
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data, variables) => {
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
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
    onError: (error) => {
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
