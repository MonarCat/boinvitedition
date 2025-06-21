
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useClientPayments = (businessId: string) => {
  const { data: business, isLoading: businessLoading } = useQuery({
    queryKey: ['client-business', businessId],
    queryFn: async () => {
      if (!businessId) return null;
      
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .eq('is_active', true)
        .single();
      
      if (error) {
        console.error('Error fetching business:', error);
        throw error;
      }
      
      return data;
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
  };
};
