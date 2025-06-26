import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ServicesList } from '@/components/services/ServicesList';
import { EnhancedServiceForm } from '@/components/services/EnhancedServiceForm';
import { BusinessHours } from '@/components/business/BusinessHours';
import { BusinessPaymentSetup } from '@/components/business/BusinessPaymentSetup';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ServiceBookingQRGenerator } from '@/components/qr/ServiceBookingQRGenerator';
import { Service, Business } from '@/types';

const ServicesPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const { user } = useAuth();

  const handleCreateService = () => {
    setEditingService(null);
    setIsFormOpen(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingService(null);
  };

  // Fetch the business for the logged-in user
  const { data: business, isLoading: isLoadingBusiness } = useQuery({
    queryKey: ['current-business', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Services</h1>
            <p className="text-gray-600">Manage your business services with global currency support</p>
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreateService} className="flex items-center gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-hidden p-0">
              <DialogHeader className="p-6 pb-4">
                <DialogTitle>{editingService ? 'Edit Service' : 'Create New Service'}</DialogTitle>
                <DialogDescription>
                  {editingService ? 'Update your service details' : 'Add a new service with enhanced categories and currency support'}
                </DialogDescription>
              </DialogHeader>
              <div className="px-6 pb-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <EnhancedServiceForm 
                  service={editingService} 
                  onSuccess={handleFormClose}
                  onCancel={handleFormClose}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <ServicesList onEditService={handleEditService} />

        {/* Business Payment Setup Section */}
        {business && (
          <div className="mt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Payment Setup</h2>
            <BusinessPaymentSetup businessId={business.id} />
          </div>
        )}

        {/* Business Hours Section */}
        {business && (
          <div className="mt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Business Hours</h2>
            <BusinessHours 
              businessId={business.id} 
              currentHours={business.business_hours || {}}
            />
          </div>
        )}

        {/* Service Booking QR Code Section */}
        {business && (
          <div className="mt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Service Booking QR Code</h2>
            <p className="text-gray-600 mb-4">Clients can scan this QR code to book your services directly.</p>
            <ServiceBookingQRGenerator 
              businessId={business.id} 
              businessName={business.name}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ServicesPage;
