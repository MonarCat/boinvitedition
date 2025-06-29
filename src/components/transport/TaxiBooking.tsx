import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Users, Clock, Car, Luggage, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface TaxiBookingProps {
  serviceId: string;
  businessId: string;
  serviceName: string;
  servicePrice: number;
  transportDetails: any;
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
          ...(prev[parent as keyof typeof prev] as object),
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
    // This would typically depend on distance between locations, time of day, etc.
    // For now, using a simplified calculation based on passengers and base price
    const basePrice = servicePrice || transportDetails.exact_price || 500;
    const totalPassengers = formData.passengers.adult + formData.passengers.child;
    const luggageCharge = formData.luggage > 1 ? (formData.luggage - 1) * 100 : 0;
    
    const estimate = basePrice + (totalPassengers > 1 ? (totalPassengers - 1) * 200 : 0) + luggageCharge;
    setPriceEstimate(estimate);
  };

  const handleBookingSubmit = async () => {
    if (!formData.from || !formData.to || !formData.dateTime || !formData.customerInfo.name || !formData.customerInfo.phone) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsLoading(true);
    
    try {
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
        client_id: null, // For guest bookings
        customer_name: formData.customerInfo.name,
        customer_email: formData.customerInfo.email || null,
        customer_phone: formData.customerInfo.phone,
        booking_date: departureTime.toISOString().split('T')[0],
        booking_time: departureTime.toISOString().split('T')[1].substring(0, 5),
        status: 'confirmed',
        payment_status: 'pending',
        total_amount: priceEstimate || servicePrice,
        duration_minutes: 60, // Default duration for transport services
        booking_details: {
          service_name: serviceName,
          service_type: 'taxi',
          from: formData.from,
          to: formData.to,
          passengers: {
            adult: formData.passengers.adult,
            child: formData.passengers.child,
            infant: formData.passengers.infant,
          },
          luggage: formData.luggage,
          departure_time: formData.dateTime,
          expected_arrival: arrivalTime.toISOString(),
          vehicle: vehicle
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
      toast.error("Failed to create booking. Please try again.");
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
                onChange={(e) => handleInputChange('from', e.target.value)} 
                placeholder="Pickup location"
              />
            </div>
            <div>
              <Label htmlFor="to">To</Label>
              <Input 
                id="to" 
                value={formData.to} 
                onChange={(e) => handleInputChange('to', e.target.value)} 
                placeholder="Destination"
              />
            </div>
          </div>
        </div>

        {/* Passenger Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-royal-red" />
            <h3 className="font-semibold text-lg">Passenger Information</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="adult-passengers">Adults</Label>
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handlePassengerChange('adult', formData.passengers.adult - 1)}
                  disabled={formData.passengers.adult <= 1}
                >-</Button>
                <span className="mx-3">{formData.passengers.adult}</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handlePassengerChange('adult', formData.passengers.adult + 1)}
                  disabled={formData.passengers.adult + formData.passengers.child >= 4}
                >+</Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="child-passengers">Children</Label>
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handlePassengerChange('child', formData.passengers.child - 1)}
                  disabled={formData.passengers.child <= 0}
                >-</Button>
                <span className="mx-3">{formData.passengers.child}</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handlePassengerChange('child', formData.passengers.child + 1)}
                  disabled={formData.passengers.adult + formData.passengers.child >= 4}
                >+</Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="infant-passengers">Infants</Label>
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handlePassengerChange('infant', formData.passengers.infant - 1)}
                  disabled={formData.passengers.infant <= 0}
                >-</Button>
                <span className="mx-3">{formData.passengers.infant}</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handlePassengerChange('infant', formData.passengers.infant + 1)}
                  disabled={formData.passengers.infant >= 2}
                >+</Button>
              </div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="luggage">Luggage</Label>
            <div className="flex items-center">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleInputChange('luggage', Math.max(0, Number(formData.luggage) - 1))}
                disabled={Number(formData.luggage) <= 0}
              >-</Button>
              <span className="mx-3">{formData.luggage}</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleInputChange('luggage', Number(formData.luggage) + 1)}
                disabled={Number(formData.luggage) >= 5}
              >+</Button>
              <Luggage className="ml-2 h-4 w-4 text-gray-500" />
            </div>
          </div>
        </div>
        
        {/* Date and Time */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-royal-red" />
            <h3 className="font-semibold text-lg">Date & Time</h3>
          </div>
          
          <div>
            <Label htmlFor="dateTime">Departure Time</Label>
            <Input 
              id="dateTime" 
              type="datetime-local" 
              value={formData.dateTime} 
              onChange={(e) => handleInputChange('dateTime', e.target.value)} 
            />
          </div>
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
          <h3 className="font-semibold text-lg">Your Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={formData.customerInfo.name} 
                onChange={(e) => handleInputChange('customerInfo.name', e.target.value)} 
                placeholder="Enter your name"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                value={formData.customerInfo.phone} 
                onChange={(e) => handleInputChange('customerInfo.phone', e.target.value)} 
                placeholder="Your contact number"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="email">Email (Optional)</Label>
            <Input 
              id="email" 
              type="email"
              value={formData.customerInfo.email} 
              onChange={(e) => handleInputChange('customerInfo.email', e.target.value)} 
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
            {isLoading ? 'Processing...' : 'Confirm Booking'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
