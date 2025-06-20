
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BusinessPaymentSettings {
  id: string;
  business_id: string;
  require_payment: boolean;
  paystack_public_key?: string;
  payment_methods: any[];
}

export const useBusinessPaymentSettings = (businessId: string) => {
  const queryClient = useQueryClient();

  const { data: paymentSettings, isLoading } = useQuery({
    queryKey: ['business-payment-settings', businessId],
    queryFn: async () => {
      if (!businessId) return null;
      
      // First try to get from business_settings table as fallback
      const { data: businessSettings, error: businessError } = await supabase
        .from('business_settings')
        .select('require_payment')
        .eq('business_id', businessId)
        .single();

      // Get payment methods
      const { data: paymentMethods, error: paymentError } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('business_id', businessId);

      if (businessError && businessError.code !== 'PGRST116') {
        console.error('Error fetching business settings:', businessError);
      }
      
      if (paymentError) {
        console.error('Error fetching payment methods:', paymentError);
      }
      
      return {
        id: businessId,
        business_id: businessId,
        require_payment: businessSettings?.require_payment || false,
        paystack_public_key: '',
        payment_methods: paymentMethods || []
      };
    },
    enabled: !!businessId,
  });

  const updatePaymentSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<BusinessPaymentSettings>) => {
      // Update business_settings for require_payment
      if (settings.require_payment !== undefined) {
        const { error: businessError } = await supabase
          .from('business_settings')
          .upsert({
            business_id: businessId,
            require_payment: settings.require_payment,
            updated_at: new Date().toISOString()
          });
        
        if (businessError) {
          console.error('Error updating business settings:', businessError);
          throw businessError;
        }
      }
    },
    onSuccess: () => {
      toast.success('Payment settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['business-payment-settings', businessId] });
    },
    onError: (error) => {
      console.error('Error updating payment settings:', error);
      toast.error('Failed to update payment settings');
    },
  });

  return {
    paymentSettings,
    isLoading,
    updatePaymentSettings: updatePaymentSettingsMutation.mutate,
    isUpdating: updatePaymentSettingsMutation.isPending,
  };
};
