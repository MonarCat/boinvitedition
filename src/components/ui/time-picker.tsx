import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Label } from './label';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  label?: string;
  className?: string;
  id?: string;
}

export function TimePicker({
  value,
  onChange,
  label,
  className,
  id,
}: TimePickerProps) {
  // Generate time slots from 00:00 to 23:30 in 30-minute increments
  const timeSlots = React.useMemo(() => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        slots.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    return slots;
  }, []);

  const formatTimeDisplay = (time: string) => {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour, 10);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const hour12 = hourNum % 12 || 12;
    return `${hour12}:${minute} ${ampm}`;
  };

  return (
    <div className={className}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id}>
          <SelectValue placeholder="Select time">
            {value ? formatTimeDisplay(value) : "Select time"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {timeSlots.map((time) => (
            <SelectItem key={time} value={time}>
              {formatTimeDisplay(time)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
