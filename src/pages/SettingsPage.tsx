
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { QRCodeGenerator } from '@/components/qr/QRCodeGenerator';
import { BusinessSettings } from '@/components/settings/BusinessSettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { GeneralSettings } from '@/components/settings/GeneralSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, QrCode, User, Bell } from 'lucide-react';

const SettingsPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your business settings and preferences</p>
        </div>

        <Tabs defaultValue="qr-codes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="qr-codes" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              QR Codes
            </TabsTrigger>
            <TabsTrigger value="business" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Business
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              General
            </TabsTrigger>
          </TabsList>

          <TabsContent value="qr-codes">
            <QRCodeGenerator />
          </TabsContent>

          <TabsContent value="business">
            <BusinessSettings />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationSettings />
          </TabsContent>

          <TabsContent value="general">
            <GeneralSettings />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
