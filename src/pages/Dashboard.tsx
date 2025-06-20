
import React from "react";
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardKPISection } from '@/components/dashboard/DashboardKPISection';
import { DashboardQuickActions } from '@/components/dashboard/DashboardQuickActions';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import { BusinessLogoUpload } from '@/components/business/BusinessLogoUpload';
import { EnhancedSubscriptionPlans } from '@/components/subscription/EnhancedSubscriptionPlans';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useDashboardHandlers } from '@/hooks/useDashboardHandlers';
import { useTheme } from "@/lib/ThemeProvider";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Building2, Upload, CreditCard } from 'lucide-react';

const Dashboard = () => {
  const { business, stats, currency, formatPrice, handleKpiRefresh } = useDashboardData();
  const { 
    handleNewBooking, 
    handleCreateInvoice, 
    handleViewClients, 
    handleManageServices, 
    handleUpdateSettings, 
    handleSubscription,
    navigate 
  } = useDashboardHandlers();
  
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [businessData, setBusinessData] = useState(business);

  // Get detailed business data including logo
  const { data: detailedBusiness } = useQuery({
    queryKey: ['detailed-business', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    onSuccess: (data) => {
      setBusinessData(data);
    }
  });

  // Get subscription data
  const { data: subscription } = useQuery({
    queryKey: ['user-subscription', detailedBusiness?.id],
    queryFn: async () => {
      if (!detailedBusiness) return null;
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('business_id', detailedBusiness.id)
        .eq('status', 'active')
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!detailedBusiness,
  });

  const handleLogoUpdate = (logoUrl: string | null) => {
    if (detailedBusiness) {
      setBusinessData({ ...detailedBusiness, logo_url: logoUrl });
    }
  };

  const handleSelectPlan = (planId: string, interval: string, amount: number) => {
    if (detailedBusiness) {
      console.log('Selected plan:', { planId, interval, amount, businessId: detailedBusiness.id });
      // Handle subscription creation logic here
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Enhanced Header with Business Logo */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {detailedBusiness?.logo_url ? (
                <div className="w-16 h-16 rounded-full bg-white p-2 shadow-md">
                  <img 
                    src={detailedBusiness.logo_url} 
                    alt="Business Logo" 
                    className="w-full h-full object-contain rounded-full"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold">
                  {detailedBusiness?.name || 'Business Dashboard'}
                </h1>
                <p className="text-blue-100 mt-1">
                  Welcome back! Manage your business operations
                </p>
                {subscription && (
                  <Badge variant="secondary" className="mt-2 bg-white/20 text-white">
                    {subscription.plan_type?.toUpperCase()} Plan
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleNewBooking}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-md"
              >
                + New Booking
              </button>
            </div>
          </div>
        </div>

        {/* KPI Section */}
        <DashboardKPISection
          business={detailedBusiness}
          stats={stats}
          currency={currency}
          formatPrice={formatPrice}
          onRefresh={handleKpiRefresh}
          onEditBusiness={handleUpdateSettings}
        />

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleNewBooking}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">New Booking</h3>
              <p className="text-sm text-gray-600 mt-1">Create a new booking</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleCreateInvoice}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Create Invoice</h3>
              <p className="text-sm text-gray-600 mt-1">Generate new invoice</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleViewClients}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">View Clients</h3>
              <p className="text-sm text-gray-600 mt-1">Manage your clients</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleManageServices}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Upload className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Manage Services</h3>
              <p className="text-sm text-gray-600 mt-1">Edit your services</p>
            </CardContent>
          </Card>
        </div>

        {/* Business Logo Upload Section */}
        {detailedBusiness && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <BusinessLogoUpload
              business={detailedBusiness}
              onLogoUpdate={handleLogoUpdate}
            />
            
            {/* Subscription Plans Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Subscription Plans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subscription ? (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-green-800">
                            Current Plan: {subscription.plan_type?.toUpperCase()}
                          </h4>
                          <p className="text-sm text-green-600">
                            Status: {subscription.status}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-green-100 text-green-700">
                          Active
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2">Upgrade Your Plan</h4>
                      <p className="text-sm text-blue-600 mb-4">
                        Get access to premium features and grow your business
                      </p>
                      <button
                        onClick={handleSubscription}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        View Plans
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Dashboard Tabs */}
        <DashboardTabs
          handleCreateInvoice={handleCreateInvoice}
          handleViewClients={handleViewClients}
          handleUpdateSettings={handleUpdateSettings}
          handleManageServices={handleManageServices}
          handleSubscription={handleSubscription}
          currency={currency}
          navigate={navigate}
          showEditBusiness={false}
          setShowEditBusiness={() => {}}
        />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
