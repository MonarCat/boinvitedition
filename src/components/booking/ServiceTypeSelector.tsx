
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Car, Users, Calendar, Scissors, Sparkles, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'beauty-wellness':
      case 'salons':
      case 'spa':
      case 'barbershop':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCardGradient = (category: string) => {
    switch (category) {
      case 'taxi':
      case 'shuttle':
        return 'from-blue-50 to-blue-100';
      case 'beauty-wellness':
      case 'salons':
      case 'spa':
      case 'barbershop':
        return 'from-pink-50 to-pink-100';
      default:
        return 'from-gray-50 to-gray-100';
    }
  };

  return (
    <div className="space-y-3">
      {services.map(service => (
        <Card 
          key={service.id} 
          className={cn(
            "cursor-pointer hover:shadow-lg transition-all duration-300 border-0 overflow-hidden",
            "service-card mobile-card ripple"
          )}
          onClick={() => onServiceSelect(service)}
        >
          <div className={cn(
            "absolute inset-0 bg-gradient-to-r opacity-5",
            getCardGradient(service.category || '')
          )} />
          
          <CardHeader className="pb-2 relative">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className={cn(
                  "p-2 rounded-full",
                  service.category === 'taxi' || service.category === 'shuttle' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-pink-100 text-pink-600'
                )}>
                  {getServiceIcon(service)}
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-gray-900">{service.name}</span>
                  <Badge className={cn("ml-2 text-xs border", getCategoryColor(service.category || ''))}>
                    {getServiceType(service)}
                  </Badge>
                </div>
              </CardTitle>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </CardHeader>
          
          <CardContent className="pt-0 relative">
            <div className="space-y-3">
              {service.description && (
                <p className="text-sm text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 font-medium">Duration</div>
                    <div className="text-sm font-semibold text-gray-700">
                      {service.duration_minutes} min
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-xs text-gray-500 font-medium">Price</div>
                  <div className="text-xl font-bold text-green-600">
                    KSh {service.price.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
