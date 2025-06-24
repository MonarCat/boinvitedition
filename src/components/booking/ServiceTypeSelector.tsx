
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scissors, Car, Calendar } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  category?: string;
  is_transport_service?: boolean;
}

interface ServiceTypeSelectorProps {
  services: Service[];
  onServiceSelect: (service: Service) => void;
}

export const ServiceTypeSelector: React.FC<ServiceTypeSelectorProps> = ({
  services,
  onServiceSelect
}) => {
  const getServiceIcon = (service: Service) => {
    if (service.is_transport_service) {
      return <Car className="w-5 h-5" />;
    }
    if (service.category?.toLowerCase().includes('hair') || 
        service.category?.toLowerCase().includes('beauty') ||
        service.category?.toLowerCase().includes('salon')) {
      return <Scissors className="w-5 h-5" />;
    }
    return <Calendar className="w-5 h-5" />;
  };

  const getServiceType = (service: Service) => {
    if (service.is_transport_service) return 'Transport';
    if (service.category?.toLowerCase().includes('hair') || 
        service.category?.toLowerCase().includes('beauty') ||
        service.category?.toLowerCase().includes('salon')) return 'Salon';
    return 'General';
  };

  return (
    <div className="space-y-4">
      {services.map(service => (
        <Card 
          key={service.id} 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onServiceSelect(service)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {getServiceIcon(service)}
                {service.name}
              </CardTitle>
              <Badge variant="secondary">
                {getServiceType(service)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {service.description && (
                <p className="text-sm text-gray-600">{service.description}</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {service.duration_minutes} minutes
                </span>
                <span className="font-semibold text-lg">
                  KSh {service.price.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
