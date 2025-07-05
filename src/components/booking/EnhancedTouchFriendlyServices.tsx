import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  currency?: string;
  service_images?: string[];
  image_url?: string;
}

interface TouchFriendlyServicesProps {
  services: Service[];
  selectedService: Service | null;
  onServiceSelect: (service: Service) => void;
  currency?: string;
}

export const EnhancedTouchFriendlyServices: React.FC<TouchFriendlyServicesProps> = ({
  services,
  selectedService,
  onServiceSelect,
  currency = 'KES',
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold px-1">Available Services</h2>
      <div className="grid grid-cols-1 gap-4">
        {services.map((service, index) => (
          <ServiceCard
            key={service.id}
            service={service}
            index={index}
            isSelected={selectedService?.id === service.id}
            onSelect={() => onServiceSelect(service)}
            currency={currency}
          />
        ))}
      </div>
    </div>
  );
};

interface ServiceCardProps {
  service: Service;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  currency: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  index,
  isSelected,
  onSelect,
  currency
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Handle service images (from array) or legacy image_url
  const images = service.service_images && service.service_images.length > 0 
    ? service.service_images 
    : service.image_url 
      ? [service.image_url] 
      : ['/placeholder.svg'];
  
  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300",
        isSelected ? "ring-2 ring-blue-500" : ""
      )}
      onClick={onSelect}
    >
      <div className="relative aspect-video bg-gray-100">
        <motion.img
          src={images[currentImageIndex]}
          alt={service.name}
          className="w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.05 }}
          onError={(e) => {
            console.error('Image failed to load:', images[currentImageIndex]);
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
        
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-1.5"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-1.5"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-0.5 rounded-full">
              {currentImageIndex + 1}/{images.length}
            </div>
          </>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-3">
          <Badge className="absolute top-2 left-2 bg-blue-600">
            {currency} {service.price.toLocaleString()}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg text-gray-900">{service.name}</h3>
        
        <div className="flex items-center text-gray-500 mt-1 mb-2">
          <Clock className="h-4 w-4 mr-1" />
          <span className="text-sm">{service.duration_minutes} minutes</span>
          
          <Calendar className="h-4 w-4 ml-4 mr-1" />
          <span className="text-sm">Book now</span>
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-2">
          {service.description}
        </p>
        
        {isSelected && (
          <Badge className="mt-3 bg-blue-100 text-blue-800 hover:bg-blue-200">
            Selected
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};
