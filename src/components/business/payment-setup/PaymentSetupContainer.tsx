
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';
import { PaymentStatusBadge } from './PaymentStatusBadge';

interface PaymentSetupContainerProps {
  hasPaystack: boolean;
  hasMpesa: boolean;
  hasBank: boolean;
  children: React.ReactNode;
}

export const PaymentSetupContainer: React.FC<PaymentSetupContainerProps> = ({
  hasPaystack,
  hasMpesa,
  hasBank,
  children
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Business Payment Setup
          </div>
          <PaymentStatusBadge 
            hasPaystack={hasPaystack}
            hasMpesa={hasMpesa}
            hasBank={hasBank}
          />
        </CardTitle>
        <p className="text-sm text-gray-600">
          Configure where clients' payments should be sent. You'll receive 95% directly, Boinvit keeps 5%.
        </p>
      </CardHeader>
      
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};
