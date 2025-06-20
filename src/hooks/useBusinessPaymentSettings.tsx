
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
      
      const { data, error } = await supabase
        .from('business_payment_settings')
        .select('*')
        .eq('business_id', businessId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data;
    },
    enabled: !!businessId,
  });

  const updatePaymentSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<BusinessPaymentSettings>) => {
      const { error } = await supabase
        .from('business_payment_settings')
        .upsert({
          business_id: businessId,
          ...settings,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
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
