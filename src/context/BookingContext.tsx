import React, { createContext, useState, useEffect } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Service, StaffMember, Booking, ClientData } from '../types/models';

interface BookingContextType {
  // Core data
  services: Service[];
  staff: StaffMember[];
  bookings: Booking[];
  
  // Dashboard metrics
  todayRevenue: number;
  todayBookingCount: number;
  totalRevenue: number;
  totalBookings: number;
  completedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  
  // Booking state
  selectedService: Service | null;
  selectedDate: Date | null;
  selectedTime: string;
  selectedStaff: StaffMember | null;
  
  // UI states
  isLoading: boolean;
  isBookingInProgress: boolean;
  
  // Booking form actions
  setSelectedService: (service: Service) => void;
  setSelectedDate: (date: Date | null) => void;
  setSelectedTime: (time: string) => void;
  setSelectedStaff: (staff: StaffMember) => void;
  
  // CRUD operations
  createBooking: (clientData: ClientData) => Promise<Booking>;
  updateBookingStatus: (bookingId: string, status: Booking['status']) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
  
  // Data operations
  refreshBookings: () => Promise<void>;
  getAvailableTimeSlots: (date: Date, serviceId: string) => string[];
  getUpcomingBookings: () => Booking[];
  getBookingsByDate: (date: string) => Booking[];
  getBookingsByStatus: (status: Booking['status']) => Booking[];
  getServiceById: (id: string) => Service | undefined;
  getStaffById: (id: string) => StaffMember | undefined;
  
  // Analytics
  getPopularServices: () => Array<{service: Service, count: number}>;
  getRevenueByPeriod: (start: string, end: string) => number;
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export { BookingContext };

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { supabase } = useSupabase();
  const queryClient = useQueryClient();
  
  // State for booking form
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  
  // Fetch services data
  const { 
    data: services = [], 
    isLoading: isServicesLoading 
  } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch staff data
  const { 
    data: staff = [], 
    isLoading: isStaffLoading 
  } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch bookings data with real-time updates
  const { 
    data: bookings = [],
    isLoading: isBookingsLoading,
    refetch: refetchBookings
  } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('bookings-channel')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'bookings' 
      }, () => {
        // Refetch bookings when changes occur
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, queryClient]);

  // Calculate metrics
  const todayRevenue = React.useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return bookings
      .filter(booking => booking.created_at?.startsWith(today))
      .reduce((sum, booking) => sum + (parseFloat(booking.amount) || 0), 0);
  }, [bookings]);

  const todayBookingCount = React.useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return bookings.filter(booking => booking.created_at?.startsWith(today)).length;
  }, [bookings]);
  
  const totalRevenue = React.useMemo(() => {
    return bookings.reduce((sum, booking) => sum + (parseFloat(booking.amount) || 0), 0);
  }, [bookings]);
  
  const totalBookings = React.useMemo(() => {
    return bookings.length;
  }, [bookings]);
  
  const completedBookings = React.useMemo(() => {
    return bookings.filter(booking => booking.status === 'completed').length;
  }, [bookings]);
  
  const pendingBookings = React.useMemo(() => {
    return bookings.filter(booking => booking.status === 'pending').length;
  }, [bookings]);
  
  const cancelledBookings = React.useMemo(() => {
    return bookings.filter(booking => booking.status === 'cancelled').length;
  }, [bookings]);

  // Booking creation mutation
  const { mutateAsync: createBooking, isPending: isBookingInProgress } = useMutation({
    mutationFn: async (clientData: ClientData) => {
      if (!selectedService || !selectedDate || !selectedTime) {
        throw new Error('Please complete all booking details');
      }

      const bookingData = {
        service_id: selectedService.id,
        service_name: selectedService.name,
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTime,
        staff_id: selectedStaff?.id || null,
        staff_name: selectedStaff?.name || null,
        client_name: clientData.name,
        client_email: clientData.email,
        client_phone: clientData.phone,
        notes: clientData.notes || '',
        amount: selectedService.price,
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();
      
      if (error) throw error;
      
      // Reset form after successful booking
      setSelectedService(null);
      setSelectedDate(null);
      setSelectedTime('');
      setSelectedStaff(null);
      
      return data;
    },
    onSuccess: () => {
      toast.success('Booking created successfully');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (error) => {
      toast.error(`Error creating booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Update booking status
  const updateBookingStatus = async (bookingId: string, status: Booking['status']): Promise<void> => {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);
      
    if (error) {
      toast.error(`Error updating booking status: ${error.message}`);
      throw error;
    }
    
    toast.success(`Booking ${status} successfully`);
    queryClient.invalidateQueries({ queryKey: ['bookings'] });
  };
  
  // Cancel booking
  const cancelBooking = async (bookingId: string): Promise<void> => {
    await updateBookingStatus(bookingId, 'cancelled');
  };

  // Get bookings by date
  const getBookingsByDate = (date: string) => {
    return bookings.filter(booking => booking.date === date);
  };
  
  // Get bookings by status
  const getBookingsByStatus = (status: Booking['status']) => {
    return bookings.filter(booking => booking.status === status);
  };
  
  // Analytics functions
  const getPopularServices = () => {
    const serviceCounts = services.map(service => {
      const count = bookings.filter(booking => booking.service_id === service.id).length;
      return { service, count };
    });
    
    return serviceCounts.sort((a, b) => b.count - a.count);
  };
  
  const getRevenueByPeriod = (start: string, end: string) => {
    return bookings
      .filter(booking => booking.date >= start && booking.date <= end)
      .reduce((sum, booking) => sum + (parseFloat(booking.amount.toString()) || 0), 0);
  };
  
  // Define a proper refreshBookings function that returns void
  const refreshBookings = async (): Promise<void> => {
    await refetchBookings();
  };

  // Helper functions
  const getAvailableTimeSlots = (date: Date, serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return [];
    
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Different hours for weekends vs weekdays
    const startHour = isWeekend ? 10 : 9;
    const endHour = isWeekend ? 17 : 18;
    
    const timeSlots: string[] = [];
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minutes = 0; minutes < 60; minutes += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        timeSlots.push(timeString);
      }
    }
    
    // Filter out already booked times
    const dateString = date.toISOString().split('T')[0];
    const bookedTimes = bookings
      .filter(b => b.date === dateString && b.service_id === serviceId)
      .map(b => b.time);
      
    return timeSlots.filter(time => !bookedTimes.includes(time));
  };

  const getUpcomingBookings = () => {
    const today = new Date().toISOString().split('T')[0];
    return bookings.filter(booking => booking.date >= today);
  };

  const getServiceById = (id: string) => services.find(service => service.id === id);
  
  const getStaffById = (id: string) => staff.find(staffMember => staffMember.id === id);

  // Combined loading state
  const isLoading = isServicesLoading || isStaffLoading || isBookingsLoading;

  return (
    <BookingContext.Provider
      value={{
        // Core data
        services,
        staff,
        bookings,
        
        // Dashboard metrics
        todayRevenue,
        todayBookingCount,
        totalRevenue,
        totalBookings,
        completedBookings,
        pendingBookings,
        cancelledBookings,
        
        // Booking state
        selectedService,
        selectedDate,
        selectedTime,
        selectedStaff,
        
        // UI states
        isLoading,
        isBookingInProgress,
        
        // Booking form actions
        setSelectedService,
        setSelectedDate,
        setSelectedTime,
        setSelectedStaff,
        
        // CRUD operations
        createBooking,
        updateBookingStatus,
        cancelBooking,
        
        // Data operations
        refreshBookings,
        getAvailableTimeSlots,
        getUpcomingBookings,
        getBookingsByDate,
        getBookingsByStatus,
        getServiceById,
        getStaffById,
        
        // Analytics
        getPopularServices,
        getRevenueByPeriod,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};
