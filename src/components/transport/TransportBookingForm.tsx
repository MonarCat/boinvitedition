
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, MapPin, Users, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { sendBookingReminder, createCalendarLink } from '@/utils/emailService';

interface TransportBookingFormProps {
  businessId: string;
  serviceId: string;
  onBookingComplete?: (bookingId: string) => void;
}

export const TransportBookingForm: React.FC<TransportBookingFormProps> = ({
  businessId,
  serviceId,
  onBookingComplete
}) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    pickupLocation: '',
    dropoffLocation: '',
    travelDate: '',
    travelTime: '',
    passengerCount: 1,
    specialRequests: '',
    paymentMethod: 'cash'
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    const required = ['customerName', 'customerEmail', 'customerPhone', 'pickupLocation', 'dropoffLocation', 'travelDate', 'travelTime'];
    
    for (const field of required) {
      if (!formData[field as keyof typeof formData]) {
        toast.error(`${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`);
        return false;
      }
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.customerEmail)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // Validate phone
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(formData.customerPhone.replace(/\s/g, ''))) {
      toast.error('Please enter a valid phone number');
      return false;
    }

    // Validate passenger count
    if (formData.passengerCount < 1 || formData.passengerCount > 50) {
      toast.error('Passenger count must be between 1 and 50');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Get service and business details
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .select('*, businesses!inner(*)')
        .eq('id', serviceId)
        .single();

      if (serviceError || !service) {
        throw new Error('Service not found');
      }

      // Create or find client
      let clientId: string;
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('business_id', businessId)
        .eq('email', formData.customerEmail)
        .single();

      if (existingClient) {
        clientId = existingClient.id;
      } else {
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            business_id: businessId,
            name: formData.customerName,
            email: formData.customerEmail,
            phone: formData.customerPhone
          })
          .select('id')
          .single();

        if (clientError || !newClient) {
          throw new Error('Failed to create client record');
        }
        clientId = newClient.id;
      }

      // Create transport booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          business_id: businessId,
          client_id: clientId,
          service_id: serviceId,
          booking_date: formData.travelDate,
          booking_time: formData.travelTime,
          duration_minutes: service.duration_minutes,
          total_amount: service.price,
          status: 'confirmed',
          customer_name: formData.customerName,
          customer_email: formData.customerEmail,
          customer_phone: formData.customerPhone,
          notes: JSON.stringify({
            pickupLocation: formData.pickupLocation,
            dropoffLocation: formData.dropoffLocation,
            passengerCount: formData.passengerCount,
            specialRequests: formData.specialRequests,
            paymentMethod: formData.paymentMethod,
            bookingType: 'transport'
          })
        })
        .select()
        .single();

      if (bookingError || !booking) {
        throw new Error('Failed to create booking');
      }

      // Send booking confirmation with calendar integration
      try {
        await sendBookingReminder({
          clientName: formData.customerName,
          clientEmail: formData.customerEmail,
          businessName: service.businesses.name,
          serviceName: `${service.name} - Transport`,
          bookingDate: formData.travelDate,
          bookingTime: formData.travelTime,
          businessAddress: `From: ${formData.pickupLocation} To: ${formData.dropoffLocation}`,
          businessPhone: service.businesses.phone
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the booking if email fails
      }

      toast.success('Transport booking confirmed! Check your email for details and calendar invitation.');
      
      // Reset form
      setFormData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        pickupLocation: '',
        dropoffLocation: '',
        travelDate: '',
        travelTime: '',
        passengerCount: 1,
        specialRequests: '',
        paymentMethod: 'cash'
      });

      if (onBookingComplete) {
        onBookingComplete(booking.id);
      }

    } catch (error: any) {
      console.error('Booking error:', error);
      toast.error(error.message || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Transport Booking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Full Name</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="customerPhone">Phone Number</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                  placeholder="+1234567890"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="customerEmail">Email Address</Label>
              <Input
                id="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                placeholder="your.email@example.com"
                required
              />
            </div>
          </div>

          {/* Travel Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Travel Details</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="pickupLocation">Pickup Location</Label>
                <Input
                  id="pickupLocation"
                  value={formData.pickupLocation}
                  onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                  placeholder="Enter pickup address"
                  required
                />
              </div>
              <div>
                <Label htmlFor="dropoffLocation">Drop-off Location</Label>
                <Input
                  id="dropoffLocation"
                  value={formData.dropoffLocation}
                  onChange={(e) => handleInputChange('dropoffLocation', e.target.value)}
                  placeholder="Enter destination address"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="travelDate">Travel Date</Label>
                <Input
                  id="travelDate"
                  type="date"
                  value={formData.travelDate}
                  onChange={(e) => handleInputChange('travelDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <Label htmlFor="travelTime">Travel Time</Label>
                <Input
                  id="travelTime"
                  type="time"
                  value={formData.travelTime}
                  onChange={(e) => handleInputChange('travelTime', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="passengerCount">Passengers</Label>
                <Input
                  id="passengerCount"
                  type="number"
                  min="1"
                  max="50"
                  value={formData.passengerCount}
                  onChange={(e) => handleInputChange('passengerCount', parseInt(e.target.value) || 1)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Payment & Additional Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Payment & Additional Information</h3>
            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) => handleInputChange('paymentMethod', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
              <Textarea
                id="specialRequests"
                value={formData.specialRequests}
                onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                placeholder="Any special requirements, accessibility needs, or additional notes..."
                rows={3}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Processing Booking...' : 'Confirm Transport Booking'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
