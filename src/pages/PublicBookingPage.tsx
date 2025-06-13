
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicBookingCalendar } from '@/components/booking/PublicBookingCalendar';
import { ReviewDisplay } from '@/components/reviews/ReviewDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ticket, MapPin, Phone, Mail, Star, Clock } from 'lucide-react';
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
      {/* Business Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              {business.logo_url ? (
                <img src={business.logo_url} alt={business.name} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover" />
              ) : (
                <Ticket className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">{business.name}</h1>
              {business.description && (
                <p className="text-gray-600 mt-1 text-sm sm:text-base">{business.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {business.is_active ? 'Open' : 'Closed'}
                </Badge>
                {business.average_rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{business.average_rating}</span>
                    <span className="text-sm text-gray-500">({business.total_reviews} reviews)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm text-gray-600">
            {business.address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="break-words">{business.address}, {business.city}, {business.country}</span>
              </div>
            )}
            {business.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>{business.phone}</span>
              </div>
            )}
            {business.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span className="break-all">{business.email}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Services List */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Our Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {services?.map((service) => (
                  <div
                    key={service.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                      selectedService?.id === service.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedService(service)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-sm break-words flex-1 pr-2">{service.name}</h3>
                      <Badge variant="outline" className="flex-shrink-0">${service.price}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                      <Clock className="h-3 w-3 flex-shrink-0" />
                      <span>{service.duration_minutes} min</span>
                    </div>
                    {service.description && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2 break-words">{service.description}</p>
                    )}
                  </div>
                ))}
                {(!services || services.length === 0) && (
                  <div className="text-center py-6 text-gray-500">
                    <p className="text-sm">No services available at the moment.</p>
                  </div>
                )}
              </CardContent>
            </Card>

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
              <Card>
                <CardContent className="text-center py-8 sm:py-12">
                  <Ticket className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Service</h3>
                  <p className="text-gray-600 text-sm sm:text-base px-4">
                    Choose a service from the list to start booking your appointment.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicBookingPage;
