
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SubscriptionData {
  id: string;
  user_id: string;
  business_id: string;
  plan_type: 'trial' | 'medium' | 'premium';
  status: 'active' | 'expired' | 'cancelled';
  trial_ends_at: string;
  current_period_end: string;
  stripe_subscription_id?: string;
  staff_limit?: number;
  bookings_limit?: number;
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
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as SubscriptionData | null;
    },
    enabled: !!user,
  });

  // Check if trial has expired
  const isTrialExpired = subscription && 
    subscription.plan_type === 'trial' && 
    new Date(subscription.trial_ends_at) < new Date();

  // Check if subscription is active
  const isActive = subscription && 
    subscription.status === 'active' && 
    new Date(subscription.current_period_end) > new Date();

  // Create or upgrade subscription
  const createSubscriptionMutation = useMutation({
    mutationFn: async ({ planType, businessId }: { planType: string; businessId: string }) => {
      if (planType === 'trial') {
        // Create trial subscription
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 14);
        
        const { data, error } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: user?.id,
            business_id: businessId,
            plan_type: 'trial',
            status: 'active',
            trial_ends_at: trialEndDate.toISOString(),
            current_period_end: trialEndDate.toISOString(),
            staff_limit: null, // Unlimited during trial
            bookings_limit: null, // Unlimited during trial
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // For paid plans, redirect to Stripe checkout
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: { 
            planType,
            businessId,
            successUrl: `${window.location.origin}/subscription/success`,
            cancelUrl: `${window.location.origin}/subscription` 
          }
        });
        
        if (error) throw error;
        
        // Redirect to Stripe checkout
        if (data.url) {
          window.location.href = data.url;
        }
        
        return data;
      }
    },
    onSuccess: (data, variables) => {
      if (variables.planType === 'trial') {
        toast.success('Free trial started! You have 14 days of full access.');
        queryClient.invalidateQueries({ queryKey: ['subscription'] });
      }
    },
    onError: (error) => {
      console.error('Subscription error:', error);
      toast.error('Failed to start subscription. Please try again.');
    },
  });

  // Check subscription limits
  const checkLimits = async (businessId: string) => {
    if (!subscription || subscription.plan_type === 'premium') {
      return { canAddStaff: true, canAddBooking: true };
    }

    // Count current staff
    const { count: staffCount } = await supabase
      .from('staff')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('is_active', true);

    // Count current month bookings
    const currentMonth = new Date().toISOString().slice(0, 7);
    const { count: bookingCount } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .gte('created_at', `${currentMonth}-01`)
      .neq('status', 'cancelled');

    const canAddStaff = !subscription.staff_limit || (staffCount || 0) < subscription.staff_limit;
    const canAddBooking = !subscription.bookings_limit || (bookingCount || 0) < subscription.bookings_limit;

    return { canAddStaff, canAddBooking, staffCount, bookingCount };
  };

  return {
    subscription,
    isLoading,
    isTrialExpired,
    isActive,
    createSubscription: createSubscriptionMutation.mutate,
    isCreatingSubscription: createSubscriptionMutation.isPending,
    checkLimits
  };
};
