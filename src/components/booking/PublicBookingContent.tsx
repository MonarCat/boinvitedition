
import React, { useState } from 'react';
import { BusinessHeader } from './BusinessHeader';
import { ServicesList } from './ServicesList';
import { EmptyServiceSelection } from './EmptyServiceSelection';
import { PublicBookingCalendar } from './PublicBookingCalendar';
import { PublicBookingPageHeader } from './PublicBookingPageHeader';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, Star, MapPin, Phone, Mail, Globe } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Enhanced Business Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Business Logo/Image */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                {business.logo_url ? (
                  <img 
                    src={business.logo_url} 
                    alt={business.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-2xl lg:text-3xl">
                    {business.name.charAt(0)}
                  </span>
                )}
              </div>
            </div>

            {/* Business Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    {business.name}
                  </h1>
                  {business.description && (
                    <p className="text-gray-600 text-lg mb-4 leading-relaxed">
                      {business.description}
                    </p>
                  )}
                </div>
                
                {/* Status Badge */}
                <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Open</span>
                </div>
              </div>

              {/* Rating */}
              {business.average_rating && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-5 h-5 ${
                          i < Math.floor(business.average_rating!) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-gray-900">
                    {business.average_rating}
                  </span>
                  <span className="text-gray-500">
                    ({business.total_reviews} reviews)
                  </span>
                </div>
              )}

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {business.address && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span>{business.address}</span>
                  </div>
                )}
                {business.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <a href={`tel:${business.phone}`} className="hover:text-blue-600">
                      {business.phone}
                    </a>
                  </div>
                )}
                {business.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <a href={`mailto:${business.email}`} className="hover:text-blue-600">
                      {business.email}
                    </a>
                  </div>
                )}
                {business.website && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Globe className="w-4 h-4 flex-shrink-0" />
                    <a 
                      href={business.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-blue-600"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <PublicBookingPageHeader 
          businessId={businessId}
          isDirectAccess={isDirectAccess}
        />
        
        <div className="mt-8">
          {!selectedService ? (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Choose a Service
                </h2>
                <p className="text-gray-600">
                  Select the service you'd like to book and choose your preferred time
                </p>
              </div>

              {!services || services.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                    <EmptyServiceSelection />
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
                      <p className="text-blue-800 font-medium">
                        <strong>Business Owner:</strong> Add services to enable bookings through this QR code.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {services.map((service) => (
                    <div 
                      key={service.id}
                      className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer group"
                      onClick={() => handleServiceSelect(service)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {service.name}
                          </h3>
                          {service.description && (
                            <p className="text-gray-600 mb-4 leading-relaxed">
                              {service.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                              {service.duration_minutes} minutes
                            </span>
                            <span className="text-gray-500">
                              Duration
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-gray-900">
                            {service.currency || 'USD'} {service.price}
                          </div>
                          <Button 
                            className="mt-3 bg-blue-600 hover:bg-blue-700"
                            size="lg"
                          >
                            Book Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <Button
                  onClick={handleBackToServices}
                  variant="ghost"
                  className="mb-4 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Services
                </Button>
                
                <div className="border-b border-gray-200 pb-4 mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Booking: {selectedService.name}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="bg-gray-100 px-3 py-1 rounded-full">
                      {selectedService.duration_minutes} minutes
                    </span>
                    <span className="font-semibold text-gray-900">
                      {selectedService.currency || 'USD'} {selectedService.price}
                    </span>
                  </div>
                </div>
                
                <PublicBookingCalendar 
                  businessId={businessId} 
                  selectedService={selectedService}
                  onBookingComplete={handleBookingComplete}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
