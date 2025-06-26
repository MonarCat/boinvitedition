
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedPublicBookingContent } from '@/components/booking/EnhancedPublicBookingContent';
import { BookingPageLoading } from '@/components/booking/BookingPageLoading';
import { BusinessNotFound } from './BusinessNotFound';

const PublicBookingPage = () => {
  const { businessId } = useParams<{ businessId: string }>();

  const { data: business, isLoading: businessLoading, error: businessError } = useQuery({
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

  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['public-services', businessId],
    queryFn: async () => {
      if (!businessId) return [];

      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId && !!business,
  });

  const isLoading = businessLoading || servicesLoading;

  if (isLoading) return <BookingPageLoading businessId={businessId || ''} />;
  if (businessError || !business) return <BusinessNotFound businessId={businessId} />;

  return (
    <EnhancedPublicBookingContent 
      business={business} 
      services={services || []}
      businessId={businessId || ''} 
    />
  );
};

export default PublicBookingPage;
