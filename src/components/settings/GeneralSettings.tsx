
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { FormError } from '@/components/ui/form-error';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export const GeneralSettings = () => {
  const { user } = useAuth();
  const { handleError } = useErrorHandler();
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: business } = useQuery({
    queryKey: ['user-business', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('businesses')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['business-settings', business?.id],
    queryFn: async () => {
      if (!business) return null;
      
      const { data, error } = await supabase
        .from('business_settings')
        .select('*')
        .eq('business_id', business.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!business,
  });

  // Handle error using useEffect
  React.useEffect(() => {
    if (error) {
      handleError(error, { customMessage: 'Failed to load general settings' });
    }
  }, [error, handleError]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!business) throw new Error('No business found');

      const updates = {
        timezone: formData.get('timezone') as string,
        currency: formData.get('currency') as string,
        booking_slot_duration_minutes: parseInt(formData.get('slot_duration') as string),
        max_bookings_per_slot: parseInt(formData.get('max_bookings') as string),
        auto_confirm_bookings: formData.get('auto_confirm') === 'on',
        require_payment: formData.get('require_payment') === 'on',
      };

      if (settings) {
        const { error } = await supabase
          .from('business_settings')
          .update(updates)
          .eq('business_id', business.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('business_settings')
          .insert({ ...updates, business_id: business.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success('General settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['business-settings'] });
      setErrors({});
    },
    onError: (error) => {
      handleError(error, { customMessage: 'Failed to update general settings' });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Basic validation
    const newErrors: Record<string, string> = {};
    const slotDuration = formData.get('slot_duration') as string;
    const maxBookings = formData.get('max_bookings') as string;
    
    if (!slotDuration || parseInt(slotDuration) < 15) {
      newErrors.slot_duration = 'Slot duration must be at least 15 minutes';
    }
    
    if (!maxBookings || parseInt(maxBookings) < 1) {
      newErrors.max_bookings = 'Maximum bookings must be at least 1';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      updateSettingsMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSkeleton lines={6} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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
            disabled={updateSettingsMutation.isPending}
            className="w-full md:w-auto"
          >
            {updateSettingsMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Settings
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
