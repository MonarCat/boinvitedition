import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Users, Clock, DollarSign, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface Route {
  id: string;
  origin: string;
  destination: string;
  price: number;
  duration: string;
  departure_time: string;
}

interface VehicleInfo {
  sacco_name?: string;
  plate_number?: string;
  seat_count?: number;
  driver_phone?: string;
}

interface TransportDetails {
  routes?: Route[];
  vehicle_info?: VehicleInfo;
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

  const fetchRoutes = useCallback(async () => {
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
  }, [serviceId]);

  const fetchOccupiedSeats = useCallback(async () => {
    if (!selectedRoute) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('bookings')
        .select('customer_name, notes')
        .eq('service_id', serviceId)
        .eq('booking_date', today)
        .eq('status', 'confirmed');

      if (error) throw error;

      // Extract seat numbers from customer names and notes
      const occupied: number[] = [];
      data?.forEach(booking => {
        // Try to extract from customer name
        const nameMatch = booking.customer_name?.match(/Seat (\d+)/);
        if (nameMatch) {
          occupied.push(parseInt(nameMatch[1]));
        }
        
        // Also try to extract from notes
        const notesMatch = booking.notes?.match(/Seat: (\d+)/);
        if (notesMatch) {
          occupied.push(parseInt(notesMatch[1]));
        }
      });
      
      setOccupiedSeats([...new Set(occupied)]); // Remove duplicates
    } catch (error) {
      console.error('Error fetching occupied seats:', error);
      toast.error('Could not check seat availability. Please try refreshing.');
    }
  }, [serviceId, selectedRoute]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  useEffect(() => {
    if (selectedRoute) {
      fetchOccupiedSeats();
    }
  }, [selectedRoute, fetchOccupiedSeats]);

  const validateInputs = useCallback((): boolean => {
    if (!selectedRoute) {
      toast.error('Please select a route');
      return false;
    }
    
    if (!selectedSeat) {
      toast.error('Please select a seat');
      return false;
    }
    
    if (!customerInfo.name.trim()) {
      toast.error('Please enter your name');
      return false;
    }
    
    if (!customerInfo.phone.trim()) {
      toast.error('Please enter your phone number');
      return false;
    }
    
    // Basic phone format validation
    const phoneRegex = /^(?:\+\d{1,3})?[ -]?\d{9,15}$/;
    if (!phoneRegex.test(customerInfo.phone.trim())) {
      toast.error('Please enter a valid phone number');
      return false;
    }
    
    // Email validation if provided
    if (customerInfo.email && !customerInfo.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    return true;
  }, [selectedRoute, selectedSeat, customerInfo]);

  const handleBooking = async () => {
    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);

    try {
      // Try to find or create client first
      let clientId = null;
      try {
        const { data: existingClient, error: clientQueryError } = await supabase
          .from('clients')
          .select('id')
          .eq('business_id', businessId)
          .eq('phone', customerInfo.phone)
          .maybeSingle();

        if (clientQueryError) throw clientQueryError;

        if (existingClient) {
          clientId = existingClient.id;
          
          // Update client info in case it changed
          await supabase
            .from('clients')
            .update({
              name: customerInfo.name,
              email: customerInfo.email || null
            })
            .eq('id', clientId);
        } else {
          // Try to create client
          const { data: newClient, error: clientCreateError } = await supabase
            .from('clients')
            .insert({
              business_id: businessId,
              name: customerInfo.name,
              phone: customerInfo.phone,
              email: customerInfo.email || null
            })
            .select()
            .single();

          if (clientCreateError) throw clientCreateError;
          
          clientId = newClient?.id;
        }
      } catch (clientError) {
        console.warn('Client creation failed, proceeding with booking:', clientError);
        // Continue with booking even if client creation fails
      }

      // Create booking with proper client_id handling and status
      const bookingData = {
        service_id: serviceId,
        business_id: businessId,
        client_id: clientId,  // This can be null if client creation failed
        booking_date: new Date().toISOString().split('T')[0],
        booking_time: selectedRoute.departure_time,
        duration_minutes: parseInt(selectedRoute.duration.split(' ')[0]) * 60 || 60,
        total_amount: selectedRoute.price,
        customer_name: `${customerInfo.name} - Seat ${selectedSeat}`,
        customer_phone: customerInfo.phone,
        customer_email: customerInfo.email || null,
        notes: JSON.stringify({
          route: `${selectedRoute.origin} → ${selectedRoute.destination}`,
          seat: selectedSeat,
          vehicle: `${vehicle.sacco_name} ${vehicle.plate_number}`,
          bookingType: 'matatu'
        }),
        status: 'confirmed',
        payment_status: 'pending'
      };

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select('id')
        .single();

      if (bookingError) throw bookingError;

      toast.success('Matatu booking confirmed! Proceed to payment.');
      onBookingComplete(booking.id);

    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create booking. Please try again.');
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
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <span>Occupied</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {seats.map(seat => {
            const isOccupied = occupiedSeats.includes(seat);
            const isSelected = selectedSeat === seat;
            
            return (
              <button
                key={seat}
                disabled={isOccupied}
                onClick={() => setSelectedSeat(seat)}
                className={`w-10 h-10 rounded flex items-center justify-center text-sm
                  ${isOccupied ? 'bg-gray-400 text-white cursor-not-allowed' : 
                    isSelected ? 'bg-blue-500 text-white' : 'bg-green-500 text-white hover:bg-green-600'}`}
              >
                {seat}
              </button>
            );
          })}
        </div>
        
        {selectedSeat && (
          <p className="text-sm text-green-700 font-medium">
            You've selected seat #{selectedSeat}
          </p>
        )}
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
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Select Your Seat
            </CardTitle>
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
            <CardTitle>Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="e.g. +254712345678"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email Address (optional)</Label>
              <Input
                id="email"
                type="email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your@email.com"
              />
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-gray-500">Total Amount:</p>
                  <p className="font-semibold text-lg">KSh {selectedRoute.price.toLocaleString()}</p>
                </div>
                <div>
                  <Badge variant="outline">Seat #{selectedSeat}</Badge>
                </div>
              </div>
              
              <Button 
                onClick={handleBooking} 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Confirm Booking'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
