import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Clock, Truck, Car, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TransportDetails {
  route?: { from: string; to: string };
  passengers?: { adult: number; child: number; infant: number };
  luggage?: number;
  departure_time?: string;
  expected_arrival?: string;
  vehicle?: {
    registration_number: string;
    body_type: string;
    driver_name: string;
    driver_phone: string;
  };
  price_range?: { min: number; max: number };
  exact_price?: number;
}

interface TaxiBookingProps {
  serviceId: string;
  businessId: string;
  serviceName: string;
  servicePrice: number;
  transportDetails: TransportDetails;
  onBookingComplete: (bookingId: string) => void;
}

export const TaxiBooking: React.FC<TaxiBookingProps> = ({
  serviceId,
  businessId,
  serviceName,
  servicePrice,
  transportDetails,
  onBookingComplete
}) => {
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    passengers: {
      adult: 1,
      child: 0,
      infant: 0
    },
    luggage: 1,
    dateTime: '',
    specialRequests: '',
    customerInfo: {
      name: '',
      phone: '',
      email: ''
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [priceEstimate, setPriceEstimate] = useState<number | null>(null);

  const handleInputChange = (field: string, value: string | number) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, string | number | Record<string, string | number>>),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handlePassengerChange = (type: 'adult' | 'child' | 'infant', value: number) => {
    handleInputChange(`passengers.${type}`, Math.max(0, value));
    
    // Recalculate price estimate when passengers change
    calculateEstimate();
  };

  const calculateEstimate = () => {
    // Determine base price based on service class
    let basePrice = servicePrice || transportDetails.exact_price || 500;
    const serviceClass = transportDetails.vehicle?.body_type || 'Standard';
    
    // Adjust base price according to service class if not explicitly provided
    if (!servicePrice && !transportDetails.exact_price) {
      if (serviceClass === 'Premium') basePrice = 800;
      else if (serviceClass === 'Executive') basePrice = 1200;
      else if (serviceClass === 'XL') basePrice = 1000;
      else if (serviceClass === 'Eco-friendly') basePrice = 700;
      else if (serviceClass === 'Luxury') basePrice = 1500;
      else if (serviceClass === 'Minivan') basePrice = 1200;
    }
    
    const totalPassengers = formData.passengers.adult + formData.passengers.child;
    const luggageCharge = formData.luggage > 1 ? (formData.luggage - 1) * 100 : 0;
    
    // Add passenger surcharge based on service type
    let passengerSurcharge = 0;
    // Define max capacity for different service classes
    const maxCapacity: Record<string, number> = {
      'Standard': 4,
      'Premium': 4,
      'Executive': 4,
      'XL': 6,
      'Eco-friendly': 4,
      'Luxury': 4,
      'Minivan': 7
    };
    
    const defaultMaxCapacity = 4;
    const capacity = maxCapacity[serviceClass] || defaultMaxCapacity;
    
    if (totalPassengers > capacity) {
      passengerSurcharge = (totalPassengers - capacity) * 200;
    }
    
    const estimate = basePrice + passengerSurcharge + luggageCharge;
    setPriceEstimate(estimate);
    
    return estimate;
  };

  const validateForm = (): boolean => {
    // Validate from location
    if (!formData.from.trim()) {
      toast.error("Please enter a pickup location");
      return false;
    }

    // Validate to location
    if (!formData.to.trim()) {
      toast.error("Please enter a destination");
      return false;
    }

    // Validate date & time
    if (!formData.dateTime) {
      toast.error("Please select a date and time");
      return false;
    }

    const selectedTime = new Date(formData.dateTime);
    const now = new Date();
    
    if (selectedTime < now) {
      toast.error("Please select a future date and time");
      return false;
    }

    // Validate customer info
    if (!formData.customerInfo.name.trim()) {
      toast.error("Please enter your name");
      return false;
    }

    if (!formData.customerInfo.phone.trim()) {
      toast.error("Please enter a phone number");
      return false;
    }

    // Basic phone validation
    const phoneRegex = /^(?:\+\d{1,3})?[ -]?\d{9,15}$/;
    if (!phoneRegex.test(formData.customerInfo.phone.trim())) {
      toast.error("Please enter a valid phone number");
      return false;
    }

    // Email validation if provided
    if (formData.customerInfo.email && 
        !formData.customerInfo.email.includes('@')) {
      toast.error("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleBookingSubmit = async () => {
    if (!validateForm()) {
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
          .eq('phone', formData.customerInfo.phone)
          .maybeSingle();

        if (clientQueryError) throw clientQueryError;

        if (existingClient) {
          clientId = existingClient.id;
          
          // Update client info in case it changed
          await supabase
            .from('clients')
            .update({
              name: formData.customerInfo.name,
              email: formData.customerInfo.email || null
            })
            .eq('id', clientId);
        } else {
          // Try to create client
          const { data: newClient, error: clientCreateError } = await supabase
            .from('clients')
            .insert({
              business_id: businessId,
              name: formData.customerInfo.name,
              phone: formData.customerInfo.phone,
              email: formData.customerInfo.email || null
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
      
      // Get driver/vehicle details from the service
      const vehicle = transportDetails.vehicle || {
        registration_number: "KBX 123A",
        body_type: "Sedan",
        driver_name: "Default Driver",
        driver_phone: "0700000000"
      };
      
      // Calculate expected arrival (simplified estimation)
      const departureTime = new Date(formData.dateTime);
      const arrivalTime = new Date(departureTime.getTime() + 60 * 60 * 1000); // Add 1 hour
      
      const bookingData = {
        business_id: businessId,
        service_id: serviceId,
        client_id: clientId || null, // Support both logged in and guest bookings
        customer_name: formData.customerInfo.name,
        customer_email: formData.customerInfo.email || null,
        customer_phone: formData.customerInfo.phone,
        booking_date: departureTime.toISOString().split('T')[0],
        booking_time: departureTime.toISOString().split('T')[1].substring(0, 5),
        duration_minutes: 60, // Default duration for transport services
        status: 'confirmed',
        payment_status: 'pending',
        total_amount: priceEstimate || servicePrice,
        booking_details: {
          service_name: serviceName,
          service_type: 'taxi',
          from: formData.from,
          to: formData.to,
          departure_time: departureTime.toISOString(),
          expected_arrival: arrivalTime.toISOString(),
          special_requests: formData.specialRequests,
          vehicle: vehicle,
          bookingType: 'taxi'
        }
      };
      
      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select('id')
        .single();
        
      if (error) throw error;
      
      toast.success("Taxi booking confirmed!");
      onBookingComplete(data.id);
      
    } catch (error) {
      console.error("Booking error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create booking. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="card-enhanced shadow-lg">
      <CardHeader className="bg-gradient-to-r from-royal-blue/10 to-transparent">
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5 text-royal-blue" />
          {serviceName || "Taxi Booking"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        {/* Route Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-royal-red" />
            <h3 className="font-semibold text-lg">Route Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="from">From</Label>
              <Input 
                id="from" 
                value={formData.from}
                onChange={e => handleInputChange('from', e.target.value)}
                placeholder={transportDetails.route?.from || "Enter pickup location"}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="to">To</Label>
              <Input 
                id="to" 
                value={formData.to}
                onChange={e => handleInputChange('to', e.target.value)}
                placeholder={transportDetails.route?.to || "Enter destination"}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Date and Time */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-royal-green" />
            <h3 className="font-semibold text-lg">Date & Time</h3>
          </div>
          
          <div>
            <Label htmlFor="dateTime">Pickup Date & Time</Label>
            <Input 
              id="dateTime" 
              type="datetime-local" 
              value={formData.dateTime}
              onChange={e => handleInputChange('dateTime', e.target.value)}
              className="mt-1"
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
        </div>

        {/* Passengers & Luggage */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-royal-purple" />
            <h3 className="font-semibold text-lg">Passengers & Luggage</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Adults */}
            <div>
              <Label htmlFor="adults">Adults</Label>
              <div className="flex items-center gap-2 mt-1">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => handlePassengerChange('adult', formData.passengers.adult - 1)}
                  disabled={formData.passengers.adult <= 1}
                >-</Button>
                <div className="w-12 text-center">
                  {formData.passengers.adult}
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => handlePassengerChange('adult', formData.passengers.adult + 1)}
                >+</Button>
              </div>
            </div>
            
            {/* Children */}
            <div>
              <Label htmlFor="children">Children</Label>
              <div className="flex items-center gap-2 mt-1">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => handlePassengerChange('child', formData.passengers.child - 1)}
                  disabled={formData.passengers.child <= 0}
                >-</Button>
                <div className="w-12 text-center">
                  {formData.passengers.child}
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => handlePassengerChange('child', formData.passengers.child + 1)}
                >+</Button>
              </div>
            </div>
            
            {/* Infants */}
            <div>
              <Label htmlFor="infants">Infants</Label>
              <div className="flex items-center gap-2 mt-1">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => handlePassengerChange('infant', formData.passengers.infant - 1)}
                  disabled={formData.passengers.infant <= 0}
                >-</Button>
                <div className="w-12 text-center">
                  {formData.passengers.infant}
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => handlePassengerChange('infant', formData.passengers.infant + 1)}
                >+</Button>
              </div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="luggage">Luggage Items</Label>
            <div className="flex items-center gap-2 mt-1">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => {
                  handleInputChange('luggage', Math.max(0, formData.luggage - 1));
                  calculateEstimate();
                }}
                disabled={formData.luggage <= 0}
              >-</Button>
              <div className="w-12 text-center">
                {formData.luggage}
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => {
                  handleInputChange('luggage', formData.luggage + 1);
                  calculateEstimate();
                }}
              >+</Button>
            </div>
          </div>
        </div>
        
        {/* Special Requests */}
        <div className="space-y-4 border-t pt-4">
          <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
          <Input 
            id="specialRequests" 
            value={formData.specialRequests}
            onChange={e => handleInputChange('specialRequests', e.target.value)}
            placeholder="Any specific requirements or notes"
          />
        </div>

        {/* Vehicle Information */}
        {transportDetails.vehicle && (
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center gap-2">
              <Car className="h-5 w-5 text-royal-blue" />
              <h3 className="font-semibold text-lg">Vehicle Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Registration</Label>
                <p className="text-sm font-medium">{transportDetails.vehicle.registration_number}</p>
              </div>
              <div>
                <Label>Type</Label>
                <p className="text-sm font-medium">{transportDetails.vehicle.body_type}</p>
              </div>
              <div>
                <Label>Driver</Label>
                <p className="text-sm font-medium">{transportDetails.vehicle.driver_name}</p>
              </div>
            </div>
          </div>
        )}

        {/* Customer Information */}
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-royal-blue" />
            <h3 className="font-semibold text-lg">Customer Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerName">Full Name</Label>
              <Input 
                id="customerName" 
                value={formData.customerInfo.name}
                onChange={e => handleInputChange('customerInfo.name', e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <div>
              <Label htmlFor="customerPhone">Phone Number</Label>
              <Input 
                id="customerPhone" 
                value={formData.customerInfo.phone}
                onChange={e => handleInputChange('customerInfo.phone', e.target.value)}
                placeholder="e.g. +254712345678"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="customerEmail">Email (Optional)</Label>
            <Input 
              id="customerEmail" 
              type="email"
              value={formData.customerInfo.email}
              onChange={e => handleInputChange('customerInfo.email', e.target.value)}
              placeholder="For booking confirmation"
            />
          </div>
        </div>

        {/* Pricing and Confirmation */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-accent-green/10">
                {transportDetails.price_range ? 
                  `KSh ${transportDetails.price_range.min} - ${transportDetails.price_range.max}` : 
                  `From KSh ${servicePrice}`}
              </Badge>
              
              {priceEstimate && (
                <Badge className="bg-royal-blue text-white">
                  Estimated: KSh {priceEstimate}
                </Badge>
              )}
            </div>
            
            {transportDetails.exact_price && (
              <p className="text-lg font-semibold mt-2">
                Fixed Price: KSh {transportDetails.exact_price}
              </p>
            )}
          </div>
          
          <Button 
            onClick={handleBookingSubmit} 
            size="lg" 
            variant="redGlossy"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Confirm Booking"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
