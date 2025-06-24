
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, DollarSign, User, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  category?: string;
}

interface Stylist {
  id: string;
  name: string;
  specialties?: string[];
}

interface SalonBookingProps {
  serviceId: string;
  businessId: string;
  services: Service[];
  onBookingComplete: (bookingId: string) => void;
}

export const SalonBooking: React.FC<SalonBookingProps> = ({
  serviceId,
  businessId,
  services,
  onBookingComplete
}) => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStylist, setSelectedStylist] = useState<Stylist | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setSelectedService(service);
      fetchStylists();
    }
  }, [serviceId, services]);

  const fetchStylists = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('id, name, specialties')
        .eq('business_id', businessId)
        .eq('is_active', true);

      if (error) throw error;
      setStylists(data || []);
    } catch (error) {
      console.error('Error fetching stylists:', error);
    }
  };

  const calculateDeposit = () => {
    return selectedService ? Math.ceil(selectedService.price * 0.5) : 0;
  };

  const sendWhatsAppConfirmation = (bookingDetails: any) => {
    const whatsappNumber = '254769829304';
    const message = `📅 *Booking Confirmed*\n\n` +
      `Service: ${bookingDetails.serviceName} (KSh ${bookingDetails.price})\n` +
      `Duration: ${bookingDetails.duration} mins\n` +
      `Time: ${new Date(bookingDetails.time).toLocaleString()}\n` +
      `Deposit Required: KSh ${bookingDetails.deposit}\n\n` +
      `Thank you for choosing our salon!`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleBooking = async () => {
    if (!selectedService || !selectedTime || !customerInfo.name || !customerInfo.phone) {
      toast.error('Please fill in all required information');
      return;
    }

    setIsLoading(true);

    try {
      // Try to find or create client
      let clientId = null;
      try {
        const { data: existingClient } = await supabase
          .from('clients')
          .select('id')
          .eq('business_id', businessId)
          .eq('phone', customerInfo.phone)
          .maybeSingle();

        if (existingClient) {
          clientId = existingClient.id;
        } else {
          const { data: newClient } = await supabase
            .from('clients')
            .insert({
              business_id: businessId,
              name: customerInfo.name,
              phone: customerInfo.phone,
              email: customerInfo.email || `${customerInfo.phone}@salon.booking`
            })
            .select()
            .maybeSingle();

          if (newClient) {
            clientId = newClient.id;
          }
        }
      } catch (clientError) {
        console.warn('Client creation failed, proceeding with booking:', clientError);
      }

      const bookingDateTime = new Date(selectedTime);
      const bookingData = {
        service_id: selectedService.id,
        business_id: businessId,
        client_id: clientId || '00000000-0000-0000-0000-000000000000',
        staff_id: selectedStylist?.id || null,
        booking_date: bookingDateTime.toISOString().split('T')[0],
        booking_time: bookingDateTime.toTimeString().split(' ')[0],
        duration_minutes: selectedService.duration_minutes,
        total_amount: selectedService.price,
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        customer_email: customerInfo.email || `${customerInfo.phone}@salon.booking`,
        notes: `Salon booking - Deposit required: KSh ${calculateDeposit()}`,
        status: 'pending_payment',
        payment_status: 'pending'
      };

      const { data: booking, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();

      if (error) throw error;

      // Send WhatsApp confirmation
      sendWhatsAppConfirmation({
        serviceName: selectedService.name,
        price: selectedService.price,
        duration: selectedService.duration_minutes,
        time: selectedTime,
        deposit: calculateDeposit()
      });

      toast.success('Booking created! Please pay the deposit to confirm.');
      onBookingComplete(booking.id);

    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedService) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Service not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Service Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            {selectedService.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm">{selectedService.duration_minutes} mins</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <span className="text-sm">KSh {selectedService.price.toLocaleString()}</span>
            </div>
          </div>
          {selectedService.description && (
            <p className="text-sm text-gray-600 mt-2">{selectedService.description}</p>
          )}
        </CardContent>
      </Card>

      {/* Stylist Selection */}
      {stylists.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Preferred Stylist (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stylists.map(stylist => (
                <Button
                  key={stylist.id}
                  variant={selectedStylist?.id === stylist.id ? "default" : "outline"}
                  onClick={() => setSelectedStylist(stylist)}
                  className="rounded-full"
                >
                  {stylist.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booking Form */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name *</label>
            <input
              type="text"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone Number *</label>
            <input
              type="tel"
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="254712345678"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email (Optional)</label>
            <input
              type="email"
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Booking Time *</label>
            <input
              type="datetime-local"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Deposit Information */}
      {selectedTime && customerInfo.name && customerInfo.phone && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Deposit Required</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-lg font-bold text-yellow-800">
                <span>Deposit Amount:</span>
                <span>KSh {calculateDeposit().toLocaleString()}</span>
              </div>
              <p className="text-sm text-yellow-700">
                50% deposit required to secure your booking (applied to final payment)
              </p>
            </div>

            <Button
              onClick={handleBooking}
              disabled={isLoading}
              className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
              size="lg"
            >
              <div className="flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" />
                {isLoading ? 'Creating Booking...' : 'Pay Deposit & Confirm via WhatsApp'}
              </div>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
