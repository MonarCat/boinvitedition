
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
      console.log('QR Code Debug: Database query starting...');
      
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
        .single(); // Changed from maybeSingle to single for better error handling
      
      if (error) {
        console.error('QR Code Error: Database error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // Provide more specific error messages
        if (error.code === 'PGRST116') {
          throw new Error('Business not found - ID does not exist in database');
        }
        throw new Error(`Database error: ${error.message}`);
      }
      
      if (!data) {
        console.error('QR Code Error: No business data returned for ID:', businessId);
        throw new Error('Business not found in database');
      }

      if (!data.is_active) {
        console.error('QR Code Error: Business found but inactive:', data.name);
        throw new Error('Business account is currently inactive');
      }
      
      console.log('QR Code Debug: Business successfully found:', {
        name: data.name,
        id: data.id,
        isActive: data.is_active
      });
      
      return data as Business;
    },
    enabled: !!businessId && isValidUUID,
    retry: (failureCount, error) => {
      console.log('QR Code Debug: Query retry attempt:', failureCount, error.message);
      // Retry twice for network errors, but not for business not found
      return failureCount < 2 && !error.message.includes('not found');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (changed from cacheTime)
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
    enabled: !!businessId && !!businessQuery.data && !businessQuery.error,
    staleTime: 5 * 60 * 1000,
  });

  return {
    business: businessQuery.data,
    services: servicesQuery.data,
    businessLoading: businessQuery.isLoading,
    servicesLoading: servicesQuery.isLoading,
    businessError: businessQuery.error,
    refetchBusiness: businessQuery.refetch,
  };
};
