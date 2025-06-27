import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Tag, ChevronRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/utils/currency';

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  category?: string;
}

interface ServicesListProps {
  services: Service[];
  selectedService: Service | null;
  onServiceSelect: (service: Service) => void;
  currency?: string;
  businessLocation?: {
    country: string;
    currency: string;
  };
}

export const ServicesList: React.FC<ServicesListProps> = ({
  services,
  selectedService,
  onServiceSelect,
  currency = 'KES', // Default to KES for East African businesses
  businessLocation
}) => {
  const displayCurrency = React.useMemo(() => {
    if (businessLocation?.currency) {
      return businessLocation.currency;
    }
    return currency;
  }, [businessLocation, currency]);
  const categories = React.useMemo(() => {
    const grouped = services.reduce((acc, service) => {
      const category = service.category || 'Other Services';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(service);
      return acc;
    }, {} as Record<string, Service[]>);
    
    return Object.entries(grouped);
  }, [services]);

  return (
    <ScrollArea className="h-[calc(100vh-12rem)] pr-4">
      <div className="space-y-8">
        {categories.map(([category, categoryServices]) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="sticky top-0 bg-gray-50/80 backdrop-blur-sm z-10 py-2">
              <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                {category}
                <Badge variant="secondary" className="ml-2">
                  {categoryServices.length}
                </Badge>
              </h3>
            </div>
            
            <div className="grid gap-3 mt-3">
              {categoryServices.map((service) => (
                <motion.div
                  key={service.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedService?.id === service.id
                        ? 'ring-2 ring-blue-500 bg-blue-50/50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => onServiceSelect(service)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {service.name}
                          </h4>
                          {service.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {service.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            <Badge variant="secondary" className="text-xs gap-1">
                              <Clock className="w-3 h-3" />
                              {service.duration_minutes} min
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(service.price, displayCurrency)}
                            </p>
                          </div>
                          <ChevronRight 
                            className={`w-5 h-5 transition-transform duration-200 ${
                              selectedService?.id === service.id ? 'rotate-90' : ''
                            }`}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            
            {/* Add separator between categories */}
            <Separator className="my-6" />
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  );
};
