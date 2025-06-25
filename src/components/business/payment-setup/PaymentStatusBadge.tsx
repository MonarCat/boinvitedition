
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface PaymentStatusBadgeProps {
  hasPaystack: boolean;
  hasMpesa: boolean;
  hasBank: boolean;
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({
  hasPaystack,
  hasMpesa,
  hasBank
}) => {
  const getPaymentStatus = () => {
    if (hasPaystack || hasMpesa || hasBank) {
      return { status: 'complete', color: 'bg-green-500', text: 'Setup Complete' };
    }
    return { status: 'incomplete', color: 'bg-red-500', text: 'Setup Required' };
  };

  const status = getPaymentStatus();

  return (
    <Badge className={status.color}>
      {status.status === 'complete' ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
      {status.text}
    </Badge>
  );
};
