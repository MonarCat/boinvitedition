
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowRight, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BusinessNotFoundProps {
  businessId?: string;
}

export const BusinessNotFound: React.FC<BusinessNotFoundProps> = ({ businessId }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl text-gray-900">
            Business Not Available
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            This business is no longer active on Boinvit or the QR code may be invalid.
          </p>
          
          {businessId && (
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Business ID:</p>
              <p className="font-mono text-sm text-gray-700 break-all">{businessId}</p>
            </div>
          )}
          
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/business-discovery')}
              className="w-full"
            >
              Find Other Businesses
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/auth')}
              className="w-full"
            >
              <Building2 className="w-4 h-4 mr-2" />
              Register Your Business
            </Button>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h5 className="font-medium text-blue-900 mb-2 text-sm">
              Are you the business owner?
            </h5>
            <p className="text-xs text-blue-800 mb-2">
              If this was your business, you can reclaim this QR code by registering again.
            </p>
            <Button 
              variant="link" 
              size="sm"
              onClick={() => navigate('/auth')}
              className="text-blue-600 p-0 h-auto"
            >
              Sign up to reclaim this QR →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessNotFound;
