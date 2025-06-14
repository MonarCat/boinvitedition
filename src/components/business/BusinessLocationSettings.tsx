
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { LocationPickerMap } from './LocationPickerMap';

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

  // Fetch business data with proper error handling
  const { data: business, isLoading, error } = useQuery({
    queryKey: ['user-business', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(); // Use maybeSingle to avoid errors when no business found
      
      if (error) {
        console.error('Error fetching business:', error);
        return null;
      }
      return data;
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
        .select('show_on_map, map_description, business_id')
        .eq('business_id', business.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching settings:', error);
        return null;
      }
      return data;
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

  const handleLocationSelect = (location: { lat: number; lng: number }) => {
    setLocationData(prev => ({
      ...prev,
      latitude: location.lat.toString(),
      longitude: location.lng.toString()
    }));
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
          <div className="text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Business Profile Not Found</h3>
              <p className="text-gray-600">Please complete your business setup first.</p>
            </div>
            <Button onClick={() => window.location.href = '/app'}>
              Complete Business Setup
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasLocation = business.latitude && business.longitude;
  const initialMapLocation = hasLocation ? { lat: business.latitude, lng: business.longitude } : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location & Map Settings
        </CardTitle>
        {!hasLocation && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Location Not Set</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Your business won't appear on the public map until you add location coordinates below.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="map" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="map">Select on Map</TabsTrigger>
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            </TabsList>
            
            <TabsContent value="map" className="space-y-4">
              <LocationPickerMap
                initialLocation={initialMapLocation}
                onLocationSelect={handleLocationSelect}
              />
            </TabsContent>
            
            <TabsContent value="manual" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitude *</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={locationData.latitude}
                    onChange={(e) => setLocationData(prev => ({ ...prev, latitude: e.target.value }))}
                    placeholder="e.g., -1.2921"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Required to show on map</p>
                </div>
                
                <div>
                  <Label htmlFor="longitude">Longitude *</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={locationData.longitude}
                    onChange={(e) => setLocationData(prev => ({ ...prev, longitude: e.target.value }))}
                    placeholder="e.g., 36.8219"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Required to show on map</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

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
            disabled={updateLocationMutation.isPending || !locationData.latitude || !locationData.longitude}
            className="w-full md:w-auto"
          >
            {updateLocationMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {hasLocation ? 'Update Location Settings' : 'Save Location & Enable Map Visibility'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
