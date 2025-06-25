
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface MpesaSectionProps {
  mpesa_number: string;
  onInputChange: (field: string, value: string) => void;
}

export const MpesaSection: React.FC<MpesaSectionProps> = ({
  mpesa_number,
  onInputChange
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="font-medium text-green-900 mb-2">M-Pesa Direct</h4>
        <p className="text-sm text-green-800">
          Clients can pay directly to your M-Pesa number. Platform fee collected separately.
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="mpesa-number">M-Pesa Phone Number</Label>
        <Input
          id="mpesa-number"
          placeholder="254700000000"
          value={mpesa_number}
          onChange={(e) => onInputChange('mpesa_number', e.target.value.trim())}
        />
      </div>
    </div>
  );
};
