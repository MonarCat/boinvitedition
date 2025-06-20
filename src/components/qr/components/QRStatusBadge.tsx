
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface QRStatusBadgeProps {
  validationStatus: 'pending' | 'valid' | 'invalid';
  isValidating: boolean;
}

export const QRStatusBadge: React.FC<QRStatusBadgeProps> = ({
  validationStatus,
  isValidating
}) => {
  if (isValidating) {
    return <Badge variant="secondary">Validating...</Badge>;
  }
  
  switch (validationStatus) {
    case 'valid':
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle className="w-3 h-3 mr-1" />
          Ready
        </Badge>
      );
    case 'invalid':
      return (
        <Badge variant="destructive">
          <AlertCircle className="w-3 h-3 mr-1" />
          Invalid
        </Badge>
      );
    default:
      return <Badge variant="secondary">Pending</Badge>;
  }
};
