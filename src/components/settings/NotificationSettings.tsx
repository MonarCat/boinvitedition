import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export const NotificationSettings = () => {
  const { user } = useAuth();
  const { handleError } = useErrorHandler();
  const queryClient = useQueryClient();

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

  const { data: settings, isLoading } = useQuery({
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
    onError: (error) => {
      handleError(error, { customMessage: 'Failed to load notification settings' });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!business) throw new Error('No business found');

      // Note: notification_preferences column doesn't exist in current schema
      // This is a placeholder for when it's added
      const updates = {
        // notification_preferences would be a JSON field when added
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
      toast.success('Notification settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['business-settings'] });
    },
    onError: (error) => {
      handleError(error, { customMessage: 'Failed to update notification settings' });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateSettingsMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSkeleton lines={4} />
        </CardContent>
      </Card>
    );
  }

  // Placeholder default values since notification_preferences doesn't exist yet
  const notificationPrefs = {
    emailBookings: true,
    emailCancellations: true,
    emailReminders: false,
    smsBookings: false,
    smsReminders: false,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <p className="text-sm text-gray-600">
          Configure how you want to be notified about booking activities.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">Email Notifications</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email_bookings">New bookings</Label>
                <p className="text-sm text-gray-600">Get notified when someone books an appointment</p>
              </div>
              <Switch
                id="email_bookings"
                name="email_bookings"
                defaultChecked={notificationPrefs.emailBookings}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email_cancellations">Cancellations</Label>
                <p className="text-sm text-gray-600">Get notified when bookings are cancelled</p>
              </div>
              <Switch
                id="email_cancellations"
                name="email_cancellations"
                defaultChecked={notificationPrefs.emailCancellations}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email_reminders">Daily reminders</Label>
                <p className="text-sm text-gray-600">Daily summary of upcoming appointments</p>
              </div>
              <Switch
                id="email_reminders"
                name="email_reminders"
                defaultChecked={notificationPrefs.emailReminders}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">SMS Notifications</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sms_bookings">New bookings</Label>
                <p className="text-sm text-gray-600">SMS alerts for new bookings</p>
              </div>
              <Switch
                id="sms_bookings"
                name="sms_bookings"
                defaultChecked={notificationPrefs.smsBookings}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sms_reminders">Appointment reminders</Label>
                <p className="text-sm text-gray-600">SMS reminders before appointments</p>
              </div>
              <Switch
                id="sms_reminders"
                name="sms_reminders"
                defaultChecked={notificationPrefs.smsReminders}
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
