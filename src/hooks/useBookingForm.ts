
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
}

interface Staff {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
}

export const useBookingForm = () => {
  const { user } = useAuth();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isBookingInProgress, setIsBookingInProgress] = useState(false);

  // Get business data
  const { data: business } = useQuery({
    queryKey: ['current-business', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Get services
  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['business-services', business?.id],
    queryFn: async () => {
      if (!business?.id) return [];
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', business.id)
        .eq('is_active', true);
      
      if (error) throw error;
      return data as Service[];
    },
    enabled: !!business?.id,
  });

  // Get staff
  const { data: staff = [], isLoading: staffLoading } = useQuery({
    queryKey: ['business-staff', business?.id],
    queryFn: async () => {
      if (!business?.id) return [];
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('business_id', business.id);
      
      if (error) throw error;
      return data as Staff[];
    },
    enabled: !!business?.id,
  });

  const getAvailableTimeSlots = (date: Date, serviceId: string) => {
    // Generate time slots from 9 AM to 5 PM
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const createBooking = async (clientData: any) => {
    if (!selectedService || !selectedDate || !selectedTime || !business) {
      throw new Error('Missing required booking information');
    }

    setIsBookingInProgress(true);
    try {
      // Create or get client
      let clientId: string;
      
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('business_id', business.id)
        .eq('email', clientData.email)
        .maybeSingle();

      if (existingClient) {
        clientId = existingClient.id;
      } else {
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            business_id: business.id,
            name: clientData.name,
            email: clientData.email,
            phone: clientData.phone || null
          })
          .select('id')
          .single();

        if (clientError) throw clientError;
        clientId = newClient.id;
      }

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          business_id: business.id,
          client_id: clientId,
          service_id: selectedService.id,
          staff_id: selectedStaff?.id || null,
          booking_date: selectedDate.toISOString().split('T')[0],
          booking_time: selectedTime,
          duration_minutes: selectedService.duration_minutes,
          total_amount: selectedService.price,
          status: 'confirmed',
          payment_status: 'pending',
          customer_name: clientData.name,
          customer_email: clientData.email,
          customer_phone: clientData.phone || null,
          notes: clientData.notes || null
        })
        .select()
        .single();

      if (bookingError) throw bookingError;
      return booking;
    } finally {
      setIsBookingInProgress(false);
    }
  };

  const isLoading = servicesLoading || staffLoading;

  return {
    services,
    staff,
    selectedService,
    selectedDate,
    selectedTime,
    selectedStaff,
    isLoading,
    isBookingInProgress,
    setSelectedService,
    setSelectedDate,
    setSelectedTime,
    setSelectedStaff,
    createBooking,
    getAvailableTimeSlots
  };
};
