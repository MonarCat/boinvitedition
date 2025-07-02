import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, DollarSign, Clock } from 'lucide-react';
import { toast } from 'sonner';

// Using only Kenyan Shilling as the application currency
export const CURRENCIES = [
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', country: 'Kenya' }
];

// Using only Nairobi as the default timezone
const GLOBAL_TIMEZONES = [
  { value: 'Africa/Nairobi', label: 'EAT - East Africa Time (Kenya)' }
];

export const GlobalBusinessSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: business } = useQuery({
    queryKey: ['user-business', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: settings } = useQuery({
    queryKey: ['business-settings', business?.id],
    queryFn: async () => {
      if (!business) return null;
      const { data, error } = await supabase
        .from('business_settings')
        .select('*')
        .eq('business_id', business.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!business,
  });

  const [formData, setFormData] = useState({
    currency: 'KES', // Always use KES as the default currency
    timezone: 'Africa/Nairobi', // Always use Nairobi as the default timezone
    country: business?.country || 'Kenya', // Default to Kenya
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async () => {
      if (!business) throw new Error('No business found');

      // Update business to use KES currency and Kenya country
      const { error: businessError } = await supabase
        .from('businesses')
        .update({
          currency: 'KES', // Always use KES
          country: 'Kenya' // Always use Kenya
        })
        .eq('id', business.id);

      if (businessError) throw businessError;

      // Update business settings to use Nairobi timezone
      const { error: settingsError } = await supabase
        .from('business_settings')
        .upsert({
          business_id: business.id,
          timezone: 'Africa/Nairobi', // Always use Nairobi timezone
          currency: 'KES' // Always use KES
        }, {
          onConflict: 'business_id'
        });

      if (settingsError) throw settingsError;
    },
    onSuccess: () => {
      toast.success('Global settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['user-business'] });
      queryClient.invalidateQueries({ queryKey: ['business-settings'] });
    },
    onError: (error) => {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate();
  };

  const selectedCurrency = CURRENCIES.find(c => c.code === formData.currency);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Kenya Business Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currency">Business Currency</Label>
              <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">KSh - Kenyan Shilling (Kenya)</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Symbol: KSh • Kenya
              </p>
            </div>

            <div>
              <Label htmlFor="timezone">Business Timezone</Label>
              <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">EAT - East Africa Time (Kenya)</span>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="country">Country/Region</Label>
            <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Kenya</span>
            </div>
          </div>

          <Button type="submit" disabled={updateSettingsMutation.isPending}>
            {updateSettingsMutation.isPending ? 'Updating...' : 'Apply Kenya Business Settings'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
