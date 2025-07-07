import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format, addDays, parseISO, isSameDay, isAfter, addHours } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, Clock, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

interface Booking {
  id: string;
  booking_date: string;
  booking_time: string;
  business_id: string;
  service_id: string;
  reschedule_count?: number;
  status: string;
  services: {
    name: string;
    duration_minutes: number;
  };
  businesses: {
    name: string;
  };
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export const RescheduleBookingPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [isRescheduled, setIsRescheduled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load booking data on component mount
  useEffect(() => {
    const loadBooking = async () => {
      try {
        if (!bookingId) {
          setError('No booking ID provided. Please search for a booking first.');
          setIsLoading(false);
          navigate('/booking/search');
          return;
        }
        
        // First try to get from session storage if coming from booking history
        const storedBooking = sessionStorage.getItem('rescheduleBooking');
        if (storedBooking) {
          const parsedBooking = JSON.parse(storedBooking);
          setBooking(parsedBooking);
          sessionStorage.removeItem('rescheduleBooking');
          setIsLoading(false);
          return;
        }
        
        // Otherwise fetch from API
        if (bookingId) {
          const { data, error } = await supabase
            .from('bookings')
            .select(`
              id,
              booking_date,
              booking_time,
              business_id,
              service_id,
              reschedule_count,
              status,
              services:service_id(name, duration_minutes),
              businesses:business_id(name)
            `)
            .eq('id', bookingId)
            .single();
          
          if (error) throw error;
          if (!data) throw new Error('Booking not found');
          
          setBooking(data);
        }
      } catch (error) {
        console.error('Error loading booking:', error);
        setError('Unable to load booking details. Please try again or contact support.');
      } finally {
        setIsLoading(false);
      }
    };

    loadBooking();
  }, [bookingId, navigate]);

  // When date is selected, fetch available time slots
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!selectedDate || !booking) return;
      
      try {
        // Fetch business hours from businesses table
        const { data: businessData, error: businessError } = await supabase
          .from('businesses')
          .select('business_hours')
          .eq('id', booking.business_id)
          .single();
        
        if (businessError) throw businessError;
        
        // Fetch existing bookings for the selected date
        const { data: existingBookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('booking_time')
          .eq('business_id', booking.business_id)
          .eq('booking_date', format(selectedDate, 'yyyy-MM-dd'))
          .neq('id', booking.id) // Exclude current booking
          .neq('status', 'cancelled');
        
        if (bookingsError) throw bookingsError;
        
        // Generate time slots based on business hours
        const businessHours = businessData?.business_hours || {};
        const dayOfWeek = format(selectedDate, 'EEEE').toLowerCase();
        const dayHours = businessHours[dayOfWeek];
        
        if (!dayHours || !dayHours.open || !dayHours.close) {
          setAvailableTimeSlots([]);
          return;
        }
        
        // Create time slots in 30-minute increments
        const slots: TimeSlot[] = [];
        const [startHour, startMinute] = dayHours.open.split(':').map(Number);
        const [endHour, endMinute] = dayHours.close.split(':').map(Number);
        
        const startTime = new Date(selectedDate);
        startTime.setHours(startHour, startMinute, 0, 0);
        
        const endTime = new Date(selectedDate);
        endTime.setHours(endHour, endMinute, 0, 0);
        
        // Get current time
        const now = new Date();
        
        // Create slots in 30-minute increments
        const slotDuration = 30; // minutes
        let currentSlotTime = new Date(startTime);
        
        while (currentSlotTime < endTime) {
          const timeString = format(currentSlotTime, 'HH:mm');
          
          // Check if slot is already booked
          const isBooked = existingBookings?.some(booking => booking.booking_time === timeString);
          
          // Check if slot is in the past
          const isPastTime = isSameDay(selectedDate, now) && isAfter(now, currentSlotTime);
          
          // Add slot if it's available
          slots.push({
            time: timeString,
            available: !isBooked && !isPastTime
          });
          
          // Move to next slot
          currentSlotTime = new Date(currentSlotTime.getTime() + slotDuration * 60000);
        }
        
        setAvailableTimeSlots(slots);
      } catch (error) {
        console.error('Error fetching time slots:', error);
        toast.error('Failed to load available time slots');
      }
    };
    
    fetchTimeSlots();
  }, [selectedDate, booking]);

  // Check if booking can be rescheduled (not within 2 hours of appointment)
  const canReschedule = () => {
    if (!booking) return false;
    
    // Check if booking has already been rescheduled (using reschedule_count)
    if (booking.reschedule_count && booking.reschedule_count > 0) {
      setError('This booking has already been rescheduled once.');
      return false;
    }
    
    // Check if booking is in confirmed status
    if (booking.status !== 'confirmed') {
      setError(`Cannot reschedule a booking with status: ${booking.status}`);
      return false;
    }
    
    // Check if booking is not within 2 hours
    const bookingDateTime = parseISO(`${booking.booking_date}T${booking.booking_time}`);
    const twoHoursBeforeBooking = addHours(bookingDateTime, -2);
    const now = new Date();
    
    if (isAfter(now, twoHoursBeforeBooking)) {
      setError('Bookings can only be rescheduled at least 2 hours before the appointment time.');
      return false;
    }
    
    return true;
  };

  const handleReschedule = async () => {
    if (!booking || !selectedDate || !selectedTime) return;
    
    setIsRescheduling(true);
    try {
      // Update the booking with new date and time
      const { error } = await supabase
        .from('bookings')
        .update({
          booking_date: format(selectedDate, 'yyyy-MM-dd'),
          booking_time: selectedTime,
          reschedule_count: (booking.reschedule_count || 0) + 1,
          status: 'confirmed'
        })
        .eq('id', booking.id);
      
      if (error) throw error;
      
      // Show success state
      setIsRescheduled(true);
      toast.success('Your appointment has been successfully rescheduled!');
      
    } catch (error) {
      console.error('Error rescheduling booking:', error);
      toast.error('Failed to reschedule appointment. Please try again or contact support.');
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-3xl text-center">
        <Card>
          <CardContent className="py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading booking details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="h-5 w-5" />
              Unable to Reschedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Booking Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">The booking you're looking for could not be found. It may have been cancelled or removed.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isRescheduled) {
    return (
      <div className="container mx-auto py-8 max-w-3xl">
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Appointment Rescheduled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-green-800 mb-2">Booking Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Service:</span>
                  <span className="font-medium">{booking.services?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>New Date:</span>
                  <span>{selectedDate && format(selectedDate, 'PPP')}</span>
                </div>
                <div className="flex justify-between">
                  <span>New Time:</span>
                  <span>{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Business:</span>
                  <span>{booking.businesses?.name}</span>
                </div>
              </div>
            </div>
            <p className="text-gray-600 mb-4">Your appointment has been successfully rescheduled. You will receive a confirmation via email or text message.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Bookings
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // If we can't reschedule, show error message
  if (!canReschedule()) {
    return (
      <div className="container mx-auto py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="h-5 w-5" />
              Unable to Reschedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Reschedule Your Appointment</CardTitle>
          <CardDescription>
            Select a new date and time for your {booking.services?.name} appointment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Current Booking</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-700">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>Date: {format(parseISO(booking.booking_date), 'PPP')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Time: {booking.booking_time}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-3">1. Select a New Date</h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={[
                { before: new Date() },
                { after: addDays(new Date(), 60) }
              ]}
              className="border rounded-md p-3"
            />
          </div>

          {selectedDate && (
            <div>
              <h3 className="text-sm font-medium mb-3">2. Select a New Time</h3>
              {availableTimeSlots.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {availableTimeSlots.map((slot) => (
                    <Button
                      key={slot.time}
                      variant={selectedTime === slot.time ? "default" : "outline"}
                      onClick={() => slot.available && setSelectedTime(slot.time)}
                      disabled={!slot.available}
                      className={!slot.available ? "bg-gray-100 text-gray-400 border-gray-200" : ""}
                    >
                      {slot.time}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No time slots available on this date.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleBack}>
            Cancel
          </Button>
          <Button 
            onClick={handleReschedule} 
            disabled={!selectedDate || !selectedTime || isRescheduling}
          >
            {isRescheduling ? 'Rescheduling...' : 'Confirm Reschedule'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
