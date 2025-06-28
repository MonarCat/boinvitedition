
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Clock, Car, User } from 'lucide-react';
import { SeatSelector } from './SeatSelector';

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
    return basePrice * totalPassengers;
  };

  const handleProceedToSeats = () => {
    if (isShuttle) {
      setCurrentStep('seats');
    } else {
      setCurrentStep('confirmation');
    }
  };

  const handleBookingSubmit = async () => {
    try {
      // Implementation for creating booking
      console.log('Creating transport booking:', {
        serviceId,
        businessId,
        bookingData,
        transportDetails
      });
      
      // Simulate booking creation
      const bookingId = 'booking_' + Date.now();
      onBookingComplete(bookingId);
    } catch (error) {
      console.error('Booking error:', error);
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
              <Button onClick={handleProceedToSeats} size="lg">
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
            <SeatSelector
              layout={transportDetails.seat_layout || '14-seater'}
              requiredSeats={getTotalPassengers()}
              onSeatSelection={handleSeatSelection}
              selectedSeats={bookingData.selectedSeats}
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
