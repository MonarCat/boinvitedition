
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  currency?: string;
}

interface Business {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  featured_image_url?: string;
  business_hours?: any;
  average_rating?: number;
  total_reviews?: number;
  is_active: boolean;
  user_id?: string;
}

export const usePublicBookingData = (businessId: string | undefined, isValidUUID: boolean) => {
  const businessQuery = useQuery({
    queryKey: ['public-business', businessId],
    queryFn: async () => {
      if (!businessId) {
        throw new Error('No business ID provided');
      }
      
      console.log('QR Code Debug: Fetching business with ID:', businessId);
      
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          id, 
          name, 
          description, 
          address, 
          phone, 
          email, 
          website, 
          logo_url, 
          featured_image_url,
          business_hours,
          average_rating,
          total_reviews,
          is_active,
          user_id
        `)
        .eq('id', businessId)
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) {
        console.error('QR Code Error: Database error:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      if (!data) {
        console.error('QR Code Error: Business not found for ID:', businessId);
        throw new Error('Business not found or inactive');
      }
      
      console.log('QR Code Debug: Business found:', data.name);
      return data as Business;
    },
    enabled: !!businessId && isValidUUID,
    retry: (failureCount, error) => {
      // Only retry on network errors, not on business not found
      return failureCount < 2 && !error.message.includes('not found');
    }
  });

  const servicesQuery = useQuery({
    queryKey: ['public-services', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      
      console.log('QR Code Debug: Fetching services for business:', businessId);
      
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('name');
      
      if (error) {
        console.error('QR Code Error: Error fetching services:', error);
        throw error;
      }
      
      console.log('QR Code Debug: Services found:', data?.length || 0);
      return (data || []) as Service[];
    },
    enabled: !!businessId && !!businessQuery.data,
  });

  return {
    business: businessQuery.data,
    services: servicesQuery.data,
    businessLoading: businessQuery.isLoading,
    servicesLoading: servicesQuery.isLoading,
    businessError: businessQuery.error,
  };
};
