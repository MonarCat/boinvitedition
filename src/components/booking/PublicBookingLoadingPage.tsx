
import React from 'react';

interface PublicBookingLoadingPageProps {
  businessId: string;
  businessLoading: boolean;
  servicesLoading: boolean;
}

export const PublicBookingLoadingPage: React.FC<PublicBookingLoadingPageProps> = ({
  businessId,
  businessLoading,
  servicesLoading
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Loading booking page...</p>
        <p className="text-sm text-gray-400 mt-2">Business ID: {businessId}</p>
        <p className="text-xs text-gray-400 mt-1">
          {businessLoading ? 'Loading business details...' : 'Loading services...'}
        </p>
      </div>
    </div>
  );
};
