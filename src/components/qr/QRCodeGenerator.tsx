
import React from 'react';
import { BoinvitQRGenerator } from './BoinvitQRGenerator';

type QRCodeGeneratorProps = {
  businessId: string;
  businessName: string;
};

export const QRCodeGenerator = ({ businessId, businessName }: QRCodeGeneratorProps) => {
  return <BoinvitQRGenerator businessId={businessId} businessName={businessName} />;
};
