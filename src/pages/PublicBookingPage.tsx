
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicBookingCalendar } from '@/components/booking/PublicBookingCalendar';
import { BusinessHeader } from '@/components/booking/BusinessHeader';
import { ServicesList } from '@/components/booking/ServicesList';
import { EmptyServiceSelection } from '@/components/booking/EmptyServiceSelection';
import { toast } from 'sonner';

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

  // Add debug logging for QR code troubleshooting
  React.useEffect(() => {
    if (businessId) {
      console.log('QR Code Debug: Business ID from URL:', businessId);
      console.log('QR Code Debug: Current URL:', window.location.href);
      console.log('QR Code Debug: Referrer:', document.referrer);
      
      // Check if this came from a QR code scan (no referrer)
      if (!document.referrer && window.location.search.includes('qr_debug')) {
        toast.info('QR Code scan detected - Debug mode active');
      }
    }
  }, [businessId]);

  const { data: business, isLoading: businessLoading, error: businessError } = useQuery({
    queryKey: ['public-business', businessId],
    queryFn: async () => {
      if (!businessId) {
        console.error('QR Code Error: No business ID provided');
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
        console.error('QR Code Error: Database error fetching business:', error);
        throw error;
      }
      
      if (!data) {
        console.error('QR Code Error: Business not found or inactive for ID:', businessId);
        throw new Error('Business not found or inactive');
      }
      
      console.log('QR Code Debug: Business found:', data.name);
      return data;
    },
    enabled: !!businessId,
    retry: (failureCount, error) => {
      // Only retry on network errors, not on business not found
      return failureCount < 2 && !error.message.includes('not found');
    }
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
        console.error('QR Code Error: Error fetching services:', error);
        throw error;
      }
      
      console.log('QR Code Debug: Services found:', data?.length || 0);
      return data || [];
    },
    enabled: !!businessId && !!business,
  });

  if (!businessId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Booking Link</h1>
          <p className="text-gray-600 mb-4">The booking link you followed is not valid.</p>
          <div className="bg-red-50 p-4 rounded-lg text-sm">
            <p><strong>QR Code Debug:</strong></p>
            <p>URL: {window.location.href}</p>
            <p>Expected format: /book/[business-id]</p>
          </div>
          <a href="/" className="inline-block mt-4 text-blue-600 hover:text-blue-800">
            Return to Home
          </a>
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
          <p className="text-sm text-gray-400 mt-2">Business ID: {businessId}</p>
        </div>
      </div>
    );
  }

  if (businessError || !business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Business Not Found</h1>
          <p className="text-gray-600 mb-4">
            {businessError?.message || 'The business you are looking for is not available.'}
          </p>
          <div className="bg-yellow-50 p-4 rounded-lg text-sm">
            <p><strong>QR Code Troubleshooting:</strong></p>
            <p>Business ID: {businessId}</p>
            <p>Error: {businessError?.message}</p>
            <p>Time: {new Date().toISOString()}</p>
          </div>
          <div className="mt-4 space-y-2">
            <a href="/discover" className="block text-blue-600 hover:text-blue-800">
              Browse All Businesses
            </a>
            <a href="/" className="block text-gray-600 hover:text-gray-800">
              Return to Home
            </a>
          </div>
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
        
        {/* QR Debug Panel - only show if qr_debug parameter is present */}
        {window.location.search.includes('qr_debug') && (
          <div className="fixed bottom-4 right-4 bg-black text-white p-3 rounded-lg text-xs max-w-xs">
            <p><strong>QR Debug Panel</strong></p>
            <p>Business: {business.name}</p>
            <p>Services: {services?.length || 0}</p>
            <p>URL: {window.location.pathname}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicBookingPage;
