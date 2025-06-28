
import React, { useState } from 'react';
import { EnhancedBusinessHeader } from './EnhancedBusinessHeader';
import { ServiceTypeSelector } from './ServiceTypeSelector';
import { EmptyServiceSelection } from './EmptyServiceSelection';
import { PublicBookingCalendar } from './PublicBookingCalendar';
import { BusinessPaymentInstructions } from '@/components/business/BusinessPaymentInstructions';
import { MobileBookingHeader } from './MobileBookingHeader';
import { EnhancedTransportBooking } from '@/components/transport/EnhancedTransportBooking';
import { SalonBooking } from './SalonBooking';
import { WhatsAppFAB } from '@/components/ui/WhatsAppFAB';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  currency?: string;
  category?: string;
  transport_details?: any;
}

interface EnhancedPublicBookingContentProps {
  business: any;
  services: Service[];
  businessId: string;
}

export const EnhancedPublicBookingContent: React.FC<EnhancedPublicBookingContentProps> = ({
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

  const handleBookingComplete = (bookingId: string) => {
    console.log('Booking completed:', bookingId);
    handleBackToServices();
  };

  const isTransportService = (service: Service) => {
    return service.category === 'taxi' || service.category === 'shuttle';
  };

  const isSalonService = (service: Service) => {
    return ['beauty-wellness', 'salons', 'spa', 'barbershop'].includes(service.category || '');
  };

  const BookingContent = () => (
    <div className="space-y-6">
      {/* Enhanced Business Header */}
      <EnhancedBusinessHeader business={business} />
      
      {/* Payment Instructions - Always visible */}
      <BusinessPaymentInstructions business={business} />
      
      {!selectedService ? (
        <>
          {!services || services.length === 0 ? (
            <EmptyServiceSelection />
          ) : (
            <ServiceTypeSelector 
              services={services} 
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
          
          {isTransportService(selectedService) ? (
            <EnhancedTransportBooking
              serviceId={selectedService.id}
              businessId={businessId}
              serviceName={selectedService.name}
              servicePrice={selectedService.price}
              transportDetails={selectedService.transport_details || {
                route: { from: 'Origin', to: 'Destination' },
                passengers: { adult: 1, child: 0, infant: 0 },
                luggage: 1,
                departure_time: '08:00',
                expected_arrival: '09:00',
                vehicle: {
                  registration_number: 'KCA 123A',
                  body_type: 'Vehicle',
                  driver_name: 'Driver',
                  driver_phone: '+254700000000'
                }
              }}
              isShuttle={selectedService.category === 'shuttle'}
              onBookingComplete={handleBookingComplete}
            />
          ) : isSalonService(selectedService) ? (
            <SalonBooking
              serviceId={selectedService.id}
              businessId={businessId}
              services={services}
              onBookingComplete={handleBookingComplete}
            />
          ) : (
            <PublicBookingCalendar 
              businessId={businessId} 
              service={selectedService}
              businessHours={business.business_hours}
              onBack={handleBackToServices}
            />
          )}
        </div>
      )}
      
      {/* WhatsApp FAB */}
      <WhatsAppFAB />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header with Menu */}
      <MobileBookingHeader business={business}>
        <BookingContent />
      </MobileBookingHeader>

      {/* Desktop Content */}
      <div className="max-w-4xl mx-auto py-8 px-4 hidden lg:block">
        <BookingContent />
      </div>
    </div>
  );
};
