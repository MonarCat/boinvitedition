import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, ArrowRight, InfoIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PaygOnboarding = () => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Welcome to Pay As You Go!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="font-medium text-orange-800 mb-2 flex items-center gap-2">
              <InfoIcon className="h-5 w-5" />
              How Pay As You Go Works
            </h3>
            <p className="text-orange-700 mb-3">
              With our Pay As You Go plan, you only pay when you get paid. No monthly fees or upfront costs!
            </p>
            <ul className="space-y-2">
              <li className="flex gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-orange-700">
                  <strong>Full Access:</strong> Use all premium features with no monthly subscription
                </span>
              </li>
              <li className="flex gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-orange-700">
                  <strong>5% Commission:</strong> We only charge a 5% commission when you successfully receive payment from clients
                </span>
              </li>
              <li className="flex gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-orange-700">
                  <strong>No Limits:</strong> Unlimited staff members, unlimited bookings, no hidden charges
                </span>
              </li>
              <li className="flex gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-orange-700">
                  <strong>Complete Protection:</strong> Bookings are automatically processed after successful payment
                </span>
              </li>
            </ul>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="font-medium text-blue-800 mb-2">Step 1: Set Up Services</h4>
              <p className="text-sm text-blue-700 mb-3">
                Configure your services and pricing in the Services section.
              </p>
              <Button 
                onClick={() => navigate('/app/services')} 
                variant="outline" 
                className="w-full border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                Set Up Services
              </Button>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="font-medium text-blue-800 mb-2">Step 2: Configure Payment</h4>
              <p className="text-sm text-blue-700 mb-3">
                Connect your payment methods to receive client payments.
              </p>
              <Button 
                onClick={() => navigate('/app/settings/payment')} 
                variant="outline" 
                className="w-full border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                Payment Settings
              </Button>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="font-medium text-blue-800 mb-2">Step 3: Share Booking Link</h4>
              <p className="text-sm text-blue-700 mb-3">
                Create and share your booking page with clients.
              </p>
              <Button 
                onClick={() => navigate('/app/booking-link')} 
                variant="outline" 
                className="w-full border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                Create Booking Link
              </Button>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-green-800">Ready to receive bookings!</h4>
                <p className="text-sm text-green-700">
                  You're all set up on the Pay As You Go plan. Start accepting bookings and only pay when you get paid!
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Button 
              onClick={() => navigate('/app/dashboard')}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
