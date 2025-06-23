
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock } from 'lucide-react';

export type TimePeriod = 'today' | 'week' | 'month' | 'year';

interface TimePeriodSelectorProps {
  value: TimePeriod;
  onChange: (period: TimePeriod) => void;
}

export const TimePeriodSelector: React.FC<TimePeriodSelectorProps> = ({ value, onChange }) => {
  const periods = [
    { value: 'today' as TimePeriod, label: 'Today', icon: Clock },
    { value: 'week' as TimePeriod, label: 'This Week', icon: Calendar },
    { value: 'month' as TimePeriod, label: 'This Month', icon: Calendar },
    { value: 'year' as TimePeriod, label: 'This Year', icon: Calendar },
  ];

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-gray-500" />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          {periods.map((period) => (
            <SelectItem key={period.value} value={period.value}>
              {period.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
