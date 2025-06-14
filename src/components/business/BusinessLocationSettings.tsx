import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const BusinessLocationSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [locationData, setLocationData] = useState({
    latitude: '',
    longitude: '',
    service_radius_km: '10',
    show_on_map: true,
    map_description: ''
  });

  // Extend business/settings return types to avoid type errors
  // NOTE: Type declarations should be updated based on the database schema!
  type BusinessData = {
    id: string;
    latitude?: number | null;
    longitude?: number | null;
    service_radius_km?: number | null;
    user_id: string;
    name: string;
    description: string;
    address: string;
    city: string;
    country: string;
    phone: string;
    email: string;
    website: string;
    logo_url: string;
    featured_image_url: string;
    average_rating: number;
    total_reviews: number;
    business_hours: any;
    is_verified: boolean;
    currency: string;
  };
  
  type SettingsData = {
    show_on_map?: boolean | null;
    map_description?: string | null;
    business_id: string;
  };

  // Fetch business data
  const { data: business, isLoading } = useQuery({
    queryKey: ['user-business', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('businesses')
        .select('id, latitude, longitude, service_radius_km')
        .eq('user_id', user.id)
        .single();
      if (error || !data) return null;
      return data as BusinessData;
    },
    enabled: !!user,
  });

  // Fetch business settings
  const { data: settings } = useQuery({
    queryKey: ['business-settings', business?.id],
    queryFn: async () => {
      if (!business) return null;
      const { data, error } = await supabase
        .from('business_settings')
        .select('show_on_map, map_description')
        .eq('business_id', business.id)
        .single();
      if (error || !data) return null;
      return data as SettingsData;
    },
    enabled: !!business,
  });

  // Update location data when business data loads
  React.useEffect(() => {
    if (business) {
      setLocationData({
        latitude: business.latitude?.toString() || '',
        longitude: business.longitude?.toString() || '',
        service_radius_km: business.service_radius_km?.toString() || '10',
        show_on_map: settings?.show_on_map ?? true,
        map_description: settings?.map_description || ''
      });
    }
  }, [business, settings]);

  const updateLocationMutation = useMutation({
    mutationFn: async (data: typeof locationData) => {
      if (!business) throw new Error('No business found');

      // Update business location
      const businessUpdate: any = {
        service_radius_km: parseInt(data.service_radius_km)
      };
      
      if (data.latitude) businessUpdate.latitude = parseFloat(data.latitude);
      if (data.longitude) businessUpdate.longitude = parseFloat(data.longitude);

      const { error: businessError } = await supabase
        .from('businesses')
        .update(businessUpdate)
        .eq('id', business.id);

      if (businessError) throw businessError;

      // Update or create business settings
      const { error: settingsError } = await supabase
        .from('business_settings')
        .upsert({
          business_id: business.id,
          show_on_map: data.show_on_map,
          map_description: data.map_description
        }, {
          onConflict: 'business_id'
        });

      if (settingsError) throw settingsError;
    },
    onSuccess: () => {
      toast.success('Location settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['user-business'] });
      queryClient.invalidateQueries({ queryKey: ['business-settings'] });
    },
    onError: (error) => {
      console.error('Error updating location:', error);
      toast.error('Failed to update location settings');
    },
  });

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }));
          toast.success('Current location detected');
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Could not get current location');
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateLocationMutation.mutate(locationData);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!business) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-600">Please set up your business first.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location & Map Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={locationData.latitude}
                onChange={(e) => setLocationData(prev => ({ ...prev, latitude: e.target.value }))}
                placeholder="e.g., -1.2921"
              />
            </div>
            
            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={locationData.longitude}
                onChange={(e) => setLocationData(prev => ({ ...prev, longitude: e.target.value }))}
                placeholder="e.g., 36.8219"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={getCurrentLocation}>
              <MapPin className="h-4 w-4 mr-2" />
              Use Current Location
            </Button>
          </div>

          <div>
            <Label htmlFor="service_radius">Service Radius (km)</Label>
            <Input
              id="service_radius"
              type="number"
              min="1"
              max="100"
              value={locationData.service_radius_km}
              onChange={(e) => setLocationData(prev => ({ ...prev, service_radius_km: e.target.value }))}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="show_on_map"
              checked={locationData.show_on_map}
              onCheckedChange={(checked) => setLocationData(prev => ({ ...prev, show_on_map: checked }))}
            />
            <Label htmlFor="show_on_map">Show business on public map</Label>
          </div>

          <div>
            <Label htmlFor="map_description">Map Description</Label>
            <Textarea
              id="map_description"
              value={locationData.map_description}
              onChange={(e) => setLocationData(prev => ({ ...prev, map_description: e.target.value }))}
              placeholder="Brief description for map display..."
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            disabled={updateLocationMutation.isPending}
            className="w-full md:w-auto"
          >
            {updateLocationMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Location Settings
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
