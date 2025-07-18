import React, { useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, isSameDay, parse, compareAsc } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateTimeSelectionCardProps {
  selectedDate: Date | undefined;
  selectedTime: string;
  onDateSelect: (date: Date | undefined) => void;
  onTimeSelect: (time: string) => void;
}

export const DateTimeSelectionCard: React.FC<DateTimeSelectionCardProps> = ({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect
}) => {
  // Filter out past time slots if the selected date is today
  const timeSlots = useMemo(() => {
    // Define all possible time slots inside the useMemo
    const allTimeSlots = [
      "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
      "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
      "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM"
    ];
    
    if (selectedDate && isSameDay(selectedDate, new Date())) {
      const now = new Date();
      return allTimeSlots.filter(timeStr => {
        // Parse the time string to a Date object for today
        const timeFormat = timeStr.includes('PM') && !timeStr.startsWith('12') ? 'h:mm aa' : 'h:mm aa';
        const timeDate = parse(timeStr, timeFormat, new Date());
        
        // Set the parsed time to today's date for comparison
        timeDate.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
        
        // Only include future time slots (adding a small buffer)
        return compareAsc(timeDate, now) > 0;
      });
    }
    return allTimeSlots;
  }, [selectedDate]);

  return (
    <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">Select Date & Time</CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">Choose your preferred appointment slot.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Select Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-12 px-4 rounded-lg",
                    "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600",
                    "hover:bg-slate-50 dark:hover:bg-slate-700",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-3 h-5 w-5 text-slate-500 dark:text-slate-400" />
                  {selectedDate ? format(selectedDate, "PPP") : <span className="text-slate-500 dark:text-slate-400">Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded-lg shadow-lg" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    // Use setTimeout to prevent any interference with script loading
                    // This prevents stalling at date selection step
                    if (date) {
                      setTimeout(() => onDateSelect(date), 10);
                    } else {
                      onDateSelect(date);
                    }
                  }}
                  disabled={(date) => {
                    // Create a new date object set to midnight (start of day)
                    const today = new Date(new Date().setHours(0, 0, 0, 0));
                    // Allow booking on same day (today)
                    return date < today;
                  }}
                  initialFocus
                  className="p-2"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Select Time</Label>
            <Select 
              value={selectedTime} 
              onValueChange={(time) => {
                // Use setTimeout to prevent any interference with script loading
                setTimeout(() => onTimeSelect(time), 10);
              }}>
              <SelectTrigger className="h-12 px-4 rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                <SelectValue placeholder={
                  <div className="flex items-center text-slate-500 dark:text-slate-400">
                    <Clock className="mr-3 h-5 w-5" />
                    <span>Choose time slot</span>
                  </div>
                } />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded-lg shadow-lg">
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time} className="hover:bg-slate-100 dark:hover:bg-slate-700 h-10">
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
