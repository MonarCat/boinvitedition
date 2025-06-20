
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ServicesList } from '@/components/services/ServicesList';
import { EnhancedServiceForm } from '@/components/services/EnhancedServiceForm';
import { Button } from '@/components/ui/button';
import { Plus, AlertTriangle, CheckCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { EnhancedQRGenerator } from '@/components/qr/EnhancedQRGenerator';
import { MobileMenuToggle } from '@/components/layout/MobileMenuToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { validateBusinessSetup, getBusinessSetupCompleteness } from '@/utils/businessValidation';
import { generateBusinessSlug } from '@/utils/businessSlug';

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

  // Generate business slug for display
  const businessSlug = business ? generateBusinessSlug(business.name) : '';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Mobile Menu */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Services</h1>
            <p className="text-gray-600">Manage your business services and booking system</p>
          </div>
          
          <div className="flex items-center gap-2">
            <MobileMenuToggle>
              <Button variant="ghost" className="w-full justify-start">
                Services
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Bookings
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Clients
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Settings
              </Button>
            </MobileMenuToggle>
            
            <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
              <SheetTrigger asChild>
                <Button onClick={handleCreateService} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Service</span>
                </Button>
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
          </div>
        </div>

        {/* Business Setup Status */}
        {businessValidation && (
          <Card className={`${businessValidation.isValid ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                {businessValidation.isValid ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                )}
                Business Setup Status
                <Badge variant={businessValidation.isValid ? "default" : "secondary"} className="ml-2">
                  {completeness}% Complete
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {businessValidation.isValid ? (
                <p className="text-sm text-green-800">
                  ✅ Your business is properly configured and ready for bookings!
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-orange-800 font-medium">Issues to fix:</p>
                  <ul className="text-xs text-orange-700 space-y-1">
                    {businessValidation.issues.map((issue, index) => (
                      <li key={index}>• {issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <ServicesList onEditService={handleEditService} />

        {/* QR Code and Booking System */}
        <div className="mt-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Client Booking System</h2>
            <p className="text-gray-600">
              QR codes and direct links for clients to book your services. Clean URLs using your business name.
            </p>
          </div>
          
          {!business && isLoadingBusiness ? (
            <div className="text-gray-400">Loading booking system...</div>
          ) : business ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EnhancedQRGenerator businessId={business.id} businessName={business.name} />
              
              {/* Additional Booking Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Clean URL Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Your Clean Booking URL:</h4>
                    <code className="text-sm bg-white p-2 rounded border break-all block">
                      https://boinvit.com/{businessSlug}
                    </code>
                    <p className="text-xs text-blue-700 mt-2">
                      This clean URL redirects to your full booking page automatically.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">Marketing Benefits:</h4>
                    <ul className="text-sm space-y-2 text-gray-700">
                      <li>• Easy to remember and share</li>
                      <li>• Professional appearance</li>
                      <li>• Works in QR codes perfectly</li>
                      <li>• SEO-friendly business name</li>
                      <li>• No complex IDs for customers</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      <strong>✅ Ready for Publishing:</strong> Your booking system uses clean, professional URLs perfect for marketing materials.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-red-500">Unable to load business information. Please check your business registration.</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ServicesPage;
