
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Booking {
  id: string;
  service_name: string;
  client_name: string;
  client_email: string;
  amount: number;
  date: string;
  time: string;
  status: string;
  created_at: string;
  service_id: string;
}

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

export const useBusinessBookings = () => {
  const { user } = useAuth();

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

  // Get bookings
  const { data: bookings = [], isLoading: bookingsLoading, refetch: refetchBookings } = useQuery({
    queryKey: ['business-bookings', business?.id],
    queryFn: async () => {
      if (!business?.id) return [];
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          services!inner(name)
        `)
        .eq('business_id', business.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(booking => ({
        id: booking.id,
        service_name: booking.services?.name || 'Unknown Service',
        client_name: booking.customer_name || 'Unknown Client',
        client_email: booking.customer_email || '',
        amount: Number(booking.total_amount || 0),
        date: booking.booking_date,
        time: booking.booking_time,
        status: booking.status,
        created_at: booking.created_at,
        service_id: booking.service_id
      })) as Booking[];
    },
    enabled: !!business?.id,
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

  // Calculate today's metrics
  const today = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(booking => booking.date === today);
  const todayRevenue = todayBookings.reduce((sum, booking) => sum + booking.amount, 0);
  const todayBookingCount = todayBookings.length;

  const isLoading = bookingsLoading || servicesLoading || staffLoading;

  return {
    services,
    staff,
    bookings,
    todayRevenue,
    todayBookingCount,
    isLoading,
    refreshBookings: refetchBookings
  };
};
