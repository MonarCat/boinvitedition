import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

interface ServicesListProps {
  services: Service[];
  selectedService: Service | null;
  onServiceSelect: (service: Service) => void;
  currency?: string;
}

export const EnhancedServicesList: React.FC<ServicesListProps> = ({
  services,
  selectedService,
  onServiceSelect,
  currency = 'KES',
}) => {
  return (
    <div>
      <h2 className="text-lg font-semibold p-4">Choose a Service</h2>
      <ul className="divide-y divide-gray-200">
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
      </ul>
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
    <li>
      <button
        className={cn(
          'w-full text-left p-4 hover:bg-gray-50 focus:outline-none transition-colors',
          isSelected && 'bg-blue-50'
        )}
        onClick={onSelect}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative w-full md:w-32 h-32 overflow-hidden rounded-lg">
            <motion.img
              src={images[currentImageIndex]}
              alt={service.name}
              className="w-full h-full object-cover"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
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
                  className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-1"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-1"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-2 py-0.5 rounded-full">
                  {currentImageIndex + 1}/{images.length}
                </div>
              </>
            )}
          </div>
          
          <div className="flex-grow">
            <p className="font-semibold text-gray-800">{service.name}</p>
            <p className="text-sm text-gray-600 line-clamp-3">
              {service.description}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {service.duration_minutes} minutes
            </p>
            
            <p className="font-semibold text-lg text-blue-600 mt-2">
              {currency} {service.price.toLocaleString()}
            </p>
          </div>
        </div>
      </button>
    </li>
  );
};
