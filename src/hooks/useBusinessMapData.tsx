
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Business {
  id: string;
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
  latitude: number;
  longitude: number;
  average_rating: number;
  total_reviews: number;
  business_hours: any;
  is_verified: boolean;
  service_radius_km: number;
  currency: string;
  show_on_map: boolean;
  map_description: string;
  service_categories: string[];
  service_names: string[];
  total_services: number;
  distance_km?: number;
}

export const useBusinessMapData = (searchQuery: string) => {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          setUserLocation({ lat: -1.2921, lng: 36.8219 });
        }
      );
    } else {
      setUserLocation({ lat: -1.2921, lng: 36.8219 });
    }
  }, []);

  const fetchBusinesses = async (): Promise<Business[]> => {
    try {
      console.log('Fetching businesses with search query:', searchQuery);
      
      // Build the query
      let query = supabase
        .from('businesses')
        .select(`
          id, name, description, address, city, country, phone, email, website,
          logo_url, featured_image_url, latitude, longitude, average_rating,
          total_reviews, business_hours, is_verified, service_radius_km, currency,
          business_settings!inner(show_on_map, map_description),
          services!inner(name, category)
        `)
        .eq('is_active', true)
        .eq('business_settings.show_on_map', true);

      // Add search filter if provided
      if (searchQuery && searchQuery.trim()) {
        const searchTerm = searchQuery.trim();
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,services.name.ilike.%${searchTerm}%,services.category.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.limit(50);
      
      if (error) {
        console.error('Error fetching businesses:', error);
        return [];
      }
      
      console.log('Fetched businesses:', data?.length || 0);
      
      // Transform the data to match our interface
      return (data || []).map((business: any) => ({
        ...business,
        show_on_map: business.business_settings?.show_on_map ?? true,
        map_description: business.business_settings?.map_description || business.description,
        service_categories: business.services?.map((s: any) => s.category).filter(Boolean) || [],
        service_names: business.services?.map((s: any) => s.name).filter(Boolean) || [],
        total_services: business.services?.length || 0
      }));
    } catch (error) {
      console.error('Error in fetchBusinesses:', error);
      return [];
    }
  };

  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ['businesses-map', searchQuery, userLocation],
    queryFn: fetchBusinesses,
    enabled: true,
  });

  return {
    businesses,
    isLoading,
    userLocation
  };
};
