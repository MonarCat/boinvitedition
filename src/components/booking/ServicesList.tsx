import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  currency?: string;
  image_url?: string;
}

interface ServicesListProps {
  services: Service[];
  selectedService: Service | null;
  onServiceSelect: (service: Service) => void;
  currency?: string;
}

export const ServicesList: React.FC<ServicesListProps> = ({
  services,
  selectedService,
  onServiceSelect,
  currency = 'KES', // Default to KES for East African businesses
}) => {
  return (
    <div>
      <h2 className="text-lg font-semibold p-4">Choose a Service</h2>
      <ul className="divide-y divide-gray-200">
        {services.map((service, index) => (
          <li key={service.id}>
            <button
              className={cn(
                'w-full text-left p-4 hover:bg-gray-50 focus:outline-none transition-colors',
                selectedService?.id === service.id && 'bg-blue-50'
              )}
              onClick={() => onServiceSelect(service)}
            >
              <div className="flex items-center gap-4">
                <motion.img
                  src={service.image_url || '/placeholder.svg'}
                  alt={service.name}
                  className="w-20 h-20 rounded-lg object-cover shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                />
                <div className="flex-grow">
                  <p className="font-semibold text-gray-800">{service.name}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {service.description}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {service.duration_minutes} minutes
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg text-blue-600">
                    {currency} {service.price}
                  </p>
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
