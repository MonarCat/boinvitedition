
import React from 'react';
import { EnhancedQRGenerator } from '@/components/qr/EnhancedQRGenerator';

interface BusinessQRGeneratorProps {
  businessId: string;
  businessName: string;
}

export const BusinessQRGenerator: React.FC<BusinessQRGeneratorProps> = ({
  businessId,
  businessName
}) => {
  return <EnhancedQRGenerator businessId={businessId} businessName={businessName} />;
};
