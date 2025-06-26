
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedPublicBookingContent } from '@/components/booking/EnhancedPublicBookingContent';
import { BookingPageLoading } from '@/components/booking/BookingPageLoading';
import { BusinessNotFound } from './BusinessNotFound';
import { logQRCodeDebugInfo } from '@/utils/uuidValidation';

const PublicBookingPage = () => {
  const { businessId } = useParams<{ businessId: string }>();

  // Log QR code debug information
  React.useEffect(() => {
    if (businessId) {
      logQRCodeDebugInfo(businessId);
    }
  }, [businessId]);

  // Fetch business data with enhanced error handling
  const { data: business, isLoading, error } = useQuery({
    queryKey: ['public-business', businessId],
    queryFn: async () => {
      if (!businessId) {
        throw new Error('Business ID is required');
      }

      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          business_settings (*)
        `)
        .eq('id', businessId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Business fetch error:', error);
        
        // Check if it's a not found error vs other errors
        if (error.code === 'PGRST116') {
          throw new Error('BUSINESS_NOT_FOUND');
        }
        throw error;
      }

      if (!data) {
        throw new Error('BUSINESS_NOT_FOUND');
      }

      return data;
    },
    enabled: !!businessId,
    retry: (failureCount, error) => {
      // Don't retry if business is not found
      if (error?.message === 'BUSINESS_NOT_FOUND') {
        return false;
      }
      // Retry other errors up to 3 times
      return failureCount < 3;
    },
  });

  if (isLoading) {
    return <BookingPageLoading />;
  }

  if (error || !business) {
    console.log('Business not found or error occurred:', { error, businessId });
    return <BusinessNotFound businessId={businessId} />;
  }

  return <EnhancedPublicBookingContent business={business} />;
};

export default PublicBookingPage;
