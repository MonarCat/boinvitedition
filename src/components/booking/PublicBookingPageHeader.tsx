
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface PublicBookingPageHeaderProps {
  businessId: string;
  isDirectAccess: boolean;
}

export const PublicBookingPageHeader: React.FC<PublicBookingPageHeaderProps> = ({
  businessId,
  isDirectAccess
}) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Success indicator for QR scan */}
      {isDirectAccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-green-600 text-xl">✅</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                QR Code Access Detected
              </p>
              <p className="text-sm text-green-700">
                You've successfully accessed this booking page via QR code!
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
