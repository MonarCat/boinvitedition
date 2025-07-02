import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Subscription {
  id: string;
  user_id: string;
  business_id: string;
  plan_type: 'payg';
  status: 'active' | 'inactive' | 'trialing' | 'past_due' | 'canceled';
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
        
        return data as Subscription | null;
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

  // Create or upgrade subscription
  const createSubscriptionMutation = useMutation({
    mutationFn: async ({ 
      planType, 
      businessId, 
      paystackReference 
    }: { 
      planType: 'payg'; 
      businessId: string;
      paystackReference?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Creating subscription:', { planType, businessId, paystackReference });
      
      let subscriptionData: Partial<Subscription> = {};

      switch (planType) {
        case 'payg':
          subscriptionData = {
            plan_type: 'payg',
            status: 'active',
            commission_rate: 0.05, // 5% commission
            staff_limit: 999,
            bookings_limit: 999999,
          };
          break;
        default:
          throw new Error('Invalid plan type');
      }

      // First, verify the business exists and belongs to the user
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('id, user_id')
        .eq('id', businessId)
        .eq('user_id', user.id)
        .single();

      if (businessError || !businessData) {
        console.error('Business verification failed:', businessError);
        throw new Error('Business not found or access denied');
      }

      // Create the subscription
      const newSubscriptionData = {
        user_id: user.id,
        business_id: businessId,
        plan_type: subscriptionData?.plan_type || 'payg',
        status: 'active' as const,
        staff_limit: subscriptionData?.staff_limit || null,
        bookings_limit: subscriptionData?.bookings_limit || null,
        commission_rate: subscriptionData?.commission_rate || 0.05,
        paystack_reference: paystackReference || undefined,
        current_period_end: new Date(new Date().setFullYear(new Date().getFullYear() + 100)).toISOString(), // 100 years from now
      };

      console.log('Upserting subscription data:', newSubscriptionData);

      // Use the proper constraint for upsert
      const { data, error } = await supabase
        .from('subscriptions')
        .upsert(newSubscriptionData, { 
          onConflict: 'user_id,business_id',
        })
        .select()
        .single();

      if (error) {
        console.error('Subscription upsert error:', error);
        throw new Error(`Failed to create subscription: ${error.message}`);
      }

      // Record payment transaction if paystack reference provided
      if (paystackReference) {
        try {
          const { error: transactionError } = await supabase
            .from('payment_transactions')
            .insert({
              business_id: businessId,
              subscription_id: data.id,
              transaction_type: 'subscription',
              status: 'completed',
              paystack_reference: paystackReference,
              amount: 0, // Amount will be determined by the commission rate
              currency: 'KES'
            });

          if (transactionError) {
            console.error('Payment transaction error:', transactionError);
            // Don't fail the subscription creation if payment logging fails
          }
        } catch (paymentError) {
          console.error('Payment transaction error:', paymentError);
        }
      }

      console.log('Subscription created successfully:', data);
      return data;
    },
    onSuccess: (data, variables) => {
      console.log('Subscription mutation success:', { data, variables });
      
      if (variables.planType === 'payg') {
        toast.success('💰 Pay As You Go plan activated! You will only be charged 5% when you get paid.');
      } 
      
      // Invalidate and refetch subscription data
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['user-business'] });
    },
    onError: (error: Error) => {
      console.error('Subscription error:', error);
      const errorMessage = error?.message || 'Unknown error occurred';
      toast.error(`❌ Failed to activate plan: ${errorMessage}`);
    },
  });

  return {
    subscription,
    isLoading,
    isActive,
    createSubscription: createSubscriptionMutation.mutate,
    isCreatingSubscription: createSubscriptionMutation.isPending,
  };
};
