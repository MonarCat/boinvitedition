import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Service } from '@/types';

interface ServiceSelectionCardProps {
  services: Service[];
  selectedService: string;
  onServiceSelect: (serviceId: string) => void;
  business?: { currency?: string };
}

export const ServiceSelectionCard: React.FC<ServiceSelectionCardProps> = ({
  services,
  selectedService,
  onServiceSelect,
  business
}) => {
  const formatPrice = (price: number, currency: string) => {
    // Always use KES regardless of the currency passed
    return `KES ${price.toLocaleString()}`;
  };

  return (
    <Card enhanced className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-royal-blue/10 to-transparent">
        <CardTitle className="text-2xl font-bold text-royal-blue dark:text-royal-blue-light">Select a Service</CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">Choose from the list of available services below.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service) => (
            <div
              key={service.id}
              className={cn(
                "p-4 border rounded-lg cursor-pointer transition-all duration-200 ease-in-out transform",
                "hover:shadow-lg hover:-translate-y-1",
                "dark:border-slate-700 dark:hover:border-blue-500",
                selectedService === service.id
                  ? "border-royal-blue bg-royal-blue/10 dark:bg-royal-blue/20 ring-2 ring-royal-blue"
                  : "border-slate-200 bg-white dark:bg-slate-800 hover:border-royal-blue/30"
              )}
              onClick={() => onServiceSelect(service.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">{service.name}</h3>
                <Badge 
                  variant="secondary" 
                  className="bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-200 text-sm font-bold"
                >
                  {formatPrice(service.price, service.currency || business?.currency || 'KES')}
                </Badge>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{service.description}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{service.duration_minutes} minutes</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
