
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Bus, Car, Plane } from 'lucide-react';
import { toast } from 'sonner';

interface Route {
  id: string;
  origin: string;
  destination: string;
  price: number;
  duration: string;
  departure_time: string;
}

interface TransportDetails {
  service_type: 'matatu' | 'bus' | 'taxi' | 'flight';
  vehicle_info: {
    sacco_name?: string;
    plate_number?: string;
    seat_count?: number;
    driver_phone?: string;
    vehicle_model?: string;
  };
  routes: Route[];
  booking_policy: string;
  cancellation_policy: string;
}

interface EnhancedTransportFormProps {
  onSave: (transportDetails: TransportDetails) => void;
  initialData?: TransportDetails;
  isLoading?: boolean;
}

export const EnhancedTransportForm: React.FC<EnhancedTransportFormProps> = ({
  onSave,
  initialData,
  isLoading = false
}) => {
  const [transportDetails, setTransportDetails] = useState<TransportDetails>(
    initialData || {
      service_type: 'matatu',
      vehicle_info: {
        sacco_name: '',
        plate_number: '',
        seat_count: 14,
        driver_phone: '',
        vehicle_model: ''
      },
      routes: [],
      booking_policy: 'Booking must be made at least 30 minutes before departure.',
      cancellation_policy: 'Free cancellation up to 2 hours before departure.'
    }
  );

  const addRoute = () => {
    const newRoute: Route = {
      id: Date.now().toString(),
      origin: '',
      destination: '',
      price: 0,
      duration: '',
      departure_time: ''
    };
    
    setTransportDetails(prev => ({
      ...prev,
      routes: [...prev.routes, newRoute]
    }));
  };

  const updateRoute = (routeId: string, field: keyof Route, value: string | number) => {
    setTransportDetails(prev => ({
      ...prev,
      routes: prev.routes.map(route =>
        route.id === routeId ? { ...route, [field]: value } : route
      )
    }));
  };

  const removeRoute = (routeId: string) => {
    setTransportDetails(prev => ({
      ...prev,
      routes: prev.routes.filter(route => route.id !== routeId)
    }));
  };

  const updateVehicleInfo = (field: keyof TransportDetails['vehicle_info'], value: string | number) => {
    setTransportDetails(prev => ({
      ...prev,
      vehicle_info: {
        ...prev.vehicle_info,
        [field]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (transportDetails.routes.length === 0) {
      toast.error('Please add at least one route');
      return;
    }

    const incompleteRoute = transportDetails.routes.find(
      route => !route.origin || !route.destination || !route.price || !route.departure_time
    );

    if (incompleteRoute) {
      toast.error('Please complete all route information');
      return;
    }

    onSave(transportDetails);
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'matatu':
      case 'bus':
        return <Bus className="w-4 h-4" />;
      case 'taxi':
        return <Car className="w-4 h-4" />;
      case 'flight':
        return <Plane className="w-4 h-4" />;
      default:
        return <Bus className="w-4 h-4" />;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Service Type */}
      <Card>
        <CardHeader>
          <CardTitle>Transport Service Type</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={transportDetails.service_type}
            onValueChange={(value: 'matatu' | 'bus' | 'taxi' | 'flight') =>
              setTransportDetails(prev => ({ ...prev, service_type: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="matatu">
                <div className="flex items-center gap-2">
                  <Bus className="w-4 h-4" />
                  Matatu
                </div>
              </SelectItem>
              <SelectItem value="bus">
                <div className="flex items-center gap-2">
                  <Bus className="w-4 h-4" />
                  Bus
                </div>
              </SelectItem>
              <SelectItem value="taxi">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  Taxi/Private Car
                </div>
              </SelectItem>
              <SelectItem value="flight">
                <div className="flex items-center gap-2">
                  <Plane className="w-4 h-4" />
                  Flight
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Vehicle Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getServiceIcon(transportDetails.service_type)}
            Vehicle Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(transportDetails.service_type === 'matatu' || transportDetails.service_type === 'bus') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sacco_name">Sacco/Company Name</Label>
                <Input
                  id="sacco_name"
                  value={transportDetails.vehicle_info.sacco_name || ''}
                  onChange={(e) => updateVehicleInfo('sacco_name', e.target.value)}
                  placeholder="e.g., 2NK, North Rift Shuttles"
                />
              </div>
              
              <div>
                <Label htmlFor="plate_number">Vehicle Plate Number</Label>
                <Input
                  id="plate_number"
                  value={transportDetails.vehicle_info.plate_number || ''}
                  onChange={(e) => updateVehicleInfo('plate_number', e.target.value)}
                  placeholder="e.g., KCA 123A"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="seat_count">Passenger Capacity</Label>
              <Input
                id="seat_count"
                type="number"
                value={transportDetails.vehicle_info.seat_count || ''}
                onChange={(e) => updateVehicleInfo('seat_count', parseInt(e.target.value))}
                placeholder="14"
                min="1"
              />
            </div>

            <div>
              <Label htmlFor="driver_phone">Driver/Contact Phone</Label>
              <Input
                id="driver_phone"
                type="tel"
                value={transportDetails.vehicle_info.driver_phone || ''}
                onChange={(e) => updateVehicleInfo('driver_phone', e.target.value)}
                placeholder="254712345678"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="vehicle_model">Vehicle Model (Optional)</Label>
            <Input
              id="vehicle_model"
              value={transportDetails.vehicle_info.vehicle_model || ''}
              onChange={(e) => updateVehicleInfo('vehicle_model', e.target.value)}
              placeholder="e.g., Toyota Hiace, Nissan Matatu"
            />
          </div>
        </CardContent>
      </Card>

      {/* Routes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Routes & Schedules</CardTitle>
            <Button type="button" onClick={addRoute} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Route
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {transportDetails.routes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bus className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No routes added yet</p>
              <Button type="button" onClick={addRoute} variant="outline" className="mt-2">
                Add Your First Route
              </Button>
            </div>
          ) : (
            transportDetails.routes.map((route, index) => (
              <Card key={route.id} className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Route {index + 1}</Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRoute(route.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Origin</Label>
                      <Input
                        value={route.origin}
                        onChange={(e) => updateRoute(route.id, 'origin', e.target.value)}
                        placeholder="Starting point"
                      />
                    </div>
                    <div>
                      <Label>Destination</Label>
                      <Input
                        value={route.destination}
                        onChange={(e) => updateRoute(route.id, 'destination', e.target.value)}
                        placeholder="End point"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Price (KSh)</Label>
                      <Input
                        type="number"
                        value={route.price}
                        onChange={(e) => updateRoute(route.id, 'price', parseFloat(e.target.value))}
                        placeholder="1200"
                        min="0"
                      />
                    </div>
                    <div>
                      <Label>Duration</Label>
                      <Input
                        value={route.duration}
                        onChange={(e) => updateRoute(route.id, 'duration', e.target.value)}
                        placeholder="4 hours"
                      />
                    </div>
                    <div>
                      <Label>Departure Time</Label>
                      <Input
                        type="time"
                        value={route.departure_time}
                        onChange={(e) => updateRoute(route.id, 'departure_time', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Policies */}
      <Card>
        <CardHeader>
          <CardTitle>Booking & Cancellation Policies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="booking_policy">Booking Policy</Label>
            <Textarea
              id="booking_policy"
              value={transportDetails.booking_policy}
              onChange={(e) => setTransportDetails(prev => ({
                ...prev,
                booking_policy: e.target.value
              }))}
              placeholder="Describe your booking requirements..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="cancellation_policy">Cancellation Policy</Label>
            <Textarea
              id="cancellation_policy"
              value={transportDetails.cancellation_policy}
              onChange={(e) => setTransportDetails(prev => ({
                ...prev,
                cancellation_policy: e.target.value
              }))}
              placeholder="Describe your cancellation terms..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Transport Service'}
      </Button>
    </form>
  );
};
