
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Car, Users, Calendar, Scissors, Sparkles } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  category?: string;
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
    switch (service.category) {
      case 'taxi':
        return <Car className="w-5 h-5" />;
      case 'shuttle':
        return <Users className="w-5 h-5" />;
      case 'beauty-wellness':
        return <Sparkles className="w-5 h-5" />;
      case 'salons':
        return <Scissors className="w-5 h-5" />;
      case 'spa':
        return <Sparkles className="w-5 h-5" />;
      case 'barbershop':
        return <Scissors className="w-5 h-5" />;
      default:
        return <Calendar className="w-5 h-5" />;
    }
  };

  const getServiceType = (service: Service) => {
    switch (service.category) {
      case 'taxi':
        return 'Taxi';
      case 'shuttle':
        return 'Shuttle';
      case 'beauty-wellness':
        return 'Beauty & Wellness';
      case 'salons':
        return 'Salon';
      case 'spa':
        return 'Spa';
      case 'barbershop':
        return 'Barbershop';
      default:
        return 'General';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'taxi':
      case 'shuttle':
        return 'bg-blue-100 text-blue-800';
      case 'beauty-wellness':
      case 'salons':
      case 'spa':
      case 'barbershop':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
              <Badge className={getCategoryColor(service.category || '')}>
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
