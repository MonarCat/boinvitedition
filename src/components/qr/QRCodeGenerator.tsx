
import React from 'react';
import { ReliableQRGenerator } from './ReliableQRGenerator';

type QRCodeGeneratorProps = {
  businessId: string;
  businessName: string;
};

export const QRCodeGenerator = ({ businessId, businessName }: QRCodeGeneratorProps) => {
  return <ReliableQRGenerator businessId={businessId} businessName={businessName} />;
};
