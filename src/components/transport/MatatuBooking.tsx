
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Users, Clock, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Route {
  id: string;
  origin: string;
  destination: string;
  price: number;
  duration: string;
  departure_time: string;
}

interface TransportDetails {
  routes?: Route[];
  vehicle_info?: {
    sacco_name?: string;
    plate_number?: string;
    seat_count?: number;
    driver_phone?: string;
  };
}

interface MatatuBookingProps {
  serviceId: string;
  businessId: string;
  vehicle: {
    id: string;
    sacco_name: string;
    plate_number: string;
    seat_count: number;
    driver_phone: string;
  };
  onBookingComplete: (bookingId: string) => void;
}

export const MatatuBooking: React.FC<MatatuBookingProps> = ({
  serviceId,
  businessId,
  vehicle,
  onBookingComplete
}) => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [occupiedSeats, setOccupiedSeats] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const seats = Array.from({ length: vehicle.seat_count || 14 }, (_, i) => i + 1);

  useEffect(() => {
    fetchRoutes();
    if (selectedRoute) {
      fetchOccupiedSeats();
    }
  }, [serviceId, selectedRoute]);

  const fetchRoutes = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('transport_details')
        .eq('id', serviceId)
        .single();

      if (error) throw error;

      if (data?.transport_details) {
        const transportDetails = data.transport_details as TransportDetails;
        if (transportDetails.routes) {
          setRoutes(transportDetails.routes);
        }
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
      toast.error('Failed to load routes');
    }
  };

  const fetchOccupiedSeats = async () => {
    if (!selectedRoute) return;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('customer_name')
        .eq('service_id', serviceId)
        .eq('booking_date', new Date().toISOString().split('T')[0])
        .eq('status', 'confirmed');

      if (error) throw error;

      // Extract seat numbers from customer names (assuming format includes seat info)
      const occupied = data
        ?.map(booking => {
          const match = booking.customer_name?.match(/Seat (\d+)/);
          return match ? parseInt(match[1]) : null;
        })
        .filter(Boolean) || [];

      setOccupiedSeats(occupied);
    } catch (error) {
      console.error('Error fetching occupied seats:', error);
    }
  };

  const handleBooking = async () => {
    if (!selectedRoute || !selectedSeat || !customerInfo.name || !customerInfo.phone) {
      toast.error('Please fill in all required information');
      return;
    }

    setIsLoading(true);

    try {
      // First, create or get a client record
      let clientId = '';
      
      const { data: existingClient, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('business_id', businessId)
        .eq('email', customerInfo.email || customerInfo.phone)
        .maybeSingle();

      if (existingClient) {
        clientId = existingClient.id;
      } else {
        const { data: newClient, error: newClientError } = await supabase
          .from('clients')
          .insert({
            business_id: businessId,
            name: customerInfo.name,
            phone: customerInfo.phone,
            email: customerInfo.email || customerInfo.phone + '@placeholder.com'
          })
          .select()
          .single();

        if (newClientError) throw newClientError;
        clientId = newClient.id;
      }

      const bookingData = {
        service_id: serviceId,
        business_id: businessId,
        client_id: clientId,
        booking_date: new Date().toISOString().split('T')[0],
        booking_time: selectedRoute.departure_time,
        duration_minutes: parseInt(selectedRoute.duration.split(' ')[0]) * 60,
        total_amount: selectedRoute.price,
        customer_name: `${customerInfo.name} - Seat ${selectedSeat}`,
        customer_phone: customerInfo.phone,
        customer_email: customerInfo.email,
        notes: `Route: ${selectedRoute.origin} → ${selectedRoute.destination}, Seat: ${selectedSeat}`,
        status: 'pending_payment'
      };

      const { data: booking, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();

      if (error) throw error;

      toast.success('Booking created! Proceed to payment.');
      onBookingComplete(booking.id);

    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSeatMap = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Occupied</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
          {seats.map(seat => {
            const isOccupied = occupiedSeats.includes(seat);
            const isSelected = selectedSeat === seat;
            
            return (
              <button
                key={seat}
                onClick={() => !isOccupied && setSelectedSeat(seat)}
                disabled={isOccupied}
                className={`
                  p-3 rounded-lg border-2 font-semibold transition-colors
                  ${isOccupied 
                    ? 'bg-red-500 text-white cursor-not-allowed' 
                    : isSelected 
                      ? 'bg-blue-500 text-white border-blue-600' 
                      : 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'
                  }
                `}
              >
                {seat}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Vehicle Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {vehicle.sacco_name} - {vehicle.plate_number}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Capacity: {vehicle.seat_count} passengers
          </p>
        </CardContent>
      </Card>

      {/* Route Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Select Route
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select onValueChange={(value) => {
            const route = routes.find(r => r.id === value);
            setSelectedRoute(route || null);
            setSelectedSeat(null);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Choose your route" />
            </SelectTrigger>
            <SelectContent>
              {routes.map(route => (
                <SelectItem key={route.id} value={route.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{route.origin} → {route.destination}</span>
                    <Badge variant="secondary">KSh {route.price.toLocaleString()}</Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedRoute && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm">{selectedRoute.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <span className="text-sm">KSh {selectedRoute.price.toLocaleString()}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seat Selection */}
      {selectedRoute && (
        <Card>
          <CardHeader>
            <CardTitle>Choose Your Seat</CardTitle>
          </CardHeader>
          <CardContent>
            {renderSeatMap()}
          </CardContent>
        </Card>
      )}

      {/* Customer Information */}
      {selectedRoute && selectedSeat && (
        <Card>
          <CardHeader>
            <CardTitle>Passenger Information</CardTitle>
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
          </CardContent>
        </Card>
      )}

      {/* Booking Summary */}
      {selectedRoute && selectedSeat && customerInfo.name && customerInfo.phone && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Route:</span>
              <span className="font-semibold">{selectedRoute.origin} → {selectedRoute.destination}</span>
            </div>
            <div className="flex justify-between">
              <span>Seat:</span>
              <span className="font-semibold">{selectedSeat}</span>
            </div>
            <div className="flex justify-between">
              <span>Passenger:</span>
              <span className="font-semibold">{customerInfo.name}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-green-800">
              <span>Total:</span>
              <span>KSh {selectedRoute.price.toLocaleString()}</span>
            </div>

            <Button
              onClick={handleBooking}
              disabled={isLoading}
              className="w-full mt-4 bg-green-600 hover:bg-green-700"
              size="lg"
            >
              {isLoading ? 'Creating Booking...' : 'Book & Proceed to Payment'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
