
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

export const useAllBusinessesData = (searchQuery: string) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Default to Nairobi if location access is denied
          setUserLocation({ lat: -1.2921, lng: 36.8219 });
        }
      );
    } else {
      // Default to Nairobi if geolocation is not supported
      setUserLocation({ lat: -1.2921, lng: 36.8219 });
    }
  }, []);

  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ['all-businesses', searchQuery],
    queryFn: async () => {
      console.log('Fetching all businesses for Find Services...');
      
      let query = supabase
        .from('businesses')
        .select(`
          id,
          name,
          description,
          address,
          city,
          country,
          phone,
          email,
          website,
          logo_url,
          featured_image_url,
          latitude,
          longitude,
          average_rating,
          total_reviews,
          business_hours,
          is_verified,
          service_radius_km,
          currency,
          services:services(
            id,
            name,
            category,
            price,
            currency
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      // Apply search filter if provided
      if (searchQuery && searchQuery.trim()) {
        query = query.or(`
          name.ilike.%${searchQuery}%,
          description.ilike.%${searchQuery}%,
          city.ilike.%${searchQuery}%,
          address.ilike.%${searchQuery}%
        `);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching businesses:', error);
        throw error;
      }

      // Transform data to include service categories and other required fields
      const transformedBusinesses = data?.map(business => ({
        ...business,
        service_categories: business.services?.map((service: any) => service.category).filter(Boolean) || [],
        service_names: business.services?.map((service: any) => service.name).filter(Boolean) || [],
        total_services: business.services?.length || 0,
        map_description: business.description || `${business.name} - Professional services`,
        show_on_map: true,
        distance_km: userLocation ? calculateDistance(
          userLocation.lat,
          userLocation.lng,
          business.latitude || 0,
          business.longitude || 0
        ) : null
      })) || [];

      console.log(`Found ${transformedBusinesses.length} businesses for Find Services`);
      return transformedBusinesses;
    },
    enabled: true, // Always fetch businesses
  });

  return {
    businesses,
    isLoading,
    userLocation
  };
};

// Helper function to calculate distance
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in kilometers
  return Math.round(d * 10) / 10; // Round to 1 decimal place
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}
