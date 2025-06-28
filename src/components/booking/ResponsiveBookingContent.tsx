
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Clock, Star, ChevronLeft, CreditCard, Calendar, MessageCircle, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { ServicesList } from './ServicesList';
import { EmptyServiceSelection } from './EmptyServiceSelection';
import { PublicBookingCalendar } from './PublicBookingCalendar';
import { ClientToBusinessPayment } from '@/components/payment/ClientToBusinessPayment';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  currency?: string;
  category?: 'transport' | 'general';
  image_url?: string;
}

interface Staff {
  id: string;
  name: string;
  avatar_url?: string;
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
  payment_policy?: 'pay_on_booking' | 'pay_after_service';
}

interface ClientDetails {
  name: string;
  email: string;
  phone: string;
}

interface ResponsiveBookingContentProps {
  business: Business;
  services: Service[];
  businessId: string;
}

const ClientDetailsForm: React.FC<{
  clientDetails: ClientDetails;
  onUpdate: (details: ClientDetails) => void;
  onBack: () => void;
  onNext: () => void;
}> = ({ clientDetails, onUpdate, onBack, onNext }) => {
  const [localClientDetails, setLocalClientDetails] = useState(clientDetails);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!localClientDetails.name || !localClientDetails.email || !localClientDetails.phone) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    onUpdate(localClientDetails);
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

        <div className="mb-4">
          <h3 className="text-lg font-semibold">Your Information</h3>
          <p className="text-sm text-gray-600">Please provide your contact details</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={localClientDetails.name}
              onChange={(e) => setLocalClientDetails(prev => ({ ...prev, name: e.target.value }))}
              required
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={localClientDetails.email}
              onChange={(e) => setLocalClientDetails(prev => ({ ...prev, email: e.target.value }))}
              required
              placeholder="your@email.com"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={localClientDetails.phone}
              onChange={(e) => setLocalClientDetails(prev => ({ ...prev, phone: e.target.value }))}
              required
              placeholder="0712345678"
            />
          </div>

          <Button type="submit" className="w-full">
            Continue to Date Selection
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const StaffSelector: React.FC<{
  businessId: string;
  selectedStaffId: string | null;
  onSelectStaff: (staffId: string | null) => void;
  onBack: () => void;
  onNext: () => void;
}> = ({ businessId, selectedStaffId, onSelectStaff, onBack, onNext }) => {
  const { data: staff, isLoading } = useQuery<Staff[]>({
    queryKey: ['business-staff', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff')
        .select('id, name, email')
        .eq('business_id', businessId)
        .eq('is_active', true);

      if (error) throw new Error(error.message);

      return data.map((s) => ({ 
        id: s.id, 
        name: s.name || 'Unnamed Staff',
        avatar_url: undefined // No avatar for now since we don't have user relation
      }));
    },
  });

  if (isLoading) return <div>Loading staff...</div>;

  return (
    <Card>
      <CardContent className="p-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={onBack}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Calendar
        </Button>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Select Staff (Optional)</h3>
            <p className="text-sm text-gray-600">Choose a preferred staff member or continue without selection</p>
          </div>

          {staff && staff.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {staff.map((member) => (
                <button
                  key={member.id}
                  className={cn(
                    "p-3 border rounded-lg flex flex-col items-center gap-2 transition-colors",
                    selectedStaffId === member.id
                      ? "bg-blue-100 border-blue-500"
                      : "hover:bg-gray-50"
                  )}
                  onClick={() => onSelectStaff(member.id)}
                >
                  <img 
                    src={member.avatar_url || '/placeholder.svg'} 
                    alt={member.name} 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <span className="text-sm text-center">{member.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No staff members available</p>
          )}

          <Button onClick={onNext} className="w-full">
            Continue to Payment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const ResponsiveBookingContent: React.FC<ResponsiveBookingContentProps> = ({
  business,
  services,
  businessId
}) => {
  type BookingStep = 'serviceSelection' | 'clientDetails' | 'calendar' | 'staffSelection' | 'payment' | 'confirmation';

  const [bookingStep, setBookingStep] = useState<BookingStep>('serviceSelection');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDateTime, setSelectedDateTime] = useState<{ date: Date; time: string } | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [clientDetails, setClientDetails] = useState<ClientDetails>({
    name: '',
    email: '',
    phone: ''
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [
    business.featured_image_url,
    ...services.flatMap(s => s.image_url ? [s.image_url] : [])
  ].filter(Boolean) as string[];

  const resetBookingFlow = () => {
    setBookingStep('serviceSelection');
    setSelectedService(null);
    setSelectedDateTime(null);
    setSelectedStaffId(null);
    setClientDetails({ name: '', email: '', phone: '' });
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % (images.length || 1));
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + (images.length || 1)) % (images.length || 1));
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setBookingStep('clientDetails');
  };

  const handleBackToServices = () => {
    setSelectedService(null);
    setBookingStep('serviceSelection');
  };

  const handleClientDetailsUpdate = (details: ClientDetails) => {
    setClientDetails(details);
  };

  const handleDateTimeSelect = (date: Date, time: string) => {
    setSelectedDateTime({ date, time });
    setBookingStep('staffSelection');
  };

  const handleStaffSelect = (staffId: string | null) => {
    setSelectedStaffId(staffId);
  };

  const handleProceedToPayment = () => {
    // Always go to payment step - let the payment component handle the policy
    setBookingStep('payment');
  };

  const handlePaymentSuccess = () => {
    toast.success('Payment successful! Your booking has been confirmed.');
    setBookingStep('confirmation');
  };

  const handleBookingConfirmation = async () => {
    // This is for cases where no payment is required
    if (!selectedService || !selectedDateTime || !clientDetails.name || !clientDetails.email || !clientDetails.phone) {
      toast.error('Missing required information');
      return;
    }

    try {
      console.log('Creating booking without payment...');
      // Create booking logic here
      toast.success('Booking confirmed successfully!');
      setBookingStep('confirmation');
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Unable to complete your booking. Please try again.');
    }
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

  // Determine the payment policy, defaulting to pay_on_booking if not specified
  const paymentPolicy = business.payment_policy || 'pay_on_booking';

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-48 md:h-64 rounded-2xl overflow-hidden mb-8 bg-gradient-to-r from-blue-500 to-indigo-600"
      >
        {images.length > 0 ? (
          <AnimatePresence initial={false} custom={currentImageIndex}>
            <motion.img
              key={currentImageIndex}
              src={images[currentImageIndex]}
              alt={`${business.name} gallery image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ opacity: { duration: 0.3 } }}
            />
          </AnimatePresence>
        ) : (
          <img
            src={'/placeholder.svg'}
            alt={business.name}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent" />
        
        {images.length > 1 && (
          <>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 rounded-full"
              onClick={handlePrevImage}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 rounded-full"
              onClick={handleNextImage}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors duration-200",
                    currentImageIndex === index ? "bg-white" : "bg-white/50 hover:bg-white/75"
                  )}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          </>
        )}

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
            <div className="flex gap-2 items-center mt-1">
              {business.is_verified && <Badge variant="secondary">Verified</Badge>}
              <Badge variant="default">
                {paymentPolicy === 'pay_on_booking' ? 'Pay on Booking' : 'Pay After Service'}
              </Badge>
            </div>
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
            bookingStep !== 'serviceSelection' && "md:hidden"
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
            bookingStep === 'serviceSelection' && "md:sticky md:top-24"
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <AnimatePresence mode="wait">
            {bookingStep === 'clientDetails' && selectedService ? (
              <motion.div
                key="clientForm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <ClientDetailsForm
                  clientDetails={clientDetails}
                  onUpdate={handleClientDetailsUpdate}
                  onBack={handleBackToServices}
                  onNext={() => setBookingStep('calendar')}
                />
              </motion.div>
            ) : bookingStep === 'calendar' && selectedService ? (
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
                  onBack={() => setBookingStep('clientDetails')}
                />
              </motion.div>
            ) : bookingStep === 'staffSelection' && selectedService && selectedDateTime ? (
              <motion.div
                key="staffSelection"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <StaffSelector 
                  businessId={businessId} 
                  selectedStaffId={selectedStaffId} 
                  onSelectStaff={handleStaffSelect}
                  onBack={() => setBookingStep('calendar')}
                  onNext={handleProceedToPayment}
                />
              </motion.div>
            ) : bookingStep === 'payment' && selectedService && selectedDateTime ? (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <ClientToBusinessPayment
                  businessId={businessId}
                  businessName={business.name}
                  amount={selectedService.price}
                  currency={selectedService.currency || business.currency || 'KES'}
                  bookingDetails={{
                    serviceId: selectedService.id,
                    serviceName: selectedService.name,
                    date: selectedDateTime.date.toISOString(),
                    time: selectedDateTime.time,
                    staffId: selectedStaffId,
                    clientName: clientDetails.name,
                    clientEmail: clientDetails.email,
                    clientPhone: clientDetails.phone,
                  }}
                  onSuccess={handlePaymentSuccess}
                  onClose={() => setBookingStep('staffSelection')}
                />
              </motion.div>
            ) : bookingStep === 'confirmation' ? (
              <motion.div
                key="confirmation"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="mb-4">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CreditCard className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Booking Confirmed!</h3>
                      <p className="text-gray-600 mb-4">
                        Your booking for {selectedService?.name} has been confirmed.
                        You will receive a confirmation email shortly.
                      </p>
                    </div>
                    <Button onClick={resetBookingFlow} className="w-full">
                      Book Another Service
                    </Button>
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

      {/* Booking Instructions */}
      <Card className="bg-blue-50 border-blue-200 mt-6">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-900 mb-3 text-sm">
            📋 How to Book {paymentPolicy === 'pay_after_service' && '(Pay After Service)'}
          </h3>
          <div className="space-y-2 text-blue-800 text-sm">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
              <span>Choose your preferred service from the list.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
              <span>Enter your contact details (name, email, phone).</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
              <span>Select a date and time that works for you.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
              <span>Choose a staff member if you have a preference.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">5</span>
              <span>Complete your booking with secure payment.</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
