
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SubscriptionData {
  id: string;
  user_id: string;
  business_id: string;
  plan_type: 'trial' | 'starter' | 'economy' | 'medium' | 'premium' | 'payg';
  status: 'active' | 'expired' | 'cancelled';
  trial_ends_at: string | null;
  current_period_end: string;
  paystack_reference?: string;
  staff_limit?: number;
  bookings_limit?: number;
  payment_interval?: string;
  commission_rate?: number;
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
      
      try {
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
      } catch (err) {
        console.error('Subscription fetch error:', err);
        return null;
      }
    },
    enabled: !!user,
  });

  // Check if subscription is active
  const isActive = subscription && 
    subscription.status === 'active' && 
    new Date(subscription.current_period_end) > new Date();

  // Create or upgrade subscription using a direct database call
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
      if (!user) throw new Error('User not authenticated');
      
      console.log('Creating subscription:', { planType, businessId, paystackReference });
      
      // Calculate period end based on plan type
      let periodEnd = new Date();
      if (planType === 'trial') {
        periodEnd.setDate(periodEnd.getDate() + 7); // 7 days
      } else if (planType === 'payg') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1); // 1 year
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + (paymentInterval === 'yearly' ? 12 : 1));
      }
      
      // Set limits based on plan type
      let staffLimit = null;
      let bookingsLimit = null;
      let commissionRate = null;
      
      switch (planType) {
        case 'trial':
          staffLimit = 3;
          bookingsLimit = 100;
          break;
        case 'starter':
          staffLimit = 1;
          bookingsLimit = 500;
          break;
        case 'economy':
          staffLimit = 5;
          bookingsLimit = 1000;
          break;
        case 'medium':
          staffLimit = 15;
          bookingsLimit = 5000;
          break;
        case 'premium':
          staffLimit = null; // unlimited
          bookingsLimit = null; // unlimited
          break;
        case 'payg':
          staffLimit = null; // unlimited
          bookingsLimit = null; // unlimited
          commissionRate = 0.05; // 5%
          break;
      }

      // Create the subscription
      const subscriptionData = {
        user_id: user.id,
        business_id: businessId,
        plan_type: planType,
        status: 'active',
        current_period_end: periodEnd.toISOString(),
        staff_limit: staffLimit,
        bookings_limit: bookingsLimit,
        payment_interval: planType === 'trial' ? 'trial' : planType === 'payg' ? 'commission' : paymentInterval,
        commission_rate: commissionRate,
        trial_ends_at: planType === 'trial' ? periodEnd.toISOString() : null,
      };

      const { data, error } = await supabase
        .from('subscriptions')
        .upsert(subscriptionData)
        .select()
        .single();

      if (error) {
        console.error('Subscription update error:', error);
        throw error;
      }

      // Record payment transaction if paystack reference provided
      if (paystackReference && amount) {
        try {
          await supabase
            .from('payment_transactions')
            .insert({
              business_id: businessId,
              subscription_id: data.id,
              transaction_type: 'subscription',
              status: 'completed',
              paystack_reference: paystackReference,
              amount: amount,
              currency: 'KES'
            });
        } catch (paymentError) {
          console.error('Payment transaction error:', paymentError);
          // Don't fail the subscription creation if payment logging fails
        }
      }

      console.log('Subscription updated successfully:', data);
      return data;
    },
    onSuccess: (data, variables) => {
      console.log('Subscription mutation success:', { data, variables });
      
      if (variables.planType === 'trial') {
        toast.success('Free trial started! You have 7 days of full access.');
      } else if (variables.planType === 'payg') {
        toast.success('Pay As You Go plan activated! You will only be charged 5% when you get paid.');
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
    const levels = { trial: 0, starter: 1, economy: 2, medium: 3, premium: 4, payg: 5 };
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
