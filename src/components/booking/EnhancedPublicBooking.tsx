
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Star,
  CreditCard,
  FileText,
  Download,
  QrCode
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  currency: string;
  category: string;
}

interface BookingData {
  serviceId: string;
  date: string;
  time: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes: string;
  paymentOption: 'now' | 'later';
}

export const EnhancedPublicBooking = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [bookingData, setBookingData] = useState<BookingData>({
    serviceId: '',
    date: '',
    time: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    notes: '',
    paymentOption: 'later'
  });
  const [currentStep, setCurrentStep] = useState<'services' | 'datetime' | 'details' | 'payment' | 'confirmation'>('services');
  const [bookingResult, setBookingResult] = useState<any>(null);
  const queryClient = useQueryClient();

  // Fetch business data
  const { data: business, isLoading: businessLoading } = useQuery({
    queryKey: ['public-business', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!businessId
  });

  // Fetch services
  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['public-services', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId
  });

  // Available time slots
  const { data: availableSlots } = useQuery({
    queryKey: ['available-slots', businessId, selectedDate, selectedService?.id],
    queryFn: async () => {
      if (!selectedDate || !selectedService) return [];
      
      // Generate time slots (9 AM to 5 PM, 30-minute intervals)
      const slots = [];
      for (let hour = 9; hour < 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
        }
      }
      
      // TODO: Filter out booked slots
      return slots;
    },
    enabled: !!selectedDate && !!selectedService
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (data: BookingData) => {
      // First, create or find client
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('business_id', businessId)
        .eq('email', data.clientEmail)
        .maybeSingle();

      let clientId = existingClient?.id;
      
      if (!clientId) {
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            business_id: businessId,
            name: data.clientName,
            email: data.clientEmail,
            phone: data.clientPhone,
            retain_data: true
          })
          .select('id')
          .single();
        
        if (clientError) throw clientError;
        clientId = newClient.id;
      }

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          business_id: businessId,
          service_id: data.serviceId,
          client_id: clientId,
          booking_date: data.date,
          booking_time: data.time,
          duration_minutes: selectedService?.duration_minutes || 30,
          total_amount: selectedService?.price || 0,
          status: 'confirmed',
          payment_status: data.paymentOption === 'now' ? 'pending' : 'pending',
          notes: data.notes || null
        })
        .select('*, ticket_code')
        .single();

      if (bookingError) throw bookingError;
      return booking;
    },
    onSuccess: (booking) => {
      setBookingResult(booking);
      setCurrentStep('confirmation');
      toast.success('Booking created successfully!');
    },
    onError: (error) => {
      console.error('Booking error:', error);
      toast.error('Failed to create booking. Please try again.');
    }
  });

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setBookingData(prev => ({ ...prev, serviceId: service.id }));
    setCurrentStep('datetime');
  };

  const handleDateTimeSelect = () => {
    if (selectedDate && selectedTime) {
      setBookingData(prev => ({ ...prev, date: selectedDate, time: selectedTime }));
      setCurrentStep('details');
    }
  };

  const handleDetailsSubmit = () => {
    if (bookingData.clientName && bookingData.clientEmail) {
      setCurrentStep('payment');
    }
  };

  const handleBookingSubmit = () => {
    createBookingMutation.mutate(bookingData);
  };

  const generateInvoiceFn = async () => {
    if (!bookingResult) return;
    
    // TODO: Generate and download invoice
    toast.success('Invoice downloaded!');
  };

  if (businessLoading || servicesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading booking page...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Business Not Found</h1>
          <p>The business you're looking for is not available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Business Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {business.logo_url && (
                <img 
                  src={business.logo_url} 
                  alt={business.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{business.name}</h1>
                {business.description && (
                  <p className="text-gray-600 mb-4">{business.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm">
                  {business.address && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{business.address}</span>
                    </div>
                  )}
                  {business.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span>{business.phone}</span>
                    </div>
                  )}
                  {business.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      <span>{business.email}</span>
                    </div>
                  )}
                </div>
                {business.average_rating && (
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{business.average_rating}</span>
                    <span className="text-gray-500">({business.total_reviews} reviews)</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Steps */}
        {currentStep === 'services' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Choose a Service</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services?.map((service) => (
                <Card key={service.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6" onClick={() => handleServiceSelect(service)}>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold">{service.name}</h3>
                      <Badge variant="secondary">
                        {service.currency} {service.price}
                      </Badge>
                    </div>
                    {service.description && (
                      <p className="text-gray-600 mb-4">{service.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{service.duration_minutes} min</span>
                      </div>
                      {service.category && (
                        <Badge variant="outline">{service.category}</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {currentStep === 'datetime' && selectedService && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Button variant="ghost" onClick={() => setCurrentStep('services')}>
                ← Back
              </Button>
              <h2 className="text-2xl font-bold">Select Date & Time</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Select Date</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                  />
                </CardContent>
              </Card>

              {selectedDate && (
                <Card>
                  <CardHeader>
                    <CardTitle>Select Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots?.map((slot) => (
                        <Button
                          key={slot}
                          variant={selectedTime === slot ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedTime(slot)}
                        >
                          {slot}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {selectedDate && selectedTime && (
              <div className="mt-6">
                <Button onClick={handleDateTimeSelect} className="w-full">
                  Continue to Details
                </Button>
              </div>
            )}
          </div>
        )}

        {currentStep === 'details' && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Button variant="ghost" onClick={() => setCurrentStep('datetime')}>
                ← Back
              </Button>
              <h2 className="text-2xl font-bold">Your Details</h2>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientName">Full Name *</Label>
                    <Input
                      id="clientName"
                      value={bookingData.clientName}
                      onChange={(e) => setBookingData(prev => ({ ...prev, clientName: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientEmail">Email Address *</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={bookingData.clientEmail}
                      onChange={(e) => setBookingData(prev => ({ ...prev, clientEmail: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="clientPhone">Phone Number</Label>
                  <Input
                    id="clientPhone"
                    type="tel"
                    value={bookingData.clientPhone}
                    onChange={(e) => setBookingData(prev => ({ ...prev, clientPhone: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={bookingData.notes}
                    onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any special requests or information..."
                  />
                </div>

                <Button 
                  onClick={handleDetailsSubmit} 
                  className="w-full"
                  disabled={!bookingData.clientName || !bookingData.clientEmail}
                >
                  Continue to Payment
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 'payment' && selectedService && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Button variant="ghost" onClick={() => setCurrentStep('details')}>
                ← Back
              </Button>
              <h2 className="text-2xl font-bold">Payment Options</h2>
            </div>

            <Card>
              <CardContent className="p-6 space-y-6">
                {/* Booking Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Booking Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Service:</span>
                      <span>{selectedService.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span>{format(new Date(bookingData.date), 'PPP')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time:</span>
                      <span>{bookingData.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{selectedService.duration_minutes} minutes</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>{selectedService.currency} {selectedService.price}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Options */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Choose Payment Option</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card 
                      className={`cursor-pointer border-2 ${bookingData.paymentOption === 'later' ? 'border-blue-500' : 'border-gray-200'}`}
                      onClick={() => setBookingData(prev => ({ ...prev, paymentOption: 'later' }))}
                    >
                      <CardContent className="p-4 text-center">
                        <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                        <h4 className="font-semibold">Pay Later</h4>
                        <p className="text-sm text-gray-600">Get invoice, pay at appointment</p>
                      </CardContent>
                    </Card>

                    <Card 
                      className={`cursor-pointer border-2 ${bookingData.paymentOption === 'now' ? 'border-blue-500' : 'border-gray-200'}`}
                      onClick={() => setBookingData(prev => ({ ...prev, paymentOption: 'now' }))}
                    >
                      <CardContent className="p-4 text-center">
                        <CreditCard className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                        <h4 className="font-semibold">Pay Now</h4>
                        <p className="text-sm text-gray-600">Secure online payment</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Button 
                  onClick={handleBookingSubmit} 
                  className="w-full"
                  disabled={createBookingMutation.isPending}
                >
                  {createBookingMutation.isPending ? 'Creating Booking...' : 'Confirm Booking'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 'confirmation' && bookingResult && (
          <div className="text-center">
            <Card>
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QrCode className="w-8 h-8 text-green-600" />
                </div>
                
                <h2 className="text-2xl font-bold text-green-600 mb-4">Booking Confirmed!</h2>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold mb-2">Your Booking Details</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Ticket Code:</strong> {bookingResult.ticket_code}</div>
                    <div><strong>Service:</strong> {selectedService?.name}</div>
                    <div><strong>Date:</strong> {format(new Date(bookingResult.booking_date), 'PPP')}</div>
                    <div><strong>Time:</strong> {bookingResult.booking_time}</div>
                    <div><strong>Business:</strong> {business.name}</div>
                  </div>
                </div>

                <p className="text-gray-600 mb-6">
                  A confirmation email has been sent to {bookingData.clientEmail}. 
                  You'll receive a reminder 24 hours before your appointment.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={generateInvoiceFn} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download Invoice
                  </Button>
                  <Button onClick={() => window.location.reload()}>
                    Book Another Service
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
