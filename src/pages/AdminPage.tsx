
import React from "react";
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { FirstAdminSetup } from '@/components/admin/FirstAdminSetup';
import { SecurityDashboard } from '@/components/security/SecurityDashboard';
import { AdminReportsPanel } from '@/components/admin/AdminReportsPanel';
import { RLSPolicyChecker } from '@/components/admin/RLSPolicyChecker';
import { AdminStatsDashboard } from '@/components/admin/AdminStatsDashboard';
import { BusinessList } from '@/components/admin/BusinessList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminPage = () => {
  const { user } = useAuth();
  const { isAdmin, rolesLoading } = useUserRoles();

  if (!user) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Page</h1>
            <p className="text-gray-600">You must be logged in to view this page.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (rolesLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Page</h1>
            <div className="max-w-md mx-auto">
              <FirstAdminSetup />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage platform operations, users, and monitor business activity</p>
          </div>

          {/* Stats Overview */}
          <AdminStatsDashboard />

          {/* Main Admin Tabs */}
          <Tabs defaultValue="businesses" className="space-y-4">
            <TabsList>
              <TabsTrigger value="businesses">Business Management</TabsTrigger>
              <TabsTrigger value="reports">Financial Reports</TabsTrigger>
              <TabsTrigger value="security">Security & Monitoring</TabsTrigger>
              <TabsTrigger value="system">System Status</TabsTrigger>
            </TabsList>

            <TabsContent value="businesses" className="space-y-4">
              <BusinessList />
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <AdminReportsPanel />
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <SecurityDashboard />
            </TabsContent>

            <TabsContent value="system" className="space-y-4">
              <RLSPolicyChecker />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminPage;
