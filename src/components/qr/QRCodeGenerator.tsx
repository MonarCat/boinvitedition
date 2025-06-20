
import React from 'react';
import { EnhancedQRGenerator } from './EnhancedQRGenerator';

type QRCodeGeneratorProps = {
  businessId: string;
  businessName: string;
};

export const QRCodeGenerator = ({ businessId, businessName }: QRCodeGeneratorProps) => {
  return <EnhancedQRGenerator businessId={businessId} businessName={businessName} />;
};
