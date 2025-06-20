
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedQRGenerator } from '@/components/qr/EnhancedQRGenerator';
import { generateBusinessSlug } from '@/utils/businessSlug';

interface Business {
  id: string;
  name: string;
}

interface QRBookingSystemProps {
  business: Business | null;
  isLoadingBusiness: boolean;
}

export const QRBookingSystem: React.FC<QRBookingSystemProps> = ({
  business,
  isLoadingBusiness
}) => {
  const businessSlug = business ? generateBusinessSlug(business.name) : '';

  return (
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
  );
};
