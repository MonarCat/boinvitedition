
import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Clock, Banknote } from 'lucide-react';
import { toast } from 'sonner';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  category: string;
  is_active: boolean;
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
          .select('*')
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
