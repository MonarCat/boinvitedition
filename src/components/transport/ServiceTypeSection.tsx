
import React from 'react';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SERVICE_CLASSES = {
  taxi: ['Standard', 'Premium', 'Executive', 'XL', 'Eco-friendly', 'Luxury', 'Minivan'],
  shuttle: ['14-Seater', '17-Seater', '24-Seater', '33-Seater', 'Airport Shuttle', 'Corporate Shuttle'],
  bus: ['Economy', 'VIP', 'Premium', 'Sleeper', 'Double-Decker', 'Mini-Bus'],
  flight: ['Economy', 'Premium Economy', 'Business', 'First Class'],
  train: ['Economy', 'Business', 'First Class', 'Sleeper', 'Executive']
};

const DEFAULT_SEATS = {
  taxi: 4,
  shuttle: 14,
  bus: 50,
  flight: 180,
  train: 120
};

interface ServiceTypeSectionProps {
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
}

export const ServiceTypeSection = ({ setValue, watch }: ServiceTypeSectionProps) => {
  const serviceType = watch('service_type');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="service_type">Service Type</Label>
        <Select
          value={watch('service_type')}
          onValueChange={(value) => {
            setValue('service_type', value);
            setValue('available_seats', DEFAULT_SEATS[value as keyof typeof DEFAULT_SEATS]);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select service type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="taxi">Taxi Service</SelectItem>
            <SelectItem value="shuttle">Shuttle/Matatu Service</SelectItem>
            <SelectItem value="bus">Bus Service</SelectItem>
            <SelectItem value="train">Train Service</SelectItem>
            <SelectItem value="flight">Flight Service</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="service_class">Service Class</Label>
        <Select
          value={watch('service_class')}
          onValueChange={(value) => setValue('service_class', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select class" />
          </SelectTrigger>
          <SelectContent>
            {SERVICE_CLASSES[serviceType as keyof typeof SERVICE_CLASSES]?.map((cls) => (
              <SelectItem key={cls} value={cls}>{cls}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
