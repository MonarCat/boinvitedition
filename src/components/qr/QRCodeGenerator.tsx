import React from 'react';
import { BusinessQRGenerator } from '@/components/business/BusinessQRGenerator';

interface QRCodeGeneratorProps {
  businessId: string;
  businessName: string;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ businessId, businessName }) => {
  return (
    <BusinessQRGenerator businessId={businessId} businessName={businessName} />
  );
};

export default QRCodeGenerator;
