
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicBookingCalendar } from '@/components/booking/PublicBookingCalendar';
import { ReviewDisplay } from '@/components/reviews/ReviewDisplay';
import { BusinessHeader } from '@/components/booking/BusinessHeader';
import { ServicesList } from '@/components/booking/ServicesList';
import { EmptyServiceSelection } from '@/components/booking/EmptyServiceSelection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const PublicBookingPage = () => {
  const { subdomain } = useParams();
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    console.log('PublicBookingPage loaded with subdomain:', subdomain);
  }, [subdomain]);

  // Fetch business by subdomain
  const { data: business, isLoading: businessLoading, error: businessError } = useQuery({
    queryKey: ['public-business', subdomain],
    queryFn: async () => {
      console.log('Fetching business for subdomain:', subdomain);
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('subdomain', subdomain)
        .single();
      
      if (error) {
        console.error('Error fetching business:', error);
        throw error;
      }
      console.log('Business data:', data);
      return data;
    },
    enabled: !!subdomain,
  });

  // Fetch business services
  const { data: services } = useQuery({
    queryKey: ['public-services', business?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', business.id)
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!business?.id,
  });

  // Fetch business reviews with client names
  const { data: reviews } = useQuery({
    queryKey: ['public-reviews', business?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_reviews')
        .select(`
          *,
          bookings (
            clients (
              name
            )
          )
        `)
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: !!business?.id,
  });

  if (businessLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading business information...</p>
        </div>
      </div>
    );
  }

  if (businessError) {
    console.error('Business error:', businessError);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Business</h1>
          <p className="text-gray-600 mb-4">
            We encountered an error while loading the business information. Please try again later.
          </p>
          <p className="text-sm text-gray-500">Subdomain: {subdomain}</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Business Not Found</h1>
          <p className="text-gray-600 mb-4">
            The business you're looking for doesn't exist or is no longer available.
          </p>
          <p className="text-sm text-gray-500">Subdomain: {subdomain}</p>
        </div>
      </div>
    );
  }

  const handleBookingComplete = () => {
    toast.success('Booking created successfully! You will receive a confirmation shortly.');
    setSelectedService(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <BusinessHeader business={business} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Services List */}
          <div className="lg:col-span-1 space-y-6">
            <ServicesList 
              services={services || []}
              selectedService={selectedService}
              onServiceSelect={setSelectedService}
            />

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Customer Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <ReviewDisplay 
                  reviews={reviews || []} 
                  averageRating={business.average_rating}
                  totalReviews={business.total_reviews}
                />
              </CardContent>
            </Card>
          </div>

          {/* Booking Calendar */}
          <div className="lg:col-span-3">
            {selectedService ? (
              <PublicBookingCalendar 
                businessId={business.id} 
                selectedService={selectedService}
                onBookingComplete={handleBookingComplete}
              />
            ) : (
              <EmptyServiceSelection />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicBookingPage;
