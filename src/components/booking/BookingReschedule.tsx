
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { format, isAfter, isBefore, parseISO } from 'date-fns';

interface BookingRescheduleProps {
  booking: {
    id: string;
    booking_date: string;
    booking_time: string;
    reschedule_deadline: string;
    reschedule_count: number;
    services: { name: string };
    clients: { name: string };
  };
  onRescheduleComplete: () => void;
  onCancel: () => void;
}

export const BookingReschedule: React.FC<BookingRescheduleProps> = ({
  booking,
  onRescheduleComplete,
  onCancel
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState('');
  const [isRescheduling, setIsRescheduling] = useState(false);

  const rescheduleDeadline = parseISO(booking.reschedule_deadline);
  const canReschedule = isBefore(new Date(), rescheduleDeadline);
  const maxReschedules = 3;

  // Generate available time slots (9 AM to 5 PM)
  const timeSlots = Array.from({ length: 17 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9;
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select both date and time');
      return;
    }

    if (!canReschedule) {
      toast.error('Reschedule deadline has passed');
      return;
    }

    if (booking.reschedule_count >= maxReschedules) {
      toast.error(`Maximum ${maxReschedules} reschedules allowed per booking`);
      return;
    }

    setIsRescheduling(true);

    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          booking_date: format(selectedDate, 'yyyy-MM-dd'),
          booking_time: selectedTime,
          reschedule_count: booking.reschedule_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', booking.id);

      if (error) throw error;

      toast.success('Booking rescheduled successfully!');
      onRescheduleComplete();
    } catch (error) {
      console.error('Reschedule error:', error);
      toast.error('Failed to reschedule booking');
    } finally {
      setIsRescheduling(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Reschedule Booking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Booking Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Current Booking</h3>
          <div className="space-y-1 text-sm">
            <p><strong>Service:</strong> {booking.services.name}</p>
            <p><strong>Client:</strong> {booking.clients.name}</p>
            <p><strong>Date:</strong> {format(parseISO(booking.booking_date), 'PPP')}</p>
            <p><strong>Time:</strong> {booking.booking_time}</p>
          </div>
        </div>

        {/* Reschedule Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <span className="text-sm">
              Deadline: {format(rescheduleDeadline, 'PPp')}
            </span>
          </div>
          <Badge variant={canReschedule ? "default" : "destructive"}>
            {canReschedule ? "Can Reschedule" : "Deadline Passed"}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm">Reschedules used:</span>
          <Badge variant="outline">
            {booking.reschedule_count} / {maxReschedules}
          </Badge>
        </div>

        {!canReschedule && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Reschedule Not Available</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              The 2-hour reschedule deadline has passed for this booking.
            </p>
          </div>
        )}

        {booking.reschedule_count >= maxReschedules && (
          <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Maximum Reschedules Reached</span>
            </div>
            <p className="text-sm text-orange-700 mt-1">
              This booking has reached the maximum number of reschedules allowed.
            </p>
          </div>
        )}

        {canReschedule && booking.reschedule_count < maxReschedules && (
          <>
            {/* Date Selection */}
            <div>
              <h3 className="font-medium mb-3">Select New Date</h3>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => isBefore(date, new Date()) || date < new Date()}
                className="rounded-md border"
              />
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div>
                <h3 className="font-medium mb-3">Select New Time</h3>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleReschedule}
                disabled={!selectedDate || !selectedTime || isRescheduling}
                className="flex-1"
              >
                {isRescheduling ? 'Rescheduling...' : 'Confirm Reschedule'}
              </Button>
              <Button variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
