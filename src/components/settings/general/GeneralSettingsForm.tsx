
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormError } from '@/components/ui/form-error';
import { Loader2 } from 'lucide-react';

interface GeneralSettingsFormProps {
  settings: any;
  errors: Record<string, string>;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const GeneralSettingsForm: React.FC<GeneralSettingsFormProps> = ({
  settings,
  errors,
  isLoading,
  onSubmit
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="timezone">Timezone</Label>
          <Select name="timezone" defaultValue={settings?.timezone || 'UTC'}>
            <SelectTrigger>
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UTC">UTC</SelectItem>
              <SelectItem value="America/New_York">Eastern Time</SelectItem>
              <SelectItem value="America/Chicago">Central Time</SelectItem>
              <SelectItem value="America/Denver">Mountain Time</SelectItem>
              <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
              <SelectItem value="Europe/London">London</SelectItem>
              <SelectItem value="Europe/Paris">Paris</SelectItem>
              <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Select name="currency" defaultValue={settings?.currency || 'USD'}>
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="EUR">EUR (€)</SelectItem>
              <SelectItem value="GBP">GBP (£)</SelectItem>
              <SelectItem value="KES">KES (KSh)</SelectItem>
              <SelectItem value="CAD">CAD ($)</SelectItem>
              <SelectItem value="AUD">AUD ($)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="slot_duration">Booking Slot Duration (minutes)</Label>
          <Input
            id="slot_duration"
            name="slot_duration"
            type="number"
            min="15"
            step="15"
            defaultValue={settings?.booking_slot_duration_minutes || 60}
            className={errors.slot_duration ? 'border-red-500' : ''}
          />
          <FormError message={errors.slot_duration} />
        </div>
        
        <div>
          <Label htmlFor="max_bookings">Max Bookings per Slot</Label>
          <Input
            id="max_bookings"
            name="max_bookings"
            type="number"
            min="1"
            defaultValue={settings?.max_bookings_per_slot || 1}
            className={errors.max_bookings ? 'border-red-500' : ''}
          />
          <FormError message={errors.max_bookings} />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="auto_confirm">Auto-confirm bookings</Label>
            <p className="text-sm text-gray-600">Automatically confirm new bookings without manual approval</p>
          </div>
          <Switch
            id="auto_confirm"
            name="auto_confirm"
            defaultChecked={settings?.auto_confirm_bookings || false}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="require_payment">Require payment</Label>
            <p className="text-sm text-gray-600">Require payment at time of booking</p>
          </div>
          <Switch
            id="require_payment"
            name="require_payment"
            defaultChecked={settings?.require_payment || false}
          />
        </div>
      </div>
      
      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full md:w-auto"
      >
        {isLoading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        Save Settings
      </Button>
    </form>
  );
};
