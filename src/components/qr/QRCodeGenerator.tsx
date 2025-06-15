
import React from 'react';
import { BusinessQRGenerator } from '@/components/business/BusinessQRGenerator';

// Fix: QRCodeGenerator must require a businessId prop and pass it along.
type QRCodeGeneratorProps = {
  businessId: string;
};

export const QRCodeGenerator = ({ businessId }: QRCodeGeneratorProps) => {
  return <BusinessQRGenerator businessId={businessId} />;
};
