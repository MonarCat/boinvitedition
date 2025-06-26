
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConsolidatedQRGenerator } from '@/components/qr/ConsolidatedQRGenerator';
import { QrCode, BarChart3, Settings, Palette } from 'lucide-react';

interface DashboardQRSectionProps {
  business: any;
}

export const DashboardQRSection: React.FC<DashboardQRSectionProps> = ({
  business
}) => {
  const [customColors, setCustomColors] = useState({
    dark: '#000000',
    light: '#FFFFFF'
  });
  const [showBranding, setShowBranding] = useState(false);

  if (!business) return null;

  const toggleBranding = () => {
    setShowBranding(!showBranding);
  };

  const updateColors = (colors: { dark: string; light: string }) => {
    setCustomColors(colors);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          QR Code System
        </CardTitle>
        <p className="text-sm text-gray-600">
          Generate and manage QR codes for customer bookings with reliable functionality
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="generator" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generator" className="flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              Generator
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="generator" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Your Business QR Code</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleBranding}
                  className="flex items-center gap-2"
                >
                  <Palette className="w-4 h-4" />
                  {showBranding ? 'Hide' : 'Show'} Options
                </Button>
              </div>
              
              <ConsolidatedQRGenerator 
                businessId={business.id} 
                businessName={business.name || 'Your Business'}
                showTitle={false}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="mt-6">
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">QR Code Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">Permanent Booking URL:</p>
                  <code className="text-xs bg-white p-2 rounded border block">
                    {window.location.origin}/book/{business.id}
                  </code>
                  <p className="text-xs text-gray-600 mt-2">
                    This URL is permanent and will never change. Even if you update your business 
                    details, this QR code will continue to work.
                  </p>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="font-medium mb-3">Features</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-blue-900">High Error Correction</p>
                      <p className="text-sm text-blue-700">Level H - up to 30% damage recovery</p>
                    </div>
                    <span className="text-green-600 font-medium">✓ Active</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-900">Universal Compatibility</p>
                      <p className="text-sm text-green-700">Works on all mobile devices and cameras</p>
                    </div>
                    <span className="text-green-600 font-medium">✓ Active</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <p className="font-medium text-purple-900">Reliable Generation</p>
                      <p className="text-sm text-purple-700">Enhanced validation and error handling</p>
                    </div>
                    <span className="text-green-600 font-medium">✓ Active</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
