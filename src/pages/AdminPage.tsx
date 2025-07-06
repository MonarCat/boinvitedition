
import React from "react";
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { FirstAdminSetup } from '@/components/admin/FirstAdminSetup';
import { SecurityDashboard } from '@/components/security/SecurityDashboard';
import { AdminReportsPanel } from '@/components/admin/AdminReportsPanel';
import { RLSPolicyChecker } from '@/components/admin/RLSPolicyChecker';

const AdminPage = () => {
  const { user } = useAuth();
  const { isAdmin, assigningAdmin } = useUserRoles();

  if (!user) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Page</h1>
          <p className="text-gray-600">You must be logged in to view this page.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin && !assigningAdmin) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Page</h1>
          <p className="text-gray-600">You do not have permission to view this page.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage platform operations, users, and monitor financial activity</p>
        </div>

        {!isAdmin && (
          <FirstAdminSetup />
        )}

        {/* Admin Reports Panel with real-time financial monitoring */}
        <AdminReportsPanel />

        {/* RLS Policy Status Checker */}
        <RLSPolicyChecker />

        {/* Security dashboard for monitoring */}
        <SecurityDashboard />
      </div>
    </DashboardLayout>
  );
};

export default AdminPage;
