
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SERVICE_CATEGORIES } from './ServiceCategories';
import { ServiceImageUpload } from './ServiceImageUpload';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Service name must be at least 2 characters.',
  }),
  description: z.string().optional(),
  price: z.string().refine(value => !isNaN(parseFloat(value)), {
    message: 'Price must be a valid number.',
  }),
  duration_minutes: z.string().refine(value => !isNaN(parseInt(value)) && parseInt(value) > 0, {
    message: 'Duration must be a valid number greater than 0.',
  }),
  currency: z.string().min(1, {
    message: 'Currency is required.',
  }),
  category: z.string().min(1, {
    message: 'Category is required.',
  }),
  is_transport_service: z.boolean().default(false).optional(),
  service_type: z.string().optional(),
  route: z.string().optional(),
  departure_time: z.string().optional(),
  arrival_time: z.string().optional(),
  vehicle_capacity: z.string().optional(),
  pickup_location: z.string().optional(),
  dropoff_location: z.string().optional(),
  external_booking_url: z.string().optional(),
  booking_instructions: z.string().optional()
});

interface EnhancedServiceFormProps {
  service?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const EnhancedServiceForm: React.FC<EnhancedServiceFormProps> = ({
  service,
  onSuccess,
  onCancel
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: service?.name || '',
      description: service?.description || '',
      price: service?.price?.toString() || '',
      duration_minutes: service?.duration_minutes?.toString() || '',
      currency: service?.currency || 'KES',
      category: service?.category || '',
      is_transport_service: service?.is_transport_service || false,
      service_type: service?.transport_details?.service_type || '',
      route: service?.transport_details?.route || '',
      departure_time: service?.transport_details?.departure_time || '',
      arrival_time: service?.transport_details?.arrival_time || '',
      vehicle_capacity: service?.transport_details?.vehicle_capacity || '',
      pickup_location: service?.transport_details?.pickup_location || '',
      dropoff_location: service?.transport_details?.dropoff_location || '',
      external_booking_url: service?.transport_details?.external_booking_url || '',
      booking_instructions: service?.transport_details?.booking_instructions || ''
    },
  });
  
  const [serviceImages, setServiceImages] = useState<string[]>(
    service?.service_images || []
  );
  
  const onSubmit = async (data: any) => {
    console.log('Form submission data:', data);
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: business } = await supabase
        .from('businesses')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!business) throw new Error('Business not found');

      const serviceData = {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        duration_minutes: parseInt(data.duration_minutes),
        currency: data.currency,
        category: data.category,
        business_id: business.id,
        is_transport_service: data.category?.includes('transport') || false,
        service_images: serviceImages,
        transport_details: data.is_transport_service ? {
          service_type: data.service_type,
          route: data.route,
          departure_time: data.departure_time,
          arrival_time: data.arrival_time,
          vehicle_capacity: data.vehicle_capacity,
          pickup_location: data.pickup_location,
          dropoff_location: data.dropoff_location,
          external_booking_url: data.external_booking_url,
          booking_instructions: data.booking_instructions
        } : null
      };

      let result;
      if (service) {
        result = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', service.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('services')
          .insert([serviceData])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      toast.success(service ? 'Service updated successfully!' : 'Service created successfully!');
      queryClient.invalidateQueries({ queryKey: ['services'] });
      onSuccess?.();
    } catch (error: any) {
      console.error('Error saving service:', error);
      toast.error(error.message || 'Failed to save service');
    } finally {
      setIsLoading(false);
    }
  };

  const currencyOptions = [
    { value: 'KES', label: 'KES - Kenyan Shilling' },
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
  ];

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Service Name *</Label>
          <Input 
            id="name" 
            type="text" 
            placeholder="Enter service name" 
            {...form.register('name')} 
            className="w-full"
          />
          {form.formState.errors.name && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description" 
            placeholder="Enter service description" 
            {...form.register('description')} 
            className="w-full min-h-[80px]"
          />
        </div>
      </div>

      {/* Price and Duration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price *</Label>
          <Input 
            id="price" 
            type="text" 
            placeholder="Enter price" 
            {...form.register('price')} 
            className="w-full"
          />
          {form.formState.errors.price && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.price.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="duration_minutes">Duration (minutes) *</Label>
          <Input 
            id="duration_minutes" 
            type="text" 
            placeholder="Enter duration" 
            {...form.register('duration_minutes')} 
            className="w-full"
          />
          {form.formState.errors.duration_minutes && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.duration_minutes.message}</p>
          )}
        </div>
      </div>

      {/* Currency and Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="currency">Currency *</Label>
          <Select onValueChange={form.setValue.bind(null, 'currency')} defaultValue={form.getValues('currency')}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {currencyOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.currency && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.currency.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="category">Category *</Label>
          <Select onValueChange={form.setValue.bind(null, 'category')} defaultValue={form.getValues('category')}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {SERVICE_CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.category && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.category.message}</p>
          )}
        </div>
      </div>

      {/* Service Images Section */}
      <div>
        <Label>Service Images</Label>
        <ServiceImageUpload
          serviceId={service?.id}
          images={serviceImages}
          onImagesChange={setServiceImages}
          maxImages={5}
        />
      </div>

      {/* Transport Service Toggle */}
      <div className="flex items-center space-x-2">
        <Switch 
          id="is_transport_service" 
          checked={form.getValues('is_transport_service')} 
          onCheckedChange={(checked) => form.setValue('is_transport_service', checked)} 
        />
        <Label htmlFor="is_transport_service">Is Transport Service</Label>
      </div>

      {/* Transport Service Details */}
      {form.getValues('is_transport_service') && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="font-medium text-gray-900">Transport Service Details</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="service_type">Service Type</Label>
              <Input 
                id="service_type" 
                type="text" 
                placeholder="e.g., Taxi, Bus, Shuttle" 
                {...form.register('service_type')} 
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="route">Route</Label>
              <Input 
                id="route" 
                type="text" 
                placeholder="e.g., Airport to City Center" 
                {...form.register('route')} 
                className="w-full"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="departure_time">Departure Time</Label>
              <Input 
                id="departure_time" 
                type="time" 
                {...form.register('departure_time')} 
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="arrival_time">Arrival Time</Label>
              <Input 
                id="arrival_time" 
                type="time" 
                {...form.register('arrival_time')} 
                className="w-full"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vehicle_capacity">Vehicle Capacity</Label>
              <Input 
                id="vehicle_capacity" 
                type="text" 
                placeholder="e.g., 4, 12, 50" 
                {...form.register('vehicle_capacity')} 
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="pickup_location">Pickup Location</Label>
              <Input 
                id="pickup_location" 
                type="text" 
                placeholder="e.g., Airport Terminal 1" 
                {...form.register('pickup_location')} 
                className="w-full"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="dropoff_location">Drop-off Location</Label>
            <Input 
              id="dropoff_location" 
              type="text" 
              placeholder="e.g., City Center Hotel" 
              {...form.register('dropoff_location')} 
              className="w-full"
            />
          </div>
          
          <div>
            <Label htmlFor="external_booking_url">External Booking URL</Label>
            <Input 
              id="external_booking_url" 
              type="url" 
              placeholder="https://example.com/booking" 
              {...form.register('external_booking_url')} 
              className="w-full"
            />
          </div>
          
          <div>
            <Label htmlFor="booking_instructions">Booking Instructions</Label>
            <Textarea 
              id="booking_instructions" 
              placeholder="Enter booking instructions" 
              {...form.register('booking_instructions')} 
              className="w-full min-h-[80px]"
            />
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-2 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 order-2 sm:order-1"
        >
          {isLoading ? 'Saving...' : (service ? 'Update Service' : 'Save Service')}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          className="flex-1 order-1 sm:order-2"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};
