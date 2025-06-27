
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
  business_hours: any; // Allow any type for business_hours
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
          // Default to Nairobi, Kenya if geolocation fails
          setUserLocation({ lat: -1.2921, lng: 36.8219 });
        }
      );
    } else {
      // Default to Nairobi, Kenya if geolocation not supported
      setUserLocation({ lat: -1.2921, lng: 36.8219 });
    }
  }, []);

  const fetchBusinesses = async (): Promise<Business[]> => {
    try {
      console.log('Fetching businesses with search query:', searchQuery);
      
      if (userLocation && searchQuery && searchQuery.trim()) {
        // Use the enhanced search function when we have user location and search query
        const { data, error } = await supabase.rpc('search_businesses_by_location', {
          search_lat: userLocation.lat,
          search_lng: userLocation.lng,
          search_radius_km: 50, // 50km radius
          search_query: searchQuery.trim()
        });
        
        if (error) {
          console.error('Error in search function:', error);
          // Fallback to regular query
          return await fetchBusinessesFallback();
        }
        
        console.log('Search function results:', data?.length || 0);
        return (data || []) as Business[];
      } else {
        // Fallback to regular business fetching
        return await fetchBusinessesFallback();
      }
    } catch (error) {
      console.error('Error in fetchBusinesses:', error);
      return await fetchBusinessesFallback();
    }
  };

  const fetchBusinessesFallback = async (): Promise<Business[]> => {
    try {
      // Build the query for discovering all businesses
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
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);
        // Removed show_on_map filter to include all businesses

      // Add search filter if provided
      if (searchQuery && searchQuery.trim()) {
        const searchTerm = searchQuery.trim();
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.limit(100); // Increase limit for better discovery
      
      if (error) {
        console.error('Error fetching businesses fallback:', error);
        return [];
      }
      
      console.log('Fetched businesses (fallback):', data?.length || 0);
      
      // Transform the data to match our interface
      const businesses = (data || []).map((business: any): Business => {
        const result = {
          ...business,
          show_on_map: business.business_settings?.show_on_map ?? true,
          map_description: business.business_settings?.map_description || business.description,
          service_categories: business.services?.map((s: any) => s.category).filter(Boolean) || [],
          service_names: business.services?.map((s: any) => s.name).filter(Boolean) || [],
          total_services: business.services?.length || 0,
          business_hours: business.business_hours || {} // Cast to allow any type
         };

         // Calculate distance if user location is available
        if (userLocation) {
          const distance = calculateDistance(
            userLocation.lat, 
            userLocation.lng, 
            business.latitude, 
            business.longitude
          );
          result.distance_km = distance;
        }

        return result;
      });

      // Sort by distance if available, otherwise by name
      return businesses.sort((a, b) => {
        if (a.distance_km !== undefined && b.distance_km !== undefined) {
          return a.distance_km - b.distance_km;
        }
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      console.error('Error in fetchBusinessesFallback:', error);
      return [];
    }
  };

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = deg2rad(lat2 - lat1);
    const dLng = deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  };

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
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
