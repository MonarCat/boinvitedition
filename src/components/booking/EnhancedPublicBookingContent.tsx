
import React, { useState } from 'react';
import { EnhancedBusinessHeader } from './EnhancedBusinessHeader';
import { ServiceTypeSelector } from './ServiceTypeSelector';
import { EmptyServiceSelection } from './EmptyServiceSelection';
import { PublicBookingCalendar } from './PublicBookingCalendar';
import { BusinessPaymentInstructions } from '@/components/business/BusinessPaymentInstructions';
import { MobileBookingHeader } from './MobileBookingHeader';
import { MatatuBooking } from '@/components/transport/MatatuBooking';
import { SalonBooking } from './SalonBooking';
import { WhatsAppFAB } from '@/components/ui/WhatsAppFAB';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  currency?: string;
  is_transport_service?: boolean;
  transport_details?: any;
  category?: string;
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

  const isSalonService = (service: Service) => {
    return service.category?.toLowerCase().includes('hair') ||
           service.category?.toLowerCase().includes('beauty') ||
           service.category?.toLowerCase().includes('salon') ||
           service.name.toLowerCase().includes('hair') ||
           service.name.toLowerCase().includes('beauty') ||
           service.name.toLowerCase().includes('salon');
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
          
          {selectedService.is_transport_service ? (
            <MatatuBooking
              serviceId={selectedService.id}
              businessId={businessId}
              vehicle={{
                id: selectedService.id,
                sacco_name: selectedService.transport_details?.vehicle_info?.sacco_name || 'Transport Service',
                plate_number: selectedService.transport_details?.vehicle_info?.plate_number || 'N/A',
                seat_count: selectedService.transport_details?.vehicle_info?.seat_count || 14,
                driver_phone: selectedService.transport_details?.vehicle_info?.driver_phone || ''
              }}
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
