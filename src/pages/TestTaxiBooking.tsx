
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Clock, User, Briefcase } from 'lucide-react';
import { ServiceTypeSection } from '@/components/transport/ServiceTypeSection';
import { RouteSection } from '@/components/transport/RouteSection';
import { PassengerSection } from '@/components/transport/PassengerSection';
import { TimeSection } from '@/components/transport/TimeSection';
import { PricingSection } from '@/components/transport/PricingSection';

// Updated Service Categories
const TAXI_SERVICE_CATEGORIES = [
  { value: 'standard', label: 'Standard', description: 'Affordable everyday rides for up to 4 people' },
  { value: 'premium', label: 'Premium', description: 'Higher-end vehicles with professional drivers' },
  { value: 'executive', label: 'Executive', description: 'Luxury vehicles for business or special occasions' },
  { value: 'xl', label: 'XL', description: 'Larger vehicles that can accommodate up to 6 passengers' },
  { value: 'eco-friendly', label: 'Eco-friendly', description: 'Electric or hybrid vehicles for reduced carbon footprint' }
];

const SHUTTLE_SERVICE_CATEGORIES = [
  { value: '14-seater', label: '14-Seater', description: 'Standard matatu for urban routes' },
  { value: '17-seater', label: '17-Seater', description: 'Extended matatu for longer routes' },
  { value: '24-seater', label: '24-Seater', description: 'Mini-shuttle for intercity travel' },
  { value: '33-seater', label: '33-Seater', description: 'Medium-sized shuttle for highways' }
];

const BUS_SERVICE_CATEGORIES = [
  { value: 'economy', label: 'Economy', description: 'Standard bus service with basic amenities' },
  { value: 'vip', label: 'VIP', description: 'Premium service with extra comfort and amenities' },
  { value: 'premium', label: 'Premium', description: 'Luxury coach with enhanced features' },
  { value: 'sleeper', label: 'Sleeper', description: 'Overnight service with reclining seats or beds' }
];

// Updated Vehicle Classes
const SERVICE_CLASSES = {
  taxi: ['Standard', 'Premium', 'Executive', 'XL', 'Eco-friendly'],
  shuttle: ['14-Seater', '17-Seater', '24-Seater', '33-Seater'],
  bus: ['Economy', 'VIP', 'Premium', 'Sleeper'],
  flight: ['Economy', 'Business', 'First Class'],
  train: ['Economy', 'Business', 'First Class']
};

const TestTaxiBooking: React.FC = () => {
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      service_type: 'taxi',
      service_class: 'Standard',
      from: '',
      to: '',
      departure_date: '',
      departure_time: '',
      adult_passengers: 1,
      child_passengers: 0,
      luggage_count: 1,
      special_requests: ''
    }
  });

  const [priceEstimate, setPriceEstimate] = useState<number | null>(null);

  const onSubmit = (data: any) => {
    console.log('Booking data:', data);
    // Here you would typically send this data to your backend
    alert('Booking submitted successfully!');
  };

  const calculateEstimate = () => {
    // Basic calculation logic based on service type and class
    const serviceType = watch('service_type');
    const serviceClass = watch('service_class');
    const adultPassengers = watch('adult_passengers');
    const childPassengers = watch('child_passengers');
    const luggageCount = watch('luggage_count');

    let basePrice = 0;
    
    // Base price determination by service type and class
    if (serviceType === 'taxi') {
      if (serviceClass === 'Standard') basePrice = 500;
      else if (serviceClass === 'Premium') basePrice = 800;
      else if (serviceClass === 'Executive') basePrice = 1200;
      else if (serviceClass === 'XL') basePrice = 1000;
      else if (serviceClass === 'Eco-friendly') basePrice = 700;
    }
    else if (serviceType === 'shuttle') {
      basePrice = 200; // Per seat
    }
    else if (serviceType === 'bus') {
      if (serviceClass === 'Economy') basePrice = 150; // Per seat
      else if (serviceClass === 'VIP') basePrice = 300; // Per seat
      else if (serviceClass === 'Premium') basePrice = 500; // Per seat
      else if (serviceClass === 'Sleeper') basePrice = 800; // Per seat
    }

    // Additional calculations based on passengers and luggage - convert to numbers
    const totalPassengers = parseInt(adultPassengers.toString()) + parseInt(childPassengers.toString()) * 0.5;
    const luggageCharge = luggageCount > 1 ? (luggageCount - 1) * 100 : 0;
    
    let estimate = 0;
    
    if (serviceType === 'taxi') {
      // Taxis charge by trip, not per passenger
      estimate = basePrice + (totalPassengers > 4 ? (totalPassengers - 4) * 200 : 0) + luggageCharge;
    } else {
      // Shuttles and buses charge per seat
      estimate = basePrice * totalPassengers + luggageCharge;
    }
    
    setPriceEstimate(estimate);
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Transport Booking</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <ServiceTypeSection setValue={setValue} watch={watch} />
            
            <RouteSection register={register} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="departure_date">Departure Date</Label>
                <div className="relative">
                  <Input
                    id="departure_date"
                    type="date"
                    {...register('departure_date', { required: true })}
                    className="pl-10"
                  />
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="departure_time">Departure Time</Label>
                <div className="relative">
                  <Input
                    id="departure_time"
                    type="time"
                    {...register('departure_time', { required: true })}
                    className="pl-10"
                  />
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
            
            <PassengerSection register={register} watch={watch} />
            
            <div>
              <Label htmlFor="luggage_count">Luggage Items</Label>
              <div className="relative">
                <Input
                  id="luggage_count"
                  type="number"
                  min="0"
                  {...register('luggage_count', { min: 0 })}
                  className="pl-10"
                />
                <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="special_requests">Special Requests</Label>
              <Input
                id="special_requests"
                {...register('special_requests')}
                placeholder="Any specific requirements?"
              />
            </div>
            
            <div className="flex justify-between items-center">
              <Button type="button" onClick={calculateEstimate} variant="outline">
                Calculate Estimate
              </Button>
              
              {priceEstimate !== null && (
                <div>
                  <Badge variant="outline" className="text-lg p-2">
                    Estimated Price: KSh {priceEstimate.toLocaleString()}
                  </Badge>
                </div>
              )}
            </div>
            
            <Button type="submit" className="w-full">
              Book Now
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestTaxiBooking;
