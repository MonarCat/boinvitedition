
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Star, 
  Calendar, 
  CreditCard, 
  CheckCircle,
  User,
  MessageCircle,
  Smartphone
} from 'lucide-react';

// Mock data for preview
const mockBusiness = {
  id: 'preview-business',
  name: 'Elegant Hair Studio',
  description: 'Premium hair styling and beauty services in the heart of Nairobi',
  address: '123 Kimathi Street, Nairobi CBD',
  city: 'Nairobi',
  phone: '+254712345678',
  logo_url: '/placeholder.svg',
  featured_image_url: '/placeholder.svg',
  is_verified: true,
  average_rating: 4.8,
  total_reviews: 127,
  currency: 'KES',
  business_hours: {
    monday: { open: '09:00', close: '18:00' },
    tuesday: { open: '09:00', close: '18:00' },
    wednesday: { open: '09:00', close: '18:00' },
    thursday: { open: '09:00', close: '18:00' },
    friday: { open: '09:00', close: '18:00' },
    saturday: { open: '09:00', close: '16:00' },
    sunday: { open: '10:00', close: '15:00' }
  }
};

const mockServices = [
  {
    id: '1',
    name: 'Hair Cut & Styling',
    description: 'Professional haircut with modern styling techniques',
    price: 2500,
    duration_minutes: 60,
    category: 'Hair Services'
  },
  {
    id: '2',
    name: 'Hair Coloring',
    description: 'Complete hair coloring service with premium products',
    price: 4500,
    duration_minutes: 120,
    category: 'Hair Services'
  },
  {
    id: '3',
    name: 'Manicure & Pedicure',
    description: 'Complete nail care service with gel polish',
    price: 1800,
    duration_minutes: 45,
    category: 'Beauty Services'
  },
  {
    id: '4',
    name: 'Facial Treatment',
    description: 'Deep cleansing facial with moisturizing treatment',
    price: 3200,
    duration_minutes: 75,
    category: 'Beauty Services'
  }
];

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

const BookingPreviewPage = () => {
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>('2024-01-15');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [bookingStep, setBookingStep] = useState<'services' | 'details' | 'payment' | 'confirmation'>('services');

  const formatPrice = (price: number) => `KES ${price.toLocaleString()}`;

  const BusinessHeader = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative h-48 md:h-64 rounded-2xl overflow-hidden mb-8 bg-gradient-to-r from-blue-500 to-indigo-600"
    >
      <img
        src={mockBusiness.featured_image_url}
        alt={mockBusiness.name}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent" />
      
      <div className="absolute top-4 left-4 z-10">
        <motion.img 
          src={mockBusiness.logo_url} 
          alt={`${mockBusiness.name} logo`} 
          className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        />
      </div>

      <div className="absolute inset-0 flex items-end p-6">
        <div className="text-white">
          <h1 className="text-2xl md:text-3xl font-bold">{mockBusiness.name}</h1>
          {mockBusiness.is_verified && <Badge variant="secondary" className="mt-1">Verified</Badge>}
        </div>
      </div>
    </motion.div>
  );

  const BusinessDetails = () => (
    <Card className="mb-6">
      <CardContent className="p-6 space-y-4">
        <p className="text-gray-700">{mockBusiness.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-gray-500" />
            <span className="text-gray-800">{mockBusiness.address}, {mockBusiness.city}</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-500" />
            <span className="text-gray-800">Today: 09:00 - 18:00</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-gray-500" />
            <span className="text-gray-800">{mockBusiness.phone}</span>
          </div>
          <div className="flex items-center gap-3">
            <Star className="w-5 h-5 text-yellow-500 fill-current" />
            <span className="text-gray-800 font-semibold">
              {mockBusiness.average_rating} ({mockBusiness.total_reviews} reviews)
            </span>
          </div>
        </div>

        <div className="pt-4 border-t">
          <a 
            href={`https://wa.me/${mockBusiness.phone.replace(/\D/g, '')}`} 
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
  );

  const ServicesStep = () => (
    <Card>
      <CardHeader>
        <CardTitle>Choose a Service</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockServices.map((service) => (
            <div
              key={service.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                selectedService?.id === service.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
              onClick={() => setSelectedService(service)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{service.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">{service.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      {service.duration_minutes} min
                    </div>
                    <Badge variant="outline">{service.category}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{formatPrice(service.price)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {selectedService && (
          <Button 
            className="w-full mt-6" 
            onClick={() => setBookingStep('details')}
          >
            Continue to Booking Details
          </Button>
        )}
      </CardContent>
    </Card>
  );

  const BookingDetailsStep = () => (
    <Card>
      <CardHeader>
        <CardTitle>Booking Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold">{selectedService?.name}</h3>
          <p className="text-sm text-gray-600">{selectedService?.description}</p>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm">{selectedService?.duration_minutes} minutes</span>
            <span className="font-bold">{formatPrice(selectedService?.price)}</span>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Select Date & Time</h4>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {timeSlots.slice(0, 8).map((time) => (
              <Button
                key={time}
                variant={selectedTime === time ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTime(time)}
                className="text-xs"
              >
                {time}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold">Your Information</h4>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <div className="p-2 border rounded bg-gray-50">John Doe</div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <div className="p-2 border rounded bg-gray-50">john.doe@example.com</div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <div className="p-2 border rounded bg-gray-50">+254712345678</div>
            </div>
          </div>
        </div>

        <Button 
          className="w-full" 
          onClick={() => setBookingStep('payment')}
          disabled={!selectedTime}
        >
          Proceed to Payment
        </Button>
      </CardContent>
    </Card>
  );

  const PaymentStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Complete Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">Booking Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Service:</span>
              <span className="font-medium">{selectedService?.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>January 15, 2024</span>
            </div>
            <div className="flex justify-between">
              <span>Time:</span>
              <span>{selectedTime}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t pt-2">
              <span>Total:</span>
              <span>{formatPrice(selectedService?.price)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold">Payment Methods</h4>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center gap-2 p-3 bg-white rounded border border-green-200">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span className="text-sm">Cards (Visa, Mastercard)</span>
              <Badge className="ml-auto bg-green-500">Available</Badge>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white rounded border border-green-200">
              <Smartphone className="w-4 h-4 text-green-600" />
              <span className="text-sm">Mobile Money (M-Pesa, Airtel)</span>
              <Badge className="ml-auto bg-green-500">Available</Badge>
            </div>
          </div>
        </div>

        <Button 
          className="w-full bg-green-600 hover:bg-green-700" 
          onClick={() => setBookingStep('confirmation')}
        >
          Pay {formatPrice(selectedService?.price)}
        </Button>

        <p className="text-xs text-center text-gray-500">
          <CheckCircle className="w-3 h-3 inline mr-1" />
          Secured by 256-bit SSL encryption
        </p>
      </CardContent>
    </Card>
  );

  const ConfirmationStep = () => (
    <Card className="border-green-200">
      <CardContent className="p-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
        >
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        </motion.div>
        <h2 className="text-2xl font-bold text-green-800 mb-2">Booking Confirmed!</h2>
        <p className="text-gray-600 mb-6">Your appointment has been successfully booked.</p>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Ticket Number:</span>
              <span className="font-mono">TKT-20240115-ABC123</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Service:</span>
              <span>{selectedService?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Date & Time:</span>
              <span>Jan 15, 2024 at {selectedTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Business:</span>
              <span>{mockBusiness.name}</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          A confirmation email has been sent to john.doe@example.com
        </p>

        <Button 
          variant="outline" 
          onClick={() => {
            setBookingStep('services');
            setSelectedService(null);
            setSelectedTime('');
          }}
        >
          Book Another Service
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Client Booking Page Preview</h1>
          <p className="text-gray-600">This is how clients experience the booking process</p>
        </div>

        <BusinessHeader />
        <BusinessDetails />

        <Tabs value={bookingStep} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="services" className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">1</span>
              Services
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">2</span>
              Details
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">3</span>
              Payment
            </TabsTrigger>
            <TabsTrigger value="confirmation" className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center">✓</span>
              Done
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="services">
              <ServicesStep />
            </TabsContent>

            <TabsContent value="details">
              <BookingDetailsStep />
            </TabsContent>

            <TabsContent value="payment">
              <PaymentStep />
            </TabsContent>

            <TabsContent value="confirmation">
              <ConfirmationStep />
            </TabsContent>
          </div>
        </Tabs>

        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-900 mb-3 text-sm">📋 How to Book</h3>
            <div className="space-y-2 text-blue-800 text-sm">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                <span>Choose your preferred service from the available options</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                <span>Select your preferred date and time slot</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                <span>Complete your booking with secure payment</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                <span>Receive instant confirmation and booking details</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingPreviewPage;
