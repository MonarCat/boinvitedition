
import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Clock, Banknote, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  category: string;
  is_active: boolean;
  service_images?: string[];
}

interface ServicesListProps {
  onEditService: (service: Service) => void;
}

export const ServicesList = ({ onEditService }: ServicesListProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: business } = useQuery({
    queryKey: ['user-business', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Error fetching business:', err);
        return null;
      }
    },
    enabled: !!user?.id,
  });

  const { data: services, isLoading } = useQuery({
    queryKey: ['services', business?.id],
    queryFn: async () => {
      if (!business?.id) return [];
      
      try {
        const { data, error } = await supabase
          .from('services')
          .select('id, name, description, price, duration_minutes, category, is_active, service_images')
          .eq('business_id', business.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data as Service[];
      } catch (err) {
        console.error('Error fetching services:', err);
        return [];
      }
    },
    enabled: !!business?.id,
  });

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      toast.success('Service deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['services'] });
    } catch (error: unknown) {
      console.error('Error deleting service:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Failed to delete service: ' + errorMessage);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading services...</div>;
  }

  if (!services || services.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No services found. Create your first service to get started!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => (
        <Card key={service.id} className="hover:shadow-lg transition-shadow">
          {/* Service Image Display */}
          {service.service_images && service.service_images.length > 0 ? (
            <div className="relative h-48 overflow-hidden rounded-t-lg">
              <img 
                src={service.service_images[0]} 
                alt={service.name}
                className="w-full h-full object-cover"
              />
              {service.service_images.length > 1 && (
                <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                  +{service.service_images.length - 1} more
                </div>
              )}
            </div>
          ) : (
            <div className="h-24 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center rounded-t-lg border-b">
              <ImageIcon className="w-8 h-8 text-gray-400" />
            </div>
          )}
          
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{service.name}</CardTitle>
              <Badge variant={service.is_active ? 'default' : 'secondary'}>
                {service.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 text-sm line-clamp-2">{service.description}</p>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <Banknote className="w-4 h-4" />
                <span>KES {service.price}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{service.duration_minutes}min</span>
              </div>
            </div>
            
            <Badge variant="outline" className="text-xs">
              {service.category}
            </Badge>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditService(service)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteService(service.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
