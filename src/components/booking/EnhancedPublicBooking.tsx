
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { BusinessHeader } from './BusinessHeader';
import { DirectPaystackPayment } from '@/components/payment/DirectPaystackPayment';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';

export const EnhancedPublicBooking = () => {
  const { businessId } = useParams();
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [bookingReference, setBookingReference] = useState('');

  // Fetch business details - support both direct ID and subdomain
  const { data: business, isLoading: isLoadingBusiness, error: businessError } = useQuery({
    queryKey: ['public-business', businessId],
    queryFn: async () => {
      console.log('Fetching business details for:', businessId);
      
      let query = supabase
        .from('businesses')
        .select('*')
        .eq('is_active', true);

      // Check if businessId is a UUID or subdomain
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(businessId);
      
      if (isUUID) {
        query = query.eq('id', businessId);
      } else {
        query = query.eq('subdomain', businessId);
      }

      const { data, error } = await query.single();

      if (error) {
        console.error('Business fetch error:', error);
        throw error;
      }

      console.log('Business data loaded:', data);
      return data;
    },
    enabled: !!businessId,
    retry: 2
  });

  // Fetch business services
  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: ['public-services', business?.id],
    queryFn: async () => {
      if (!business?.id) return [];
      
      console.log('Fetching services for business:', business.id);
      
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', business.id)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Services fetch error:', error);
        throw error;
      }

      console.log('Services loaded:', data);
      return data || [];
    },
    enabled: !!business?.id
  });

  const validateBookingForm = () => {
    if (!selectedService) {
      toast.error('Please select a service');
      return false;
    }
    if (!selectedDate) {
      toast.error('Please select a date');
      return false;
    }
    if (!selectedTime) {
      toast.error('Please select a time');
      return false;
    }
    if (!customerName.trim()) {
      toast.error('Please enter your name');
      return false;
    }
    if (!customerPhone.trim()) {
      toast.error('Please enter your phone number');
      return false;
    }
    if (!customerEmail.trim()) {
      toast.error('Please enter your email');
      return false;
    }
    return true;
  };

  const handleProceedToPayment = () => {
    if (!validateBookingForm()) return;

    const reference = `BK_${business.id?.slice(0, 8)}_${Date.now()}`;
    setBookingReference(reference);
    setShowPayment(true);
    
    toast.success('Booking details confirmed! Proceed with payment.');
  };

  const handlePaymentSuccess = async (paymentReference: string) => {
    try {
      console.log('Creating booking with payment reference:', paymentReference);
      
      // Create the booking in the database
      const { data: booking, error } = await supabase
        .from('bookings')
        .insert({
          business_id: business.id,
          service_id: selectedService.id,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail,
          booking_date: selectedDate.toISOString().split('T')[0],
          booking_time: selectedTime,
          status: 'confirmed',
          payment_status: 'paid',
          payment_reference: paymentReference,
          notes: notes,
          total_amount: selectedService.price,
          duration_minutes: selectedService.duration_minutes,
          // Create a temporary client entry for the booking
          client_id: '00000000-0000-0000-0000-000000000000' // Placeholder, will be handled by backend
        })
        .select()
        .single();

      if (error) {
        console.error('Booking creation error:', error);
        throw error;
      }

      toast.success('Booking confirmed successfully! You will receive a confirmation email shortly.');
      
      // Reset form
      setSelectedService(null);
      setSelectedDate(null);
      setSelectedTime('');
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setNotes('');
      setShowPayment(false);
      setBookingReference('');
      
    } catch (error) {
      console.error('Booking creation failed:', error);
      toast.error('Failed to create booking. Please contact the business directly.');
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  if (isLoadingBusiness) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <LoadingSkeleton lines={8} />
        </div>
      </div>
    );
  }

  if (businessError || !business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Business Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              The business you're looking for could not be found or is currently inactive.
              Please check the QR code or contact the business directly.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showPayment && selectedService) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <BusinessHeader business={business} />
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Complete Your Booking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Booking Summary</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Service:</strong> {selectedService.name}</p>
                  <p><strong>Date:</strong> {format(selectedDate, 'EEEE, MMMM do, yyyy')}</p>
                  <p><strong>Time:</strong> {selectedTime}</p>
                  <p><strong>Duration:</strong> {selectedService.duration_minutes} minutes</p>
                  <p><strong>Customer:</strong> {customerName}</p>
                  <p><strong>Phone:</strong> {customerPhone}</p>
                  <p><strong>Amount:</strong> {selectedService.currency} {selectedService.price}</p>
                </div>
              </div>

              <DirectPaystackPayment
                amount={selectedService.price}
                email={customerEmail}
                currency={selectedService.currency}
                description={`${selectedService.name} - ${business.name}`}
                onSuccess={handlePaymentSuccess}
                onError={(error) => {
                  console.error('Payment failed:', error);
                  toast.error('Payment failed. Please try again.');
                }}
                metadata={{
                  booking_reference: bookingReference,
                  business_id: business.id,
                  service_id: selectedService.id,
                  customer_name: customerName,
                  customer_phone: customerPhone
                }}
              />

              <Button 
                variant="outline" 
                onClick={() => setShowPayment(false)}
                className="w-full"
              >
                Back to Booking Details
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <BusinessHeader business={business} />

        <div className="grid md:grid-cols-2 gap-6">
          {/* Service Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select a Service</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingServices ? (
                <LoadingSkeleton lines={3} />
              ) : services && services.length > 0 ? (
                <div className="space-y-3">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedService?.id === service.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedService(service)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{service.name}</h3>
                        <Badge variant="secondary">
                          {service.currency} {service.price}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {service.duration_minutes} min
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {service.category}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No services available at this time.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Booking Form */}
          <Card>
            <CardHeader>
              <CardTitle>Book Your Appointment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedService && (
                <div className="bg-green-50 p-3 rounded-lg mb-4">
                  <p className="text-sm text-green-800">
                    <strong>Selected:</strong> {selectedService.name} - {selectedService.currency} {selectedService.price}
                  </p>
                </div>
              )}

              <div>
                <Label>Select Date</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date.getDay() === 0}
                  className="rounded-md border mt-1"
                />
              </div>

              {selectedDate && (
                <div>
                  <Label htmlFor="time">Select Time</Label>
                  <select
                    id="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="">Choose a time</option>
                    {generateTimeSlots().map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g., +254712345678"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requests or notes..."
                  rows={3}
                />
              </div>

              <Button
                onClick={handleProceedToPayment}
                disabled={!selectedService}
                className="w-full"
              >
                Proceed to Payment
                {selectedService && (
                  <span className="ml-2">
                    ({selectedService.currency} {selectedService.price})
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
