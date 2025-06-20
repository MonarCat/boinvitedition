
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RefreshCw, Home, Search } from 'lucide-react';

interface PublicBookingErrorPageProps {
  type: 'invalid-uuid' | 'no-business-id' | 'business-not-found';
  businessId?: string;
  error?: string;
  onRetry?: () => void;
}

export const PublicBookingErrorPage: React.FC<PublicBookingErrorPageProps> = ({
  type,
  businessId,
  error,
  onRetry
}) => {
  const navigate = useNavigate();

  const renderContent = () => {
    switch (type) {
      case 'invalid-uuid':
        return (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-red-600 text-3xl">⚠️</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Invalid Booking Link</h1>
            <p className="text-gray-600 mb-6 text-lg">The booking link format is incorrect.</p>
            <div className="bg-red-50 border border-red-200 p-6 rounded-xl text-sm mb-8">
              <p className="font-semibold mb-2">Error Details:</p>
              <p className="mb-1">Invalid business ID format: <span className="font-mono">{businessId}</span></p>
              <p className="mb-1">Expected: Valid UUID format</p>
              <p className="text-xs text-gray-500 mt-2">Current URL: {window.location.href}</p>
            </div>
          </>
        );

      case 'no-business-id':
        return (
          <>
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-yellow-600 text-3xl">⚠️</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Invalid Booking Link</h1>
            <p className="text-gray-600 mb-6 text-lg">No business ID provided in the URL.</p>
          </>
        );

      case 'business-not-found':
        return (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-red-600 text-3xl">❌</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Business Not Available</h1>
            <p className="text-gray-600 mb-6 text-lg">
              {error || 'The business you are looking for is not available.'}
            </p>
            <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl text-sm mb-8">
              <p className="font-semibold mb-2">Troubleshooting Info:</p>
              <p className="mb-1">Business ID: <span className="font-mono">{businessId}</span></p>
              <p className="mb-1">Error: {error}</p>
              <p className="mb-1">Time: {new Date().toISOString()}</p>
              <p className="text-xs text-gray-500 mt-2">URL: {window.location.href}</p>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="text-center max-w-lg mx-auto bg-white rounded-2xl shadow-xl p-8">
        {/* Boinvit Logo */}
        <div className="w-16 h-16 mx-auto mb-6 bg-blue-600 rounded-xl flex items-center justify-center">
          <img 
            src="/lovable-uploads/307c9897-7d4d-4c72-9525-71af1ea5c02f.png" 
            alt="Boinvit Logo" 
            className="w-12 h-12 object-contain filter brightness-0 invert"
          />
        </div>
        
        {renderContent()}
        
        <div className="space-y-3">
          {onRetry && (
            <Button
              onClick={onRetry}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              size="lg"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Try Again
            </Button>
          )}
          
          <Button
            onClick={() => navigate('/discover')}
            variant="outline"
            className="w-full py-3"
            size="lg"
          >
            <Search className="w-5 h-5 mr-2" />
            Browse All Businesses
          </Button>
          
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="w-full py-3"
            size="lg"
          >
            <Home className="w-5 h-5 mr-2" />
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
};
