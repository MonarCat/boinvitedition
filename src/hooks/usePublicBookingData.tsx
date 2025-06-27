
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { isValidUUID } from '@/utils/uuidValidation';

export const usePublicBookingData = (businessId: string | undefined) => {
  const businessQuery = useQuery({
    queryKey: ['public-business', businessId],
    queryFn: async () => {
      if (!businessId) {
        throw new Error('No business ID provided');
      }
      
      console.log('QR Code Debug: Fetching business with ID:', businessId);
      
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) {
        throw new Error('Unable to fetch business details. Please try again.');
      }
      
      if (!data) {
        throw new Error('Business not found or is currently inactive.');
      }

      return data;
      return data;
    },
    enabled: !!businessId && isValidUUID(businessId || ''),
    retry: (failureCount, error) => {
      // Only retry on network errors, not on business not found
      return failureCount < 2 && !error.message.includes('not found');
    }
  });

  const servicesQuery = useQuery({
    queryKey: ['public-services', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('name');
      
      if (error) {
        throw new Error('Unable to fetch services. Please try again.');
      }

      return data || [];
      return data || [];
    },
    enabled: !!businessId && !!businessQuery.data,
  });

  return {
    business: businessQuery.data,
    businessLoading: businessQuery.isLoading,
    businessError: businessQuery.error,
    services: servicesQuery.data,
    servicesLoading: servicesQuery.isLoading,
  };
};
