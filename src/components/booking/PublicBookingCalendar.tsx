
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar as CalendarIcon, ChevronLeft } from 'lucide-react';
import { format, addMinutes, setHours, setMinutes, isSameDay, compareAsc } from 'date-fns';
import { toast } from 'sonner';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  currency?: string;
}

interface Staff {
  id: string;
  name: string;
  email: string;
}

interface PublicBookingCalendarProps {
  businessId: string;
  service: Service;
  businessHours?: BusinessHours;
  onDateTimeSelect?: (date: Date, time: string) => void;
  onBack?: () => void;
}

interface BusinessHours {
  [key: string]: {
    open: string;
    close: string;
  };
}

const formatPrice = (price: number, currency: string = 'KES') => {
  // Always use KES regardless of the currency passed
  return `KES ${price}`;
};

export const PublicBookingCalendar: React.FC<PublicBookingCalendarProps> = ({
  businessId,
  service,
  businessHours,
  onDateTimeSelect,
  onBack
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);

  // Fetch business info for currency
  const { data: business } = useQuery({
    queryKey: ['business', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('currency')
        .eq('id', businessId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch business settings for capacity
  const { data: businessSettings } = useQuery({
    queryKey: ['business-settings', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_settings')
        .select('max_bookings_per_slot, booking_slot_duration_minutes')
        .eq('business_id', businessId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch existing bookings for selected date
  const { data: existingBookings } = useQuery({
    queryKey: ['bookings', businessId, selectedDate],
    queryFn: async () => {
      if (!selectedDate) return [];
      
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('business_id', businessId)
        .eq('booking_date', format(selectedDate, 'yyyy-MM-dd'))
        .neq('status', 'cancelled');
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedDate,
  });

  // Fetch blocked time slots for selected date
  const { data: blockedSlots } = useQuery({
    queryKey: ['blocked-slots', businessId, selectedDate],
    queryFn: async () => {
      if (!selectedDate) return [];
      
      const { data, error } = await supabase
        .from('blocked_time_slots')
        .select('*')
        .eq('business_id', businessId)
        .eq('blocked_date', format(selectedDate, 'yyyy-MM-dd'));
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedDate,
  });

  // Generate available time slots with booking counts
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM
    const slotDuration = businessSettings?.booking_slot_duration_minutes || 30;
    const maxCapacity = businessSettings?.max_bookings_per_slot || 5;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const slotTime = setMinutes(setHours(new Date(), hour), minute);
        const slotEndTime = addMinutes(slotTime, service.duration_minutes);
        
        // Check if slot fits within business hours
        if (slotEndTime.getHours() <= endHour) {
          const timeString = format(slotTime, 'HH:mm');
          
          // Check if slot is blocked
          const isBlocked = blockedSlots?.some(blocked => blocked.blocked_time === timeString);
          
          // Count current bookings for this time slot
          const currentBookings = existingBookings?.filter(booking => 
            booking.booking_time === timeString
          ).length || 0;
          
          // Check if slot is in the past when booking for today
          const isToday = selectedDate && isSameDay(selectedDate, new Date());
          const isPastTime = isToday && compareAsc(slotTime, new Date()) <= 0;
          
          // Check availability (not blocked, not in the past if today, and has capacity)
          const isAvailable = !isBlocked && !isPastTime && currentBookings < maxCapacity;
          
          slots.push({
            time: timeString,
            available: isAvailable,
            currentBookings,
            maxCapacity,
            isBlocked,
          });
        }
      }
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select both date and time');
      return;
    }
    
    onDateTimeSelect?.(selectedDate, selectedTime);
  };

  const currency = business?.currency || service.currency || 'USD';

  return (
    <Card>
      <CardHeader>
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            className="mb-4 w-fit"
            onClick={onBack}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        )}
        <CardTitle>Select Date & Time</CardTitle>
        <p className="text-sm text-gray-600">
          {service.name} • Duration: {service.duration_minutes} minutes • Price: {formatPrice(service.price, currency)}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Date Selection */}
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Choose Date
            </h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => {
                // Allow booking on same day (today)
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today;
              }}
              className="rounded-md border w-full"
            />
          </div>

          {/* Time Selection */}
          {selectedDate && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Available Times for {format(selectedDate, 'PPP')}
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((slot) => (
                  <Button
                    key={slot.time}
                    variant={selectedTime === slot.time ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTime(slot.time)}
                    disabled={!slot.available}
                    className="w-full text-xs"
                  >
                    {slot.time}
                    {!slot.available && slot.isBlocked && (
                      <Badge variant="destructive" className="ml-1 text-xs">Blocked</Badge>
                    )}
                    {!slot.available && !slot.isBlocked && (
                      <Badge variant="secondary" className="ml-1 text-xs">Full</Badge>
                    )}
                  </Button>
                ))}
              </div>
              {timeSlots.length === 0 && (
                <p className="text-gray-500 text-center py-4">No available time slots for this date</p>
              )}
            </div>
          )}

          {/* Continue Button */}
          {selectedDate && selectedTime && (
            <div className="pt-4 border-t">
              <Button
                onClick={handleContinue}
                className="w-full"
              >
                Continue to Next Step
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
