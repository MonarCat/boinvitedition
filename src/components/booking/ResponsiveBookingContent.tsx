
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Clock, Star, ChevronLeft, QrCode } from 'lucide-react';
import { ServicesList } from './ServicesList';
import { EmptyServiceSelection } from './EmptyServiceSelection';
import { PublicBookingCalendar } from './PublicBookingCalendar';
import { BusinessPaymentInstructions } from '@/components/business/BusinessPaymentInstructions';
import { UnifiedQRGenerator } from '@/components/qr/UnifiedQRGenerator';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  currency?: string;
}

interface ResponsiveBookingContentProps {
  business: any;
  services: Service[];
  businessId: string;
}

export const ResponsiveBookingContent: React.FC<ResponsiveBookingContentProps> = ({
  business,
  services,
  businessId
}) => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showQR, setShowQR] = useState(false);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
  };

  const handleBackToServices = () => {
    setSelectedService(null);
  };

  const formatBusinessHours = (hours: any) => {
    if (!hours || typeof hours !== 'object') return 'Hours not specified';
    
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
    const todayHours = hours[today];
    
    if (todayHours && todayHours.open && todayHours.close) {
      return `Today: ${todayHours.open} - ${todayHours.close}`;
    }
    
    return 'Hours available on request';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Mobile-First Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {business.logo_url && (
                <img
                  src={business.logo_url}
                  alt={`${business.name} logo`}
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}
              <div>
                <h1 className="font-bold text-lg text-gray-900 truncate max-w-[200px]">
                  {business.name}
                </h1>
                {business.is_verified && (
                  <Badge className="bg-green-500 text-xs">Verified</Badge>
                )}
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQR(!showQR)}
              className="flex items-center gap-1"
            >
              <QrCode className="w-4 h-4" />
              QR
            </Button>
          </div>
        </div>
      </div>

      {/* QR Code Overlay */}
      {showQR && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Scan to Book
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowQR(false)}
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UnifiedQRGenerator
                businessId={businessId}
                businessName={business.name}
                showTitle={false}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="px-4 py-6 space-y-6 max-w-4xl mx-auto">
        {/* Business Info Card */}
        <Card className="overflow-hidden">
          <div className="relative h-32 bg-gradient-to-r from-blue-600 to-purple-600">
            {business.featured_image_url && (
              <img
                src={business.featured_image_url}
                alt={business.name}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/30" />
          </div>
          
          <CardContent className="p-4 -mt-8 relative">
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <div className="flex items-start gap-3 mb-3">
                {business.logo_url && (
                  <img
                    src={business.logo_url}
                    alt={`${business.name} logo`}
                    className="w-16 h-16 rounded-full border-4 border-white shadow-md flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {business.name}
                  </h2>
                  {business.average_rating && (
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">
                        {business.average_rating} ({business.total_reviews || 0} reviews)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {business.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {business.description}
                </p>
              )}

              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {business.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">
                      {business.address}
                      {business.city && `, ${business.city}`}
                    </span>
                  </div>
                )}

                {business.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <a 
                      href={`tel:${business.phone}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {business.phone}
                    </a>
                  </div>
                )}

                <div className="flex items-start gap-2 sm:col-span-2">
                  <Clock className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">
                    {formatBusinessHours(business.business_hours)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Instructions */}
        <BusinessPaymentInstructions business={business} />

        {/* Services or Calendar Section */}
        {!selectedService ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Choose a Service</CardTitle>
            </CardHeader>
            <CardContent>
              {!services || services.length === 0 ? (
                <EmptyServiceSelection />
              ) : (
                <ServicesList 
                  services={services} 
                  selectedService={selectedService}
                  onServiceSelect={handleServiceSelect}
                />
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={handleBackToServices}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 p-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Services
                  </Button>
                </div>
                <CardTitle className="text-lg">Book {selectedService.name}</CardTitle>
              </CardHeader>
            </Card>
            
            <PublicBookingCalendar 
              businessId={businessId} 
              selectedService={selectedService}
              onBookingComplete={handleBackToServices}
            />
          </div>
        )}

        {/* Booking Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-900 mb-3 text-sm">📋 How to Book</h3>
            <div className="space-y-2 text-blue-800 text-sm">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                <span>Choose your preferred service</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                <span>Select date and time</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                <span>Complete booking with payment</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                <span>Receive confirmation!</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
