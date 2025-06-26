import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedPublicBookingContent } from '@/components/booking/EnhancedPublicBookingContent';
import { BookingPageLoading } from '@/components/booking/BookingPageLoading';
import { BusinessNotFound } from './BusinessNotFound';

const PublicBookingPage = () => {
  const { businessId } = useParams<{ businessId: string }>();

  const { data: business, isLoading, error } = useQuery({
    queryKey: ['public-business', businessId],
    queryFn: async () => {
      if (!businessId) throw new Error('Business ID required');

      const { data, error: supabaseError } = await supabase
        .from('businesses')
        .select('*, business_settings(*)')
        .eq('id', businessId)
        .eq('is_active', true)
        .single();

      if (supabaseError) throw supabaseError;
      if (!data) throw new Error('Business not found');
      
      return data;
    },
    retry: false
  });

  if (isLoading) return <BookingPageLoading />;
  if (error || !business) return <BusinessNotFound />;

  return (
    <EnhancedPublicBookingContent 
      business={business} 
      businessId={businessId || ''} 
    />
  );
};

export default PublicBookingPage;