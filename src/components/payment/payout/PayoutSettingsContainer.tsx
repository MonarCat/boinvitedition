
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, CheckCircle } from 'lucide-react';

interface PayoutSettingsContainerProps {
  isLoading: boolean;
  isVerified: boolean;
  children: React.ReactNode;
}

export const PayoutSettingsContainer: React.FC<PayoutSettingsContainerProps> = ({
  isLoading,
  isVerified,
  children
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">Loading payout settings...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payout Settings
          {isVerified && (
            <Badge className="bg-green-500">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-gray-600">
          Configure where you want to receive payments from clients
        </p>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};
