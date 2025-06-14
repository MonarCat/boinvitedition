
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ExternalLink, MapPin, Users, Plane } from 'lucide-react';
import { SeatSelectionMap } from './SeatSelectionMap';
import { DurationSelector } from './DurationSelector';
import { CURRENCIES } from '@/components/business/GlobalBusinessSettings';

interface EnhancedTransportFormProps {
  onSubmit: (data: any) => void;
  defaultValues?: any;
  businessId?: string;
}

const COUNTRIES = [
  'Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'South Africa', 'Nigeria', 'Ghana', 'Egypt',
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France'
];

const SERVICE_CLASSES = {
  bus: ['Economy', 'VIP', 'Premium'],
  shuttle: ['Standard', 'Premium'],
  flight: ['Economy', 'Business', 'First Class'],
  train: ['Economy', 'Business', 'First Class']
};

const DEFAULT_SEATS = {
  bus: 50,
  shuttle: 14,
  flight: 180,
  train: 120
};

export const EnhancedTransportForm = ({ onSubmit, defaultValues, businessId }: EnhancedTransportFormProps) => {
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [durationHours, setDurationHours] = useState(defaultValues?.duration_hours || 0);
  const [durationMinutes, setDurationMinutes] = useState(defaultValues?.duration_minutes || 0);

  // Fetch business currency
  const { data: business } = useQuery({
    queryKey: ['business', businessId],
    queryFn: async () => {
      if (!businessId) return null;
      const { data, error } = await supabase
        .from('businesses')
        .select('currency')
        .eq('id', businessId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!businessId,
  });

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      service_type: 'bus',
      departure_country: '',
      departure_city: '',
      arrival_country: '',
      arrival_city: '',
      departure_time: '',
      arrival_time: '',
      adults: 1,
      children: 0,
      infants: 0,
      service_class: 'Economy',
      available_seats: 50,
      price_per_seat: 0,
      external_booking_url: '',
      is_external_booking: false,
      ...defaultValues
    }
  });

  const isExternalBooking = watch('is_external_booking');
  const serviceType = watch('service_type');
  const adults = watch('adults');
  const children = watch('children');
  const totalPassengers = adults + children;

  const getCurrencySymbol = (currency: string) => {
    const currencyData = CURRENCIES.find(c => c.code === currency);
    return currencyData?.symbol || '$';
  };

  const businessCurrency = business?.currency || 'USD';
  const currencySymbol = getCurrencySymbol(businessCurrency);

  const getExternalUrl = (type: string) => {
    switch (type) {
      case 'train':
        return 'https://booking.example.com/train';
      case 'bus':
        return 'https://booking.example.com/bus';
      case 'flight':
        return 'https://booking.example.com/flight';
      default:
        return '';
    }
  };

  const handleFormSubmit = (data: any) => {
    const transportDetails = {
      service_type: data.service_type,
      departure_location: `${data.departure_city}, ${data.departure_country}`,
      arrival_location: `${data.arrival_city}, ${data.arrival_country}`,
      departure_time: data.departure_time,
      arrival_time: data.arrival_time,
      duration_hours: durationHours,
      duration_minutes: durationMinutes,
      passenger_info: {
        adults: data.adults,
        children: data.children,
        infants: data.infants
      },
      service_class: data.service_class,
      available_seats: data.available_seats,
      price_per_seat: data.price_per_seat,
      external_booking_url: data.external_booking_url,
      is_external_booking: data.is_external_booking,
      selected_seats: selectedSeats,
      currency: businessCurrency
    };
    
    onSubmit(transportDetails);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {serviceType === 'flight' ? <Plane className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
          Enhanced Transport Service Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="service_type">Service Type</Label>
              <Select
                value={watch('service_type')}
                onValueChange={(value) => {
                  setValue('service_type', value);
                  setValue('available_seats', DEFAULT_SEATS[value as keyof typeof DEFAULT_SEATS]);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bus">Bus Service</SelectItem>
                  <SelectItem value="train">Train Service</SelectItem>
                  <SelectItem value="flight">Flight Service</SelectItem>
                  <SelectItem value="shuttle">Shuttle Service (14-seater)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="service_class">Service Class</Label>
              <Select
                value={watch('service_class')}
                onValueChange={(value) => setValue('service_class', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_CLASSES[serviceType as keyof typeof SERVICE_CLASSES]?.map((cls) => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Travel Route</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="departure_country">From (Country)</Label>
                <Select
                  value={watch('departure_country')}
                  onValueChange={(value) => setValue('departure_country', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="departure_city">City</Label>
                <Input
                  id="departure_city"
                  {...register('departure_city', { required: 'Departure city is required' })}
                  placeholder="e.g., Nairobi"
                />
              </div>

              <div>
                <Label htmlFor="arrival_country">To (Country)</Label>
                <Select
                  value={watch('arrival_country')}
                  onValueChange={(value) => setValue('arrival_country', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="arrival_city">City</Label>
                <Input
                  id="arrival_city"
                  {...register('arrival_city', { required: 'Arrival city is required' })}
                  placeholder="e.g., Mombasa"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              Passenger Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="adults">Adults</Label>
                <Input
                  id="adults"
                  type="number"
                  min="1"
                  {...register('adults', { required: 'Number of adults is required' })}
                />
              </div>

              <div>
                <Label htmlFor="children">Children (2-11 years)</Label>
                <Input
                  id="children"
                  type="number"
                  min="0"
                  {...register('children')}
                />
              </div>

              <div>
                <Label htmlFor="infants">Infants (under 2 years)</Label>
                <Input
                  id="infants"
                  type="number"
                  min="0"
                  {...register('infants')}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="departure_time">Departure Time</Label>
              <Input
                id="departure_time"
                type="time"
                {...register('departure_time', { required: 'Departure time is required' })}
              />
            </div>

            <div>
              <Label htmlFor="arrival_time">Arrival Time</Label>
              <Input
                id="arrival_time"
                type="time"
                {...register('arrival_time', { required: 'Arrival time is required' })}
              />
            </div>
          </div>

          <DurationSelector
            hours={durationHours}
            minutes={durationMinutes}
            onHoursChange={setDurationHours}
            onMinutesChange={setDurationMinutes}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="available_seats">Available Seats</Label>
              <Input
                id="available_seats"
                type="number"
                min="1"
                {...register('available_seats', { required: 'Available seats is required' })}
              />
            </div>

            <div>
              <Label htmlFor="price_per_seat">Price per Seat ({currencySymbol})</Label>
              <Input
                id="price_per_seat"
                type="number"
                step="0.01"
                min="0"
                {...register('price_per_seat', { required: 'Price per seat is required' })}
                placeholder="0.00"
              />
            </div>
          </div>

          {!isExternalBooking && totalPassengers > 0 && (
            <SeatSelectionMap
              serviceType={serviceType}
              totalSeats={watch('available_seats')}
              occupiedSeats={[]} // This would come from existing bookings
              onSeatSelect={setSelectedSeats}
              passengerCount={totalPassengers}
            />
          )}

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_external_booking"
                checked={isExternalBooking}
                onCheckedChange={(checked) => setValue('is_external_booking', checked)}
              />
              <Label htmlFor="is_external_booking">Use External Booking System</Label>
            </div>

            {isExternalBooking && (
              <div>
                <Label htmlFor="external_booking_url">External Booking URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="external_booking_url"
                    {...register('external_booking_url')}
                    placeholder={getExternalUrl(serviceType)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setValue('external_booking_url', getExternalUrl(serviceType))}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full">
            Save Enhanced Transport Service
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
