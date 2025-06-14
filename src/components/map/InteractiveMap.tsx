
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Business {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  average_rating?: number;
  total_reviews?: number;
  logo_url?: string;
  description?: string;
  service_categories?: string[];
}

interface InteractiveMapProps {
  businesses: Business[];
  userLocation: { lat: number; lng: number } | null;
  onBusinessSelect: (business: Business) => void;
  selectedBusiness: Business | null;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  businesses,
  userLocation,
  onBusinessSelect,
  selectedBusiness
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(true);
  const markers = useRef<mapboxgl.Marker[]>([]);

  // Initialize map when token is provided
  useEffect(() => {
    if (!mapboxToken || !mapContainer.current || map.current) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      const center: [number, number] = userLocation 
        ? [userLocation.lng, userLocation.lat]
        : [36.8219, -1.2921]; // Default to Nairobi

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center,
        zoom: 12,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add user location marker if available
      if (userLocation) {
        const userMarker = new mapboxgl.Marker({ color: '#3B82F6' })
          .setLngLat([userLocation.lng, userLocation.lat])
          .setPopup(new mapboxgl.Popup().setText('Your Location'))
          .addTo(map.current);
      }

      setShowTokenInput(false);
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [mapboxToken, userLocation]);

  // Update business markers
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add business markers
    businesses.forEach(business => {
      if (!business.latitude || !business.longitude) return;

      const el = document.createElement('div');
      el.className = 'business-marker';
      el.style.cssText = `
        background-color: #EF4444;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        font-weight: bold;
      `;
      
      if (selectedBusiness?.id === business.id) {
        el.style.backgroundColor = '#10B981';
        el.style.transform = 'scale(1.2)';
      }

      const marker = new mapboxgl.Marker(el)
        .setLngLat([business.longitude, business.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold;">${business.name}</h3>
              ${business.average_rating ? `
                <div style="margin-bottom: 4px;">
                  <span style="color: #FCD34D;">★</span> ${business.average_rating.toFixed(1)}
                  ${business.total_reviews ? ` (${business.total_reviews} reviews)` : ''}
                </div>
              ` : ''}
              ${business.description ? `
                <p style="margin: 0; font-size: 12px; color: #666; max-width: 200px;">${business.description.substring(0, 100)}...</p>
              ` : ''}
            </div>
          `)
        )
        .addTo(map.current);

      // Add click handler
      el.addEventListener('click', () => {
        onBusinessSelect(business);
      });

      markers.current.push(marker);
    });
  }, [businesses, selectedBusiness, onBusinessSelect]);

  // Fly to selected business
  useEffect(() => {
    if (selectedBusiness && map.current) {
      map.current.flyTo({
        center: [selectedBusiness.longitude, selectedBusiness.latitude],
        zoom: 15,
        duration: 1000
      });
    }
  }, [selectedBusiness]);

  if (showTokenInput) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <Card className="w-96">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <h3 className="text-lg font-semibold">Setup Interactive Map</h3>
              <p className="text-sm text-gray-600 mt-2">
                Enter your Mapbox public token to enable the interactive map feature.
                Get your token at{' '}
                <a 
                  href="https://account.mapbox.com/access-tokens/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  mapbox.com
                </a>
              </p>
            </div>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="pk.eyJ1IjoieW91cnVzZXJuYW1lIiwi..."
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
              />
              <Button 
                onClick={() => setMapboxToken(mapboxToken)}
                disabled={!mapboxToken || !mapboxToken.startsWith('pk.')}
                className="w-full"
              >
                Initialize Map
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Map controls overlay */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTokenInput(true)}
          className="bg-white/90 backdrop-blur-sm"
        >
          <Settings className="h-4 w-4 mr-2" />
          Map Settings
        </Button>
      </div>
    </div>
  );
};
