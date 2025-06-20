
import React from 'react';

interface QRBusinessInfoProps {
  businessData: any;
  businessSlug: string;
  hasServices: boolean;
}

export const QRBusinessInfo: React.FC<QRBusinessInfoProps> = ({
  businessData,
  businessSlug,
  hasServices
}) => {
  if (!businessData) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
      <h5 className="font-medium text-blue-900 mb-1 text-sm">Business Verified ✓</h5>
      <p className="text-xs text-blue-800">
        <strong>Name:</strong> {businessData.name}
      </p>
      <p className="text-xs text-blue-800">
        <strong>Slug:</strong> {businessSlug}
      </p>
      <p className="text-xs text-blue-800">
        <strong>URL:</strong> boinvit.com/{businessSlug}
      </p>
      {businessData.phone && (
        <p className="text-xs text-blue-800">
          <strong>Phone:</strong> {businessData.phone}
        </p>
      )}
      <p className="text-xs text-blue-800">
        <strong>Services Available:</strong> {hasServices ? 'Yes' : 'No services found'}
      </p>
    </div>
  );
};
