
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Smartphone } from 'lucide-react';

interface MobileMoneySectionProps {
  mpesaNumber: string;
  airtelNumber: string;
  onInputChange: (field: string, value: string) => void;
}

export const MobileMoneySection: React.FC<MobileMoneySectionProps> = ({
  mpesaNumber,
  airtelNumber,
  onInputChange
}) => {
  return (
    <div className="space-y-4">
      <h4 className="font-medium flex items-center gap-2">
        <Smartphone className="w-4 h-4" />
        Mobile Money
      </h4>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="mpesa_number">M-Pesa Number</Label>
          <Input
            id="mpesa_number"
            placeholder="254712345678"
            value={mpesaNumber}
            onChange={(e) => onInputChange('mpesa_number', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="airtel_number">Airtel Money Number</Label>
          <Input
            id="airtel_number"
            placeholder="254712345678"
            value={airtelNumber}
            onChange={(e) => onInputChange('airtel_number', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
