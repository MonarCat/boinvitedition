
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BusinessDiscoveryGoogleMap } from './GoogleMap';

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

export const BusinessMap = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
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

  // Fetch businesses using the enhanced discovery view
  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ['businesses-map', searchQuery, userLocation],
    queryFn: async () => {
      if (userLocation && searchQuery) {
        // Use location-based search function for better results
        const { data, error } = await supabase
          .rpc('search_businesses_by_location', {
            search_lat: userLocation.lat,
            search_lng: userLocation.lng,
            search_radius_km: 50,
            search_query: searchQuery || null
          });
        
        if (error) {
          console.error('Error fetching businesses:', error);
          return [];
        }
        return data || [];
      } else {
        // Fallback to regular query
        let query = supabase
          .from('business_discovery')
          .select('*')
          .order('average_rating', { ascending: false });

        if (searchQuery) {
          query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        }

        const { data, error } = await query.limit(50);
        if (error) {
          console.error('Error fetching businesses:', error);
          return [];
        }
        return data || [];
      }
    },
    enabled: true,
  });

  const handleBusinessSelect = (business: Business) => setSelectedBusiness(business);

  const handleBookNow = (businessId: string) => {
    navigate(`/booking/${businessId}`);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white dark:bg-gray-900 border-b p-4">
        <div className="max-w-md mx-auto">
          <Input
            type="text"
            placeholder="Search for services (barber, salon, massage, gym, etc.)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex-1 flex bg-gray-100 dark:bg-gray-900">
        <div className="flex-1 relative">
          <BusinessDiscoveryGoogleMap
            businesses={businesses}
            userLocation={userLocation}
            onBusinessSelect={handleBusinessSelect}
            selectedBusiness={selectedBusiness}
            onMapSettingsClick={() => {
              window.alert("Map settings coming soon!");
            }}
          />
        </div>

        <div className="w-96 bg-white border-l overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">
              {searchQuery ? `Results for "${searchQuery}"` : 'Nearby Businesses'}
              {!isLoading && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({businesses.length} found)
                </span>
              )}
            </h2>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 h-24 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {businesses.map((business) => (
                  <Card
                    key={business.id}
                    className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedBusiness?.id === business.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => handleBusinessSelect(business)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {business.logo_url ? (
                          <img
                            src={business.logo_url}
                            alt={business.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <MapPin className="h-6 w-6 text-gray-400" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-sm truncate">{business.name}</h3>
                            {business.is_verified && (
                              <Badge variant="secondary" className="text-xs">Verified</Badge>
                            )}
                          </div>

                          {business.average_rating && (
                            <div className="flex items-center gap-1 mb-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs text-gray-600">
                                {business.average_rating.toFixed(1)} ({business.total_reviews} reviews)
                              </span>
                            </div>
                          )}

                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                            {business.map_description || business.description}
                          </p>

                          {business.service_categories && business.service_categories.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {business.service_categories.slice(0, 2).map((category, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {category}
                                </Badge>
                              ))}
                              {business.service_categories.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{business.service_categories.length - 2} more
                                </Badge>
                              )}
                            </div>
                          )}

                          {business.distance_km !== undefined && (
                            <p className="text-xs text-gray-500 mb-2">
                              {business.distance_km.toFixed(1)} km away
                            </p>
                          )}

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBookNow(business.id);
                              }}
                            >
                              Book Now
                            </Button>
                            {business.phone && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(`tel:${business.phone}`);
                                }}
                              >
                                <Phone className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {businesses.length === 0 && !isLoading && (
                  <div className="text-center py-8">
                    <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No businesses found</h3>
                    <p className="text-gray-600">
                      {searchQuery
                        ? `No businesses match "${searchQuery}" in your area.`
                        : 'No businesses available in your area yet.'
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
