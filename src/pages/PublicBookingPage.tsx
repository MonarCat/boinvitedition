
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicBookingCalendar } from '@/components/booking/PublicBookingCalendar';
import { BusinessHeader } from '@/components/booking/BusinessHeader';

const PublicBookingPage = () => {
  const { businessId } = useParams<{ businessId: string }>();

  const { data: business, isLoading: businessLoading, error: businessError } = useQuery({
    queryKey: ['public-business', businessId],
    queryFn: async () => {
      if (!businessId) return null;
      
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching business for public booking:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('Business not found or inactive');
      }
      
      return data;
    },
    enabled: !!businessId,
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
      
      if (error) {
        console.error('Error fetching services for public booking:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!businessId,
  });

  if (!businessId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Booking Link</h1>
          <p className="text-gray-600">The booking link you followed is not valid.</p>
        </div>
      </div>
    );
  }

  if (businessLoading || servicesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking page...</p>
        </div>
      </div>
    );
  }

  if (businessError || !business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Business Not Found</h1>
          <p className="text-gray-600">
            {businessError?.message || 'The business you are looking for is not available.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <BusinessHeader business={business} />
        <div className="mt-8">
          <PublicBookingCalendar 
            businessId={businessId} 
            services={services || []} 
          />
        </div>
      </div>
    </div>
  );
};

export default PublicBookingPage;
