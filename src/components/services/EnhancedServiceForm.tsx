import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Settings, Truck, Currency, ImagePlus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ServiceImageUpload } from './ServiceImageUpload';
import { RealServiceImageUpload } from './RealServiceImageUpload';

interface EnhancedServiceFormProps {
  service?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EnhancedServiceForm: React.FC<EnhancedServiceFormProps> = ({
  service,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    transport_details: '',
    price: 0,
    currency: 'KES',
    is_active: true,
    service_images: [] as string[],
  });

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        description: service.description || '',
        category: service.category || 'general',
        transport_details: service.transport_details || '',
        price: service.price || 0,
        currency: service.currency || 'KES',
        is_active: service.is_active !== false,
        service_images: service.service_images || [] as string[],
      });
    }
  }, [service]);

  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.description || !formData.price) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (formData.price <= 0) {
      toast.error('Price must be greater than zero.');
      return;
    }

    const serviceData = {
      ...formData,
      price: parseFloat(formData.price.toString()),
    };

    if (service) {
      // Update existing service
      const { error } = await supabase
        .from('services')
        .update(serviceData)
        .eq('id', service.id);

      if (error) {
        toast.error(`Failed to update service: ${error.message}`);
      } else {
        toast.success('Service updated successfully!');
        queryClient.invalidateQueries({ queryKey: ['services'] });
        onSuccess();
      }
    } else {
      // Create new service
      const { data, error } = await supabase
        .from('services')
        .insert([serviceData])
        .select();

      if (error) {
        toast.error(`Failed to create service: ${error.message}`);
      } else {
        toast.success('Service created successfully!');
        queryClient.invalidateQueries({ queryKey: ['services'] });
        onSuccess();
      }
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Service Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Service Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" defaultValue={formData.category} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Replace ServiceImageUpload with RealServiceImageUpload */}
      <RealServiceImageUpload
        serviceId={service?.id}
        images={formData.service_images}
        onImagesChange={(images) => setFormData({ ...formData, service_images: images })}
        maxImages={5}
      />

      {/* Transport Details (Conditionally Rendered) */}
      {formData.category === 'transport' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Transport Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="transport_details">Details</Label>
            <Textarea
              id="transport_details"
              placeholder="e.g., Vehicle type, capacity, route"
              value={formData.transport_details}
              onChange={(e) => setFormData({ ...formData, transport_details: e.target.value })}
            />
          </CardContent>
        </Card>
      )}

      {/* Pricing and Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Currency className="w-5 h-5" />
            Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" defaultValue={formData.currency} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KES">KES</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="active">Active</Label>
          </div>
        </CardContent>
      </Card>

      {/* Submit Section */}
      <div className="flex justify-end space-x-2">
        <Button variant="ghost" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {service ? 'Update Service' : 'Create Service'}
        </Button>
      </div>
    </form>
  );
};
