
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Info } from 'lucide-react';

interface PaymentInfoCardProps {
  planType: string;
  amount: number;
  isInitializationFee: boolean;
}

export const PaymentInfoCard: React.FC<PaymentInfoCardProps> = ({
  planType,
  amount,
  isInitializationFee
}) => {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-green-600" />
        Complete Payment
      </CardTitle>
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          KES {amount.toLocaleString()}
        </Badge>
        <Badge variant="secondary">{planType}</Badge>
        {isInitializationFee && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            One-time Setup
          </Badge>
        )}
      </div>
    </CardHeader>
  );
};
