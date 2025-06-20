
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SubscriptionData {
  id: string;
  user_id: string;
  business_id: string;
  plan_type: 'trial' | 'starter' | 'medium' | 'premium' | 'payasyougo';
  status: 'active' | 'expired' | 'cancelled';
  trial_ends_at: string | null;
  current_period_end: string;
  payment_interval?: string;
  paystack_subaccount_id?: string;
  auto_split_enabled?: boolean;
  split_percentage?: number;
  stripe_subscription_id?: string;
  staff_limit?: number;
  bookings_limit?: number;
  notification_channels?: any;
  feature_flags?: any;
  created_at: string;
  updated_at: string;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch current subscription using direct table query
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

  // Check if trial has expired
  const isTrialExpired = subscription && 
    subscription.plan_type === 'trial' && 
    subscription.trial_ends_at &&
    new Date(subscription.trial_ends_at) < new Date();

  // Check if subscription is active
  const isActive = subscription && 
    subscription.status === 'active' && 
    new Date(subscription.current_period_end) > new Date();

  // Create or upgrade subscription
  const createSubscriptionMutation = useMutation({
    mutationFn: async ({ planType, businessId, interval = 'monthly' }: { 
      planType: string; 
      businessId: string; 
      interval?: string; 
    }) => {
      if (planType === 'trial') {
        // Create trial subscription directly - 7 days
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 7);
        
        const { data, error } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user?.id,
            business_id: businessId,
            plan_type: 'trial',
            status: 'active',
            trial_ends_at: trialEndDate.toISOString(),
            current_period_end: trialEndDate.toISOString(),
            payment_interval: 'monthly',
            staff_limit: null,
            bookings_limit: null,
            notification_channels: {
              email: true,
              sms: true,
              whatsapp: true
            },
            feature_flags: {
              can_add_clients: true,
              client_data_retention: true
            }
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else if (planType === 'payasyougo') {
        // Create pay-as-you-go subscription with Paystack subaccount
        const { data: subaccountData, error: subaccountError } = await supabase.functions.invoke('create-paystack-subaccount', {
          body: { 
            businessId,
            businessEmail: user?.email,
            splitPercentage: 7.5
          }
        });
        
        if (subaccountError) throw subaccountError;
        
        const { data, error } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user?.id,
            business_id: businessId,
            plan_type: 'payasyougo',
            status: 'active',
            current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
            payment_interval: 'monthly',
            paystack_subaccount_id: subaccountData?.subaccount_code,
            auto_split_enabled: true,
            split_percentage: 7.5,
            staff_limit: null,
            bookings_limit: null,
            notification_channels: {
              email: true,
              sms: true,
              whatsapp: true
            },
            feature_flags: {
              can_add_clients: true,
              client_data_retention: true
            }
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // For paid plans, redirect to payment
        const { data, error } = await supabase.functions.invoke('create-subscription-checkout', {
          body: { 
            planType,
            businessId,
            customerEmail: user?.email,
            interval: interval
          }
        });
        
        if (error) throw error;
        
        // Return checkout URL for frontend to handle
        return data;
      }
    },
    onSuccess: (data, variables) => {
      if (variables.planType === 'trial') {
        toast.success('Free trial started! You have 7 days of full access.');
        queryClient.invalidateQueries({ queryKey: ['subscription'] });
      } else if (variables.planType === 'payasyougo') {
        toast.success('Pay-as-you-go plan activated! You\'ll earn 92.5% from each booking.');
        queryClient.invalidateQueries({ queryKey: ['subscription'] });
      }
    },
    onError: (error) => {
      console.error('Subscription error:', error);
      toast.error('Failed to start subscription. Please try again.');
    },
  });

  // Check subscription limits and feature access
  const checkLimits = async (businessId: string) => {
    if (!subscription || subscription.plan_type === 'premium' || subscription.plan_type === 'payasyougo') {
      return { 
        canAddStaff: true, 
        canAddBooking: true, 
        canAddClients: true,
        canSendSMS: true,
        canSendWhatsApp: true,
        clientDataRetention: true
      };
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
    
    // Feature flags from subscription
    const featureFlags = subscription.feature_flags as any || {};
    const notificationChannels = subscription.notification_channels as any || {};
    
    return { 
      canAddStaff, 
      canAddBooking, 
      canAddClients: featureFlags.can_add_clients !== false,
      canSendSMS: notificationChannels.sms === true,
      canSendWhatsApp: notificationChannels.whatsapp === true,
      clientDataRetention: featureFlags.client_data_retention !== false,
      staffCount, 
      bookingCount 
    };
  };

  // Get feature access based on plan
  const getFeatureAccess = () => {
    if (!subscription) {
      return {
        canAddClients: false,
        canSendSMS: false,
        canSendWhatsApp: false,
        clientDataRetention: false,
        maxStaff: 0,
        maxBookings: 0,
        payAsYouGo: false
      };
    }

    const featureFlags = subscription.feature_flags as any || {};
    const notificationChannels = subscription.notification_channels as any || {};

    return {
      canAddClients: featureFlags.can_add_clients !== false,
      canSendSMS: notificationChannels.sms === true,
      canSendWhatsApp: notificationChannels.whatsapp === true,
      clientDataRetention: featureFlags.client_data_retention !== false,
      maxStaff: subscription.staff_limit,
      maxBookings: subscription.bookings_limit,
      payAsYouGo: subscription.plan_type === 'payasyougo',
      autoSplitEnabled: subscription.auto_split_enabled || false
    };
  };

  return {
    subscription,
    isLoading,
    isTrialExpired,
    isActive,
    createSubscription: createSubscriptionMutation.mutate,
    isCreatingSubscription: createSubscriptionMutation.isPending,
    checkLimits,
    getFeatureAccess
  };
};
