import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useClientPaymentMonitor } from './useClientPaymentMonitor';
import { useEffect } from 'react';

export const useClientPayments = (businessId: string) => {
  const queryClient = useQueryClient();
  
  // Set up real-time monitoring for client payments
  const { hasConnectionErrors } = useClientPaymentMonitor(businessId);
  
  // Ensure dashboard stats are invalidated when this hook is used for booking
  useEffect(() => {
    if (businessId) {
      // Manually invalidate dashboard stats to ensure they're refreshed
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
      
      // Also invalidate payment-related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['client-payments', businessId] });
      queryClient.invalidateQueries({ queryKey: ['payment-transactions', businessId] });
      queryClient.invalidateQueries({ queryKey: ['payments', businessId] });
    }
  }, [businessId, queryClient]);
  
  // If we detect connection errors, automatically refresh data periodically
  useEffect(() => {
    if (!businessId || !hasConnectionErrors) return;
    
    console.log('⚠️ Connection errors detected - setting up polling refresh');
    
    // Set up polling every 15 seconds when real-time is having issues
    const pollingInterval = setInterval(() => {
      console.log('🔄 Polling for payment updates due to connection issues');
      queryClient.invalidateQueries({ queryKey: ['client-payments', businessId] });
      queryClient.invalidateQueries({ queryKey: ['payment-transactions', businessId] });
      queryClient.invalidateQueries({ queryKey: ['payments', businessId] });
    }, 15000);
    
    return () => {
      clearInterval(pollingInterval);
    };
  }, [businessId, hasConnectionErrors, queryClient]);

  const { data: business, isLoading: businessLoading } = useQuery({
    queryKey: ['client-business', businessId],
    queryFn: async () => {
      if (!businessId) return null;
      
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          business_settings (
            currency,
            timezone,
            custom_domain
          ),
          payment_methods (
            id,
            name,
            type,
            details,
            is_active
          )
        `)
        .eq('id', businessId)
        .eq('is_active', true)
        .single();
      
      if (error) {
        console.error('Error fetching business:', error);
        throw error;
      }
      
      // Flatten the business settings and add payment instructions and other missing fields
      const businessWithSettings = {
        ...data,
        currency: data.business_settings?.[0]?.currency || data.currency || 'KES',
        timezone: data.business_settings?.[0]?.timezone || 'UTC',
        custom_domain: data.business_settings?.[0]?.custom_domain,
        payment_instructions: data.description || 'Please contact us for payment instructions.',
        preferred_payment_methods: data.payment_methods?.filter(pm => pm.is_active).map(pm => pm.name) || [],
        mpesa_number: data.phone,
        bank_account: '',
        bank_name: '',
        phone_number: data.phone,
        whatsapp: data.phone, // Use phone as WhatsApp for now
        facebook: data.website // Use website as Facebook for now
      };
      
      return businessWithSettings;
    },
    enabled: !!businessId,
  });

  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['client-services', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('name');
      
      if (error) {
        console.error('Error fetching services:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!businessId,
  });

  return {
    business,
    services: services || [],
    servicesLoading: servicesLoading || businessLoading,
    hasConnectionErrors,
    refresh: () => {
      queryClient.invalidateQueries({ queryKey: ['client-payments', businessId] });
      queryClient.invalidateQueries({ queryKey: ['payment-transactions', businessId] });
      queryClient.invalidateQueries({ queryKey: ['payments', businessId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats', businessId] });
    }
  };
};
