
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Plane } from 'lucide-react';
import { SeatSelectionMap } from './SeatSelectionMap';
import { DurationSelector } from './DurationSelector';
import { ServiceTypeSection } from './ServiceTypeSection';
import { RouteSection } from './RouteSection';
import { PassengerSection } from './PassengerSection';
import { TimeSection } from './TimeSection';
import { PricingSection } from './PricingSection';
import { ExternalBookingSection } from './ExternalBookingSection';
import { CURRENCIES } from '@/components/business/GlobalBusinessSettings';

interface EnhancedTransportFormProps {
  onSubmit: (data: any) => void;
  defaultValues?: any;
  businessId?: string;
}

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
          <ServiceTypeSection setValue={setValue} watch={watch} />

          <RouteSection register={register} setValue={setValue} watch={watch} />

          <PassengerSection register={register} />

          <TimeSection register={register} />

          <DurationSelector
            hours={durationHours}
            minutes={durationMinutes}
            onHoursChange={setDurationHours}
            onMinutesChange={setDurationMinutes}
          />

          <PricingSection register={register} watch={watch} currencySymbol={currencySymbol} />

          {!isExternalBooking && totalPassengers > 0 && (
            <SeatSelectionMap
              serviceType={serviceType}
              totalSeats={watch('available_seats')}
              occupiedSeats={[]} // This would come from existing bookings
              onSeatSelect={setSelectedSeats}
              passengerCount={totalPassengers}
            />
          )}

          <ExternalBookingSection 
            register={register} 
            setValue={setValue} 
            watch={watch} 
            serviceType={serviceType} 
          />

          <Button type="submit" className="w-full">
            Save Enhanced Transport Service
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
