
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicBookingCalendar } from '@/components/booking/PublicBookingCalendar';
import { BusinessHeader } from '@/components/booking/BusinessHeader';
import { ServicesList } from '@/components/booking/ServicesList';
import { EmptyServiceSelection } from '@/components/booking/EmptyServiceSelection';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  currency?: string;
}

const PublicBookingPage = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const [selectedService, setSelectedService] = useState<Service | null>(null);

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

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
  };

  const handleBackToServices = () => {
    setSelectedService(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <BusinessHeader business={business} />
        
        <div className="mt-8">
          {!selectedService ? (
            // Show service selection
            <>
              {!services || services.length === 0 ? (
                <EmptyServiceSelection />
              ) : (
                <ServicesList 
                  services={services} 
                  selectedService={selectedService}
                  onServiceSelect={handleServiceSelect}
                />
              )}
            </>
          ) : (
            // Show booking calendar for selected service
            <div className="space-y-4">
              <button
                onClick={handleBackToServices}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
              >
                ← Back to Services
              </button>
              <PublicBookingCalendar 
                businessId={businessId} 
                selectedService={selectedService}
                onBookingComplete={handleBackToServices}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicBookingPage;
