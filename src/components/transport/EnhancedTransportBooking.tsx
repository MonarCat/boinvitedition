import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Clock, Car, User } from 'lucide-react';
import { ShuttleSeatMap } from './ShuttleSeatMap';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TransportDetails {
  route: { from: string; to: string };
  passengers: { adult: number; child: number; infant: number };
  luggage: number;
  departure_time: string;
  expected_arrival: string;
  vehicle: {
    registration_number: string;
    body_type: string;
    driver_name: string;
    driver_phone: string;
  };
  seat_layout?: string;
  price_range?: { min: number; max: number };
  exact_price?: number;
}

interface EnhancedTransportBookingProps {
  serviceId: string;
  businessId: string;
  serviceName: string;
  servicePrice: number;
  transportDetails: TransportDetails;
  isShuttle?: boolean;
  onBookingComplete: (bookingId: string) => void;
}

export const EnhancedTransportBooking: React.FC<EnhancedTransportBookingProps> = ({
  serviceId,
  businessId,
  serviceName,
  servicePrice,
  transportDetails,
  isShuttle = false,
  onBookingComplete
}) => {
  const [bookingData, setBookingData] = useState({
    passengers: {
      adult: 1,
      child: 0,
      infant: 0
    },
    luggage: 1,
    selectedSeats: [] as number[],
    customerInfo: {
      name: '',
      phone: '',
      email: ''
    }
  });

  const [currentStep, setCurrentStep] = useState<'details' | 'seats' | 'confirmation'>('details');

  const handlePassengerChange = (type: 'adult' | 'child' | 'infant', value: number) => {
    setBookingData(prev => ({
      ...prev,
      passengers: {
        ...prev.passengers,
        [type]: Math.max(0, value)
      }
    }));
  };

  const handleSeatSelection = (seats: number[]) => {
    setBookingData(prev => ({
      ...prev,
      selectedSeats: seats
    }));
  };

  const getTotalPassengers = () => {
    return bookingData.passengers.adult + bookingData.passengers.child + bookingData.passengers.infant;
  };

  const calculateTotalPrice = () => {
    const basePrice = servicePrice;
    const totalPassengers = getTotalPassengers();
    const serviceClass = transportDetails?.vehicle?.body_type || '';
    const isTaxi = serviceClass.toLowerCase().includes('taxi') || 
                  ['standard', 'premium', 'executive', 'xl', 'eco-friendly', 'luxury', 'minivan'].includes(serviceClass.toLowerCase());
    
    // For shuttle and bus services, multiply by passengers
    if (!isTaxi) {
      return basePrice * totalPassengers;
    }
    
    // For taxi services, we have a base price and add surcharges
    const luggageCharge = bookingData.luggage > 1 ? (bookingData.luggage - 1) * 100 : 0;
    
    // Define max capacity for different service classes
    const maxCapacity: Record<string, number> = {
      'standard': 4,
      'premium': 4,
      'executive': 4,
      'xl': 6,
      'eco-friendly': 4,
      'luxury': 4,
      'minivan': 7
    };
    
    const defaultMaxCapacity = 4;
    const capacity = maxCapacity[serviceClass.toLowerCase()] || defaultMaxCapacity;
    
    // Add passenger surcharge based on service class
    let passengerSurcharge = 0;
    if (totalPassengers > capacity) {
      passengerSurcharge = (totalPassengers - capacity) * 200;
    }
    
    return basePrice + passengerSurcharge + luggageCharge;
  };

  const handleProceedToSeats = () => {
    if (isShuttle) {
      setCurrentStep('seats');
    } else {
      setCurrentStep('confirmation');
    }
  };

  // Determine if this is a taxi service - replaces the isShuttle prop
  const isTaxiService = transportDetails?.vehicle?.body_type?.toLowerCase().includes('taxi') || 
                       ['standard', 'premium', 'executive', 'xl', 'eco-friendly', 'luxury', 'minivan'].includes(
                         (transportDetails?.vehicle?.body_type || '').toLowerCase()
                       );
  
  const handleBookingSubmit = async () => {
    try {
      const totalPrice = calculateTotalPrice();
      
      // Get current date/time information
      const departureDateTime = new Date();
      const departureDate = departureDateTime.toISOString().split('T')[0];
      const departureTime = transportDetails.departure_time || 
                           (departureDateTime.getHours() + ':' + 
                            departureDateTime.getMinutes().toString().padStart(2, '0'));
      
      // Prepare booking details
      const bookingDetails = {
        service_name: serviceName,
        service_type: isShuttle ? 'shuttle' : 'transport',
        from: transportDetails.route.from,
        to: transportDetails.route.to,
        passengers: bookingData.passengers,
        luggage: bookingData.luggage,
        departure_time: departureTime,
        expected_arrival: transportDetails.expected_arrival,
        vehicle: transportDetails.vehicle,
        selectedSeats: isShuttle ? bookingData.selectedSeats : []
      };

      // Try to find or create client first
      let clientId = null;
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('business_id', businessId)
        .eq('phone', bookingData.customerInfo.phone)
        .maybeSingle();

      if (existingClient) {
        clientId = existingClient.id;
      } else {
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            business_id: businessId,
            name: bookingData.customerInfo.name,
            email: bookingData.customerInfo.email || null,
            phone: bookingData.customerInfo.phone
          })
          .select('id')
          .single();

        if (clientError) {
          console.error('Failed to create client record:', clientError);
          toast.error('Error creating customer record');
          return;
        }
        
        clientId = newClient.id;
      }

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          business_id: businessId,
          client_id: clientId,
          service_id: serviceId,
          booking_date: departureDate,
          booking_time: departureTime,
          duration_minutes: 60, // Default duration 
          total_amount: totalPrice,
          status: 'confirmed',
          payment_status: 'pending',
          customer_name: bookingData.customerInfo.name,
          customer_email: bookingData.customerInfo.email || null,
          customer_phone: bookingData.customerInfo.phone,
          notes: JSON.stringify(bookingDetails)
        })
        .select('id')
        .single();

      if (bookingError) {
        throw bookingError;
      }
      
      toast.success(`${isShuttle ? 'Shuttle' : 'Transport'} booking confirmed!`);
      onBookingComplete(booking.id);
      
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create booking. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Service Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            {serviceName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>{transportDetails.route.from} → {transportDetails.route.to}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-600" />
              <span>{transportDetails.departure_time} - {transportDetails.expected_arrival}</span>
            </div>
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-gray-600" />
              <span>{transportDetails.vehicle.registration_number} ({transportDetails.vehicle.body_type})</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-purple-600" />
              <span>{transportDetails.vehicle.driver_name}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Navigation */}
      <div className="flex items-center justify-center space-x-4">
        <div className={`px-3 py-1 rounded-full text-sm ${currentStep === 'details' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}>
          1. Details
        </div>
        {isShuttle && (
          <div className={`px-3 py-1 rounded-full text-sm ${currentStep === 'seats' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}>
            2. Seats
          </div>
        )}
        <div className={`px-3 py-1 rounded-full text-sm ${currentStep === 'confirmation' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}>
          {isShuttle ? '3. Confirm' : '2. Confirm'}
        </div>
      </div>

      {/* Booking Details Step */}
      {currentStep === 'details' && (
        <Card>
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Passenger Selection */}
            <div>
              <Label className="text-base font-medium mb-3 block">Passengers</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="adult">Adults</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handlePassengerChange('adult', bookingData.passengers.adult - 1)}
                      disabled={bookingData.passengers.adult <= 1}
                    >
                      -
                    </Button>
                    <Input
                      id="adult"
                      type="number"
                      value={bookingData.passengers.adult}
                      onChange={(e) => handlePassengerChange('adult', parseInt(e.target.value) || 1)}
                      className="w-20 text-center"
                      min="1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handlePassengerChange('adult', bookingData.passengers.adult + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="child">Children</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handlePassengerChange('child', bookingData.passengers.child - 1)}
                      disabled={bookingData.passengers.child <= 0}
                    >
                      -
                    </Button>
                    <Input
                      id="child"
                      type="number"
                      value={bookingData.passengers.child}
                      onChange={(e) => handlePassengerChange('child', parseInt(e.target.value) || 0)}
                      className="w-20 text-center"
                      min="0"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handlePassengerChange('child', bookingData.passengers.child + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="infant">Infants</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handlePassengerChange('infant', bookingData.passengers.infant - 1)}
                      disabled={bookingData.passengers.infant <= 0}
                    >
                      -
                    </Button>
                    <Input
                      id="infant"
                      type="number"
                      value={bookingData.passengers.infant}
                      onChange={(e) => handlePassengerChange('infant', parseInt(e.target.value) || 0)}
                      className="w-20 text-center"
                      min="0"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handlePassengerChange('infant', bookingData.passengers.infant + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Luggage */}
            <div>
              <Label htmlFor="luggage" className="text-base font-medium">Luggage (pieces)</Label>
              <div className="flex items-center gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setBookingData(prev => ({ ...prev, luggage: Math.max(0, prev.luggage - 1) }))}
                  disabled={bookingData.luggage <= 0}
                >
                  -
                </Button>
                <Input
                  id="luggage"
                  type="number"
                  value={bookingData.luggage}
                  onChange={(e) => setBookingData(prev => ({ ...prev, luggage: parseInt(e.target.value) || 0 }))}
                  className="w-20 text-center"
                  min="0"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setBookingData(prev => ({ ...prev, luggage: prev.luggage + 1 }))}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Customer Information */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Contact Information</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={bookingData.customerInfo.name}
                    onChange={(e) => setBookingData(prev => ({
                      ...prev,
                      customerInfo: { ...prev.customerInfo, name: e.target.value }
                    }))}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={bookingData.customerInfo.phone}
                    onChange={(e) => setBookingData(prev => ({
                      ...prev,
                      customerInfo: { ...prev.customerInfo, phone: e.target.value }
                    }))}
                    placeholder="254712345678"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={bookingData.customerInfo.email}
                  onChange={(e) => setBookingData(prev => ({
                    ...prev,
                    customerInfo: { ...prev.customerInfo, email: e.target.value }
                  }))}
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div>
                <p className="text-sm text-gray-600">Total Passengers: {getTotalPassengers()}</p>
                <p className="text-lg font-semibold">Total: KSh {calculateTotalPrice().toLocaleString()}</p>
              </div>
              <Button 
                onClick={handleProceedToSeats} 
                size="lg"
                variant={isShuttle ? "blueGlossy" : "redGlossy"}>
                {isShuttle ? 'Select Seats' : 'Confirm Booking'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seat Selection Step */}
      {currentStep === 'seats' && isShuttle && (
        <Card>
          <CardHeader>
            <CardTitle>Select Your Seats</CardTitle>
            <p className="text-sm text-gray-600">
              Choose {getTotalPassengers()} seat{getTotalPassengers() > 1 ? 's' : ''} for your journey
            </p>
          </CardHeader>
          <CardContent>
            <ShuttleSeatMap
              vehicleType={transportDetails.seat_layout?.includes('14') ? '14-seater' : 
                          transportDetails.seat_layout?.includes('17') ? '17-seater' : 
                          transportDetails.seat_layout?.includes('24') ? '24-seater' : '14-seater'}
              selectedSeats={bookingData.selectedSeats}
              occupiedSeats={[]}
              onSeatChange={handleSeatSelection}
              maxSeats={getTotalPassengers()}
            />
            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('details')}
              >
                Back to Details
              </Button>
              <Button
                onClick={() => setCurrentStep('confirmation')}
                disabled={bookingData.selectedSeats.length !== getTotalPassengers()}
                size="lg"
              >
                Confirm Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Step */}
      {currentStep === 'confirmation' && (
        <Card>
          <CardHeader>
            <CardTitle>Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Route:</span>
                <p>{transportDetails.route.from} → {transportDetails.route.to}</p>
              </div>
              <div>
                <span className="font-medium">Departure:</span>
                <p>{transportDetails.departure_time}</p>
              </div>
              <div>
                <span className="font-medium">Passengers:</span>
                <p>
                  {bookingData.passengers.adult} Adult{bookingData.passengers.adult > 1 ? 's' : ''}
                  {bookingData.passengers.child > 0 && `, ${bookingData.passengers.child} Child${bookingData.passengers.child > 1 ? 'ren' : ''}`}
                  {bookingData.passengers.infant > 0 && `, ${bookingData.passengers.infant} Infant${bookingData.passengers.infant > 1 ? 's' : ''}`}
                </p>
              </div>
              <div>
                <span className="font-medium">Luggage:</span>
                <p>{bookingData.luggage} piece{bookingData.luggage > 1 ? 's' : ''}</p>
              </div>
              {isShuttle && bookingData.selectedSeats.length > 0 && (
                <div className="md:col-span-2">
                  <span className="font-medium">Selected Seats:</span>
                  <div className="flex gap-2 mt-1">
                    {bookingData.selectedSeats.map(seat => (
                      <Badge key={seat} variant="secondary">{seat}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total Amount:</span>
                <span>KSh {calculateTotalPrice().toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(isShuttle ? 'seats' : 'details')}
              >
                Back
              </Button>
              <Button onClick={handleBookingSubmit} size="lg" className="bg-green-600 hover:bg-green-700">
                Confirm & Pay
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
