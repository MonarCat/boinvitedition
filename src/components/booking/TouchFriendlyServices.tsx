import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ChevronRight, Check } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  currency?: string;
  category?: 'transport' | 'general';
  image_url?: string;
}

interface TouchFriendlyServicesProps {
  services: Service[];
  selectedService: Service | null;
  onServiceSelect: (service: Service) => void;
  currency: string;
}

export const TouchFriendlyServices: React.FC<TouchFriendlyServicesProps> = ({
  services,
  selectedService,
  onServiceSelect,
  currency
}) => {
  const isMobile = useIsMobile();

  // Group services by category if available
  const servicesByCategory = services.reduce<Record<string, Service[]>>((acc, service) => {
    const category = service.category || 'general';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(service);
    return acc;
  }, {});

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 
      ? `${hours} hr ${remainingMinutes} min`
      : `${hours} hr`;
  };

  const formatPrice = (price: number) => {
    return `KES ${price.toLocaleString()}`;
  };

  const categoryNames = {
    'transport': 'Transportation',
    'general': 'Services'
  };

  return (
    <div className="space-y-6">
      {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
        <div key={category} className="space-y-3">
          <h3 className="font-medium text-lg">
            {categoryNames[category as keyof typeof categoryNames] || 'Services'}
          </h3>
          
          <div className="space-y-3">
            {categoryServices.map(service => {
              const isSelected = selectedService?.id === service.id;
              
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileTap={isMobile ? { scale: 0.98 } : undefined}
                  layout
                >
                  <Card 
                    className={cn(
                      "overflow-hidden border cursor-pointer transition-colors",
                      isSelected 
                        ? "border-blue-500 bg-blue-50 dark:bg-slate-800 dark:border-blue-700" 
                        : "hover:border-gray-300 dark:hover:border-slate-600"
                    )}
                    onClick={() => onServiceSelect(service)}
                  >
                    <div className="p-4 sm:p-5 relative">
                      {isSelected && (
                        <motion.div 
                          className="absolute top-2 right-2 rounded-full bg-blue-500 p-1"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring' }}
                        >
                          <Check className="h-4 w-4 text-white" />
                        </motion.div>
                      )}
                      
                      <div className="flex flex-col">
                        <div className="space-y-1">
                          <div className="flex justify-between items-start">
                            <h3 className={cn(
                              "font-semibold",
                              isMobile ? "text-lg" : "text-base"
                            )}>
                              {service.name}
                            </h3>
                            <span className="font-semibold whitespace-nowrap">
                              {formatPrice(service.price)}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            <span>{formatDuration(service.duration_minutes)}</span>
                          </div>
                        </div>
                        
                        {service.description && (
                          <p className={cn(
                            "text-gray-600 dark:text-gray-400 line-clamp-2 mt-2", 
                            isMobile ? "text-sm" : "text-xs"
                          )}>
                            {service.description}
                          </p>
                        )}
                        
                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 pt-3 border-t"
                          >
                            <Button 
                              className={cn(
                                "w-full mt-2 justify-center gap-1",
                                isMobile && "h-12 text-base"
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                onServiceSelect(service);
                              }}
                            >
                              Continue
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
