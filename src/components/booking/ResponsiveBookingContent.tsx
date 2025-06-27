import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Clock, Star, ChevronLeft, CreditCard, Calendar } from 'lucide-react';
import { ServicesList } from './ServicesList';
import { EmptyServiceSelection } from './EmptyServiceSelection';
import { PublicBookingCalendar } from './PublicBookingCalendar';
import { BusinessPaymentInstructions } from '@/components/business/BusinessPaymentInstructions';
import { ClientToBusinessPayment } from '@/components/payment/ClientToBusinessPayment';
import { cn } from '@/lib/utils';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  currency?: string;
}

interface BusinessHours {
  [key: string]: {
    open: string;
    close: string;
  };
}

interface Business {
  id: string;
  name: string;
  logo_url?: string;
  description: string;
  is_verified: boolean;
  average_rating?: number;
  total_reviews?: number;
  business_hours: BusinessHours;
  address: string;
  city?: string;
  phone: string;
  currency: string;
  featured_image_url?: string;
}

interface ResponsiveBookingContentProps {
  business: Business;
  services: Service[];
  businessId: string;
}

export const ResponsiveBookingContent: React.FC<ResponsiveBookingContentProps> = ({
  business,
  services,
  businessId
}) => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showClientPayment, setShowClientPayment] = useState(false);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    // Smooth scroll to booking section on mobile
    if (window.innerWidth < 768) {
      setTimeout(() => {
        document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleBackToServices = () => {
    setSelectedService(null);
    setShowCalendar(false);
  };

  const formatBusinessHours = (hours: BusinessHours) => {
    if (!hours || typeof hours !== 'object') return 'Hours not specified';
    
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
    const todayHours = hours[today];
    
    if (todayHours && todayHours.open && todayHours.close) {
      return `Today: ${todayHours.open} - ${todayHours.close}`;
    }
    
    return 'Hours available on request';
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-48 md:h-64 rounded-2xl overflow-hidden mb-8 bg-gradient-to-r from-blue-500 to-indigo-600"
      >
        <img
          src={business.featured_image_url || '/placeholder.svg'}
          alt={business.name}
          className="w-full h-full object-cover mix-blend-overlay"
        />
        <div className="absolute inset-0 flex items-end p-6 bg-gradient-to-t from-black/60 via-black/40 to-transparent">
          <div className="text-white">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{business.name}</h1>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span className="truncate max-w-[200px]">{business.address}</span>
              </div>
              {business.average_rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>{business.average_rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid md:grid-cols-12 gap-6">
        {/* Services Selection */}
        <motion.div 
          className={cn(
            "md:col-span-7 lg:col-span-8",
            showCalendar && "md:hidden"
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Card>
            <CardContent className="p-0">
              <ServicesList
                services={services}
                selectedService={selectedService}
                onServiceSelect={handleServiceSelect}
                currency={business.currency}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Booking Section */}
        <motion.div 
          id="booking-section"
          className={cn(
            "md:col-span-5 lg:col-span-4",
            !showCalendar && "md:sticky md:top-24"
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <AnimatePresence mode="wait">
            {selectedService ? (
              <motion.div
                key="booking"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="bg-white shadow-lg">
                  <CardContent className="p-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mb-4"
                      onClick={handleBackToServices}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Back to services
                    </Button>

                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-lg">{selectedService.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{selectedService.description}</p>
                      </div>

                      <div className="flex items-center justify-between py-3 border-y">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          {selectedService.duration_minutes} minutes
                        </div>
                        <div className="font-semibold">
                          {business.currency} {selectedService.price}
                        </div>
                      </div>

                      <Button 
                        className="w-full"
                        size="lg"
                        onClick={() => setShowCalendar(true)}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Choose Date & Time
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <EmptyServiceSelection />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Client Payment Overlay */}
      {showClientPayment && selectedService && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="mb-4 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowClientPayment(false)}
                className="text-white hover:bg-white/20"
              >
                ×
              </Button>
            </div>
            <ClientToBusinessPayment
              businessId={businessId}
              businessName={business.name}
              amount={selectedService.price}
              currency={selectedService.currency || business.currency || 'KES'}
              onSuccess={() => setShowClientPayment(false)}
            />
          </div>
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
  );
};
