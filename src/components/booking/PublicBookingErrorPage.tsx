
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface PublicBookingErrorPageProps {
  type: 'invalid-uuid' | 'no-business-id' | 'business-not-found';
  businessId?: string;
  error?: string;
}

export const PublicBookingErrorPage: React.FC<PublicBookingErrorPageProps> = ({
  type,
  businessId,
  error
}) => {
  const navigate = useNavigate();

  const renderContent = () => {
    switch (type) {
      case 'invalid-uuid':
        return (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Booking Link</h1>
            <p className="text-gray-600 mb-4">The booking link format is incorrect.</p>
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-sm mb-4">
              <p><strong>Error Details:</strong></p>
              <p>Invalid business ID format: {businessId}</p>
              <p>Expected: Valid UUID format</p>
              <p>Current URL: {window.location.href}</p>
            </div>
          </>
        );

      case 'no-business-id':
        return (
          <>
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-yellow-600 text-2xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Booking Link</h1>
            <p className="text-gray-600 mb-4">No business ID provided in the URL.</p>
          </>
        );

      case 'business-not-found':
        return (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">❌</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Business Not Available</h1>
            <p className="text-gray-600 mb-4">
              {error || 'The business you are looking for is not available.'}
            </p>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-sm mb-4">
              <p><strong>Troubleshooting Info:</strong></p>
              <p>Business ID: {businessId}</p>
              <p>Error: {error}</p>
              <p>Time: {new Date().toISOString()}</p>
              <p>URL: {window.location.href}</p>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        {renderContent()}
        <div className="space-y-2">
          <button
            onClick={() => navigate('/discover')}
            className="block w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Browse All Businesses
          </button>
          <button
            onClick={() => navigate('/')}
            className="block w-full text-gray-600 hover:text-gray-800 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};
