
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ServicesList } from '@/components/services/ServicesList';
import { EnhancedServiceForm } from '@/components/services/EnhancedServiceForm';
import { ServicesHeader } from '@/components/services/ServicesHeader';
import { BusinessSetupStatus } from '@/components/services/BusinessSetupStatus';
import { QRBookingSystem } from '@/components/services/QRBookingSystem';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { validateBusinessSetup, getBusinessSetupCompleteness } from '@/utils/businessValidation';

const ServicesPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const { user } = useAuth();

  const handleCreateService = () => {
    setEditingService(null);
    setIsFormOpen(true);
  };

  const handleEditService = (service: any) => {
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

  // Validate business setup
  const { data: businessValidation, isLoading: isValidating } = useQuery({
    queryKey: ['business-validation', business?.id],
    queryFn: () => validateBusinessSetup(business!.id),
    enabled: !!business?.id,
  });

  const completeness = businessValidation ? getBusinessSetupCompleteness(businessValidation) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ServicesHeader onCreateService={handleCreateService} />

        <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
          <SheetTrigger asChild>
            <div style={{ display: 'none' }} />
          </SheetTrigger>
          <SheetContent className="w-[700px] sm:max-w-[700px] overflow-hidden">
            <SheetHeader>
              <SheetTitle>{editingService ? 'Edit Service' : 'Create New Service'}</SheetTitle>
              <SheetDescription>
                {editingService ? 'Update your service details' : 'Add a new service with enhanced categories and currency support'}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-4 h-full">
              <EnhancedServiceForm 
                service={editingService} 
                onSuccess={handleFormClose}
                onCancel={handleFormClose}
              />
            </div>
          </SheetContent>
        </Sheet>

        <BusinessSetupStatus 
          businessValidation={businessValidation} 
          completeness={completeness} 
        />

        <ServicesList onEditService={handleEditService} />

        <QRBookingSystem 
          business={business} 
          isLoadingBusiness={isLoadingBusiness} 
        />
      </div>
    </DashboardLayout>
  );
};

export default ServicesPage;
