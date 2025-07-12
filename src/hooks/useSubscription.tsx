import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface PayAsYouGoSubscription {
  id: string;
  user_id: string;
  business_id: string;
  plan_type: 'payg';
  status: 'active';
  commission_rate: 0.05; // Always 5%
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
        
        return data as PayAsYouGoSubscription | null;
      } catch (err) {
        console.error('Subscription fetch error:', err);
        return null;
      }
    },
    enabled: !!user,
  });

  // PAYG is always active once created
  const isActive = subscription && subscription.status === 'active';

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
      
      // Simple PAYG setup - no subscriptions, just 5% commission
      const subscriptionData = {
        plan_type: 'payg' as const,
        status: 'active' as const,
        commission_rate: 0.05, // Fixed 5% commission
      };

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

      // Create simple PAYG record
      const newSubscriptionData = {
        user_id: user.id,
        business_id: businessId,
        plan_type: 'payg' as const,
        status: 'active' as const,
        commission_rate: 0.05, // Fixed 5% commission
        current_period_end: new Date(2099, 11, 31).toISOString(), // Far future date
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
