
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Clock, Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface BusinessHoursProps {
  businessId: string;
  currentHours?: any;
  onUpdate?: (hours: any) => void;
}

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
];

export const BusinessHours: React.FC<BusinessHoursProps> = ({
  businessId,
  currentHours = {},
  onUpdate
}) => {
  const [hours, setHours] = useState(() => {
    const defaultHours: any = {};
    DAYS.forEach(day => {
      defaultHours[day.key] = {
        open: currentHours[day.key]?.open || '09:00',
        close: currentHours[day.key]?.close || '17:00',
        isOpen: currentHours[day.key]?.isOpen ?? true
      };
    });
    return defaultHours;
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleDayToggle = (day: string, isOpen: boolean) => {
    setHours(prev => ({
      ...prev,
      [day]: { ...prev[day], isOpen }
    }));
  };

  const handleTimeChange = (day: string, type: 'open' | 'close', value: string) => {
    setHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [type]: value }
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ business_hours: hours })
        .eq('id', businessId);

      if (error) throw error;

      toast.success('Business hours updated successfully');
      onUpdate?.(hours);
    } catch (error) {
      console.error('Error updating business hours:', error);
      toast.error('Failed to update business hours');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Business Hours
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {DAYS.map(day => (
          <div key={day.key} className="flex items-center gap-4 p-3 border rounded-lg">
            <div className="flex items-center space-x-2 min-w-[120px]">
              <Switch
                checked={hours[day.key]?.isOpen || false}
                onCheckedChange={(checked) => handleDayToggle(day.key, checked)}
              />
              <Label className="font-medium">{day.label}</Label>
            </div>
            
            {hours[day.key]?.isOpen ? (
              <div className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Open:</Label>
                  <Input
                    type="time"
                    value={hours[day.key]?.open || '09:00'}
                    onChange={(e) => handleTimeChange(day.key, 'open', e.target.value)}
                    className="w-24"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Close:</Label>
                  <Input
                    type="time"
                    value={hours[day.key]?.close || '17:00'}
                    onChange={(e) => handleTimeChange(day.key, 'close', e.target.value)}
                    className="w-24"
                  />
                </div>
              </div>
            ) : (
              <span className="text-gray-500 italic">Closed</span>
            )}
          </div>
        ))}
        
        <Button onClick={handleSave} disabled={isLoading} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Business Hours'}
        </Button>
      </CardContent>
    </Card>
  );
};
