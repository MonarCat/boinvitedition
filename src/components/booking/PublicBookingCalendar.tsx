
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Service {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
  currency?: string;
}

interface PublicBookingCalendarProps {
  businessId: string;
  selectedService: Service;
  onBookingComplete: () => void;
}

export const PublicBookingCalendar: React.FC<PublicBookingCalendarProps> = ({
  businessId,
  selectedService,
  onBookingComplete
}) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !customerInfo.name || !customerInfo.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!customerInfo.email && !customerInfo.phone) {
      toast.error('Please provide either email or phone number');
      return;
    }

    setIsLoading(true);

    try {
      // Create or find client first
      let clientId = null;
      
      try {
        // Try to find existing client by phone
        const { data: existingClient } = await supabase
          .from('clients')
          .select('id')
          .eq('business_id', businessId)
          .eq('phone', customerInfo.phone)
          .maybeSingle();

        if (existingClient) {
          clientId = existingClient.id;
        } else {
          // Create new client
          const { data: newClient, error: clientError } = await supabase
            .from('clients')
            .insert({
              business_id: businessId,
              name: customerInfo.name,
              phone: customerInfo.phone,
              email: customerInfo.email || `${customerInfo.phone.replace(/\D/g, '')}@booking.temp`
            })
            .select()
            .single();

          if (clientError) {
            console.warn('Client creation failed, proceeding without client ID:', clientError);
            // Continue without client ID - we'll use customer info directly
          } else {
            clientId = newClient.id;
          }
        }
      } catch (clientError) {
        console.warn('Client lookup/creation failed:', clientError);
        // Continue without client ID
      }

      // Create booking with fallback client ID
      const bookingData = {
        business_id: businessId,
        service_id: selectedService.id,
        client_id: clientId || '00000000-0000-0000-0000-000000000000', // Fallback UUID
        booking_date: selectedDate,
        booking_time: selectedTime,
        duration_minutes: selectedService.duration_minutes,
        total_amount: selectedService.price,
        status: 'confirmed',
        payment_status: 'pending',
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        customer_email: customerInfo.email || `${customerInfo.phone.replace(/\D/g, '')}@booking.temp`,
        notes: `Public booking for ${selectedService.name}`
      };

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();

      if (bookingError) {
        console.error('Booking creation error:', bookingError);
        throw new Error(bookingError.message || 'Failed to create booking');
      }

      toast.success('Booking created successfully!');
      onBookingComplete();

    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate time slots (9 AM to 6 PM)
  const timeSlots = [];
  for (let hour = 9; hour < 18; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
  }

  // Get minimum date (today)
  const today = new Date();
  const minDate = format(today, 'yyyy-MM-dd');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Book {selectedService.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="254712345678"
                required
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your@email.com"
              />
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <Label htmlFor="date">Select Date *</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={minDate}
              required
            />
          </div>

          {/* Time Selection */}
          <div>
            <Label htmlFor="time">Select Time *</Label>
            <select
              id="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Choose a time</option>
              {timeSlots.map(time => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          {/* Booking Summary */}
          {selectedDate && selectedTime && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Booking Summary</h3>
              <div className="space-y-1 text-sm text-blue-800">
                <p><strong>Service:</strong> {selectedService.name}</p>
                <p><strong>Date:</strong> {format(new Date(selectedDate), 'EEEE, MMMM do, yyyy')}</p>
                <p><strong>Time:</strong> {selectedTime}</p>
                <p><strong>Duration:</strong> {selectedService.duration_minutes} minutes</p>
                <p><strong>Price:</strong> {selectedService.currency || 'KES'} {selectedService.price.toLocaleString()}</p>
              </div>
            </div>
          )}

          <Button
            onClick={handleBooking}
            disabled={isLoading || !selectedDate || !selectedTime || !customerInfo.name || !customerInfo.phone}
            className="w-full"
            size="lg"
          >
            {isLoading ? 'Creating Booking...' : 'Confirm Booking'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
