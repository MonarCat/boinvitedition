
import React from 'react';
import { BusinessQRGenerator } from '../business/BusinessQRGenerator';

type QRCodeGeneratorProps = {
  businessId: string;
  businessName: string;
};

export const QRCodeGenerator = ({ businessId, businessName }: QRCodeGeneratorProps) => {
  return <BusinessQRGenerator businessId={businessId} businessName={businessName} />;
};
