
import React, { useState } from 'react';
import { BusinessHeader } from './BusinessHeader';
import { ServicesList } from './ServicesList';
import { EmptyServiceSelection } from './EmptyServiceSelection';
import { PublicBookingCalendar } from './PublicBookingCalendar';
import { PublicBookingPageHeader } from './PublicBookingPageHeader';
import { toast } from 'sonner';

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

interface PublicBookingContentProps {
  business: Business;
  services: Service[];
  businessId: string;
  isDirectAccess: boolean;
}

export const PublicBookingContent: React.FC<PublicBookingContentProps> = ({
  business,
  services,
  businessId,
  isDirectAccess
}) => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    console.log('QR Code Debug: Service selected:', service.name);
  };

  const handleBackToServices = () => {
    setSelectedService(null);
    console.log('QR Code Debug: Returned to services selection');
  };

  const handleBookingComplete = () => {
    console.log('QR Code Debug: Booking completed successfully');
    toast.success('Booking completed successfully!');
    handleBackToServices();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <BusinessHeader business={business} />
        
        <PublicBookingPageHeader 
          businessId={businessId}
          isDirectAccess={isDirectAccess}
        />
        
        <div className="mt-8">
          {!selectedService ? (
            <>
              {!services || services.length === 0 ? (
                <div className="text-center py-12">
                  <EmptyServiceSelection />
                  <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Business Owner:</strong> Add services to enable bookings through this QR code.
                    </p>
                  </div>
                </div>
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
                className="text-blue-600 hover:text-blue-800 flex items-center gap-2 transition-colors"
              >
                ← Back to Services
              </button>
              <PublicBookingCalendar 
                businessId={businessId} 
                selectedService={selectedService}
                onBookingComplete={handleBookingComplete}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
