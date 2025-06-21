
import React, { useState } from 'react';
import { EnhancedBusinessHeader } from './EnhancedBusinessHeader';
import { ServicesList } from './ServicesList';
import { EmptyServiceSelection } from './EmptyServiceSelection';
import { PublicBookingCalendar } from './PublicBookingCalendar';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  currency?: string;
}

interface BookingPageContentProps {
  business: any;
  services: Service[];
  businessId: string;
}

export const BookingPageContent: React.FC<BookingPageContentProps> = ({
  business,
  services,
  businessId
}) => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
  };

  const handleBackToServices = () => {
    setSelectedService(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <EnhancedBusinessHeader business={business} />
        
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
      </div>
    </div>
  );
};
