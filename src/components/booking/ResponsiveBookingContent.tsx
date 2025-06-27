import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Clock, Star, ChevronLeft, CreditCard, Calendar, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ServicesList } from './ServicesList';
import { EmptyServiceSelection } from './EmptyServiceSelection';
import { PublicBookingCalendar } from './PublicBookingCalendar';
import { BusinessPaymentInstructions } from '@/components/business/BusinessPaymentInstructions';
import { ClientToBusinessPayment } from '@/components/payment/ClientToBusinessPayment';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  currency?: string;
  category?: 'transport' | 'general';
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

interface ClientDetails {
  name: string;
  email: string;
  phone: string;
  saveData: boolean;
}

interface TransportDetails {
  from: string;
  to: string;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
}

interface ResponsiveBookingContentProps {
  business: Business;
  services: Service[];
  businessId: string;
}

const ClientDetailsForm: React.FC<{
  service: Service;
  clientDetails: ClientDetails;
  transportDetails: TransportDetails;
  onUpdate: (details: ClientDetails, transport?: TransportDetails) => void;
  onBack: () => void;
  onNext: () => void;
}> = ({ service, clientDetails, transportDetails, onUpdate, onBack, onNext }) => {
  const [localClientDetails, setLocalClientDetails] = useState(clientDetails);
  const [localTransportDetails, setLocalTransportDetails] = useState(transportDetails);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(localClientDetails, service.category === 'transport' ? localTransportDetails : undefined);
    onNext();
  };

  return (
    <Card className="bg-white shadow-lg">
      <CardContent className="p-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={onBack}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={localClientDetails.name}
                onChange={(e) => setLocalClientDetails(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={localClientDetails.email}
                onChange={(e) => setLocalClientDetails(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={localClientDetails.phone}
                onChange={(e) => setLocalClientDetails(prev => ({ ...prev, phone: e.target.value }))}
                required
              />
            </div>

            {service.category === 'transport' && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold">Transport Details</h3>
                <div>
                  <Label htmlFor="from">From</Label>
                  <Input
                    id="from"
                    value={localTransportDetails.from}
                    onChange={(e) => setLocalTransportDetails(prev => ({ ...prev, from: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="to">To</Label>
                  <Input
                    id="to"
                    value={localTransportDetails.to}
                    onChange={(e) => setLocalTransportDetails(prev => ({ ...prev, to: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Passengers</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="adults">Adults</Label>
                      <Input
                        id="adults"
                        type="number"
                        min="1"
                        value={localTransportDetails.passengers.adults}
                        onChange={(e) => setLocalTransportDetails(prev => ({
                          ...prev,
                          passengers: { ...prev.passengers, adults: parseInt(e.target.value) }
                        }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="children">Children</Label>
                      <Input
                        id="children"
                        type="number"
                        min="0"
                        value={localTransportDetails.passengers.children}
                        onChange={(e) => setLocalTransportDetails(prev => ({
                          ...prev,
                          passengers: { ...prev.passengers, children: parseInt(e.target.value) }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="infants">Infants</Label>
                      <Input
                        id="infants"
                        type="number"
                        min="0"
                        value={localTransportDetails.passengers.infants}
                        onChange={(e) => setLocalTransportDetails(prev => ({
                          ...prev,
                          passengers: { ...prev.passengers, infants: parseInt(e.target.value) }
                        }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="saveData"
                checked={localClientDetails.saveData}
                onChange={(e) => setLocalClientDetails(prev => ({ ...prev, saveData: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="saveData">Save my details for future bookings</Label>
            </div>
          </div>

          <Button type="submit" className="w-full">
            Continue to Date Selection
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export const ResponsiveBookingContent: React.FC<ResponsiveBookingContentProps> = ({
  business,
  services,
  businessId
}) => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showClientPayment, setShowClientPayment] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<{ date: Date; time: string } | null>(null);
  const [clientDetails, setClientDetails] = useState<ClientDetails>({
    name: '',
    email: '',
    phone: '',
    saveData: false
  });
  const [transportDetails, setTransportDetails] = useState<TransportDetails>({
    from: '',
    to: '',
    passengers: {
      adults: 1,
      children: 0,
      infants: 0
    }
  });
  const [showClientForm, setShowClientForm] = useState(false);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setShowClientForm(true);
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

  const handleClientDetailsUpdate = (details: ClientDetails, transport?: TransportDetails) => {
    setClientDetails(details);
    if (transport) {
      setTransportDetails(transport);
    }
  };

  const handleDateTimeSelect = (date: Date, time: string) => {
    setSelectedDateTime({ date, time });
    setShowClientPayment(true);
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
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent" />
        
        <div className="absolute top-4 left-4 z-10">
          <motion.img 
            src={business.logo_url || '/placeholder.svg'} 
            alt={`${business.name} logo`} 
            className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          />
        </div>

        <div className="absolute inset-0 flex items-end p-6">
          <div className="text-white">
            <h1 className="text-2xl md:text-3xl font-bold">{business.name}</h1>
            {business.is_verified && <Badge variant="secondary" className="mt-1">Verified</Badge>}
          </div>
        </div>
      </motion.div>

      {/* Business Details */}
      <Card className="mb-6">
        <CardContent className="p-6 space-y-4">
            <p className="text-gray-700">{business.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-800">{business.address}, {business.city}</span>
              </div>
              <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-800">{formatBusinessHours(business.business_hours)}</span>
              </div>
              <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-800">{business.phone}</span>
              </div>
              {business.average_rating && (
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="text-gray-800 font-semibold">{business.average_rating.toFixed(1)} ({business.total_reviews} reviews)</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t">
              <a 
                  href={`https://wa.me/${business.phone.replace(/\D/g, '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold transition-colors duration-200"
              >
                  <MessageCircle className="w-5 h-5" />
                  <span>Contact on WhatsApp</span>
              </a>
            </div>
        </CardContent>
      </Card>

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
            !selectedService && "md:sticky md:top-24"
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <AnimatePresence mode="wait">
            {showCalendar && selectedService ? (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <PublicBookingCalendar
                  businessId={businessId}
                  businessHours={business.business_hours}
                  service={selectedService}
                  onDateTimeSelect={handleDateTimeSelect}
                  onBack={() => setShowCalendar(false)}
                />
              </motion.div>
            ) : showClientForm && selectedService ? (
              <motion.div
                key="clientForm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <ClientDetailsForm
                  service={selectedService}
                  clientDetails={clientDetails}
                  transportDetails={transportDetails}
                  onUpdate={handleClientDetailsUpdate}
                  onBack={handleBackToServices}
                  onNext={() => {
                    setShowClientForm(false);
                    setShowCalendar(true);
                  }}
                />
              </motion.div>
            ) : selectedService ? (
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
      {showClientPayment && selectedService && selectedDateTime && (
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
              bookingDetails={{
                service: selectedService.name,
                date: selectedDateTime.date.toLocaleDateString(),
                time: selectedDateTime.time,
                clientName: clientDetails.name
              }}
              onSuccess={() => {
                toast.success('Booking confirmed successfully!');
                setShowClientPayment(false);
                setSelectedService(null);
                setShowCalendar(false);
                setSelectedDateTime(null);
              }}
              onClose={() => setShowClientPayment(false)}
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
