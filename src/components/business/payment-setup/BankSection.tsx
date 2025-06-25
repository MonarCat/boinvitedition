
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface BankSectionProps {
  bank_name: string;
  bank_account_number: string;
  account_holder_name: string;
  onInputChange: (field: string, value: string) => void;
}

export const BankSection: React.FC<BankSectionProps> = ({
  bank_name,
  bank_account_number,
  account_holder_name,
  onInputChange
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-orange-50 p-4 rounded-lg">
        <h4 className="font-medium text-orange-900 mb-2">Bank Transfer</h4>
        <p className="text-sm text-orange-800">
          Clients can transfer directly to your bank account. Platform fee collected separately.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bank-name">Bank Name</Label>
          <Input
            id="bank-name"
            placeholder="Kenya Commercial Bank"
            value={bank_name}
            onChange={(e) => onInputChange('bank_name', e.target.value.trim())}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="account-number">Account Number</Label>
          <Input
            id="account-number"
            placeholder="1234567890"
            value={bank_account_number}
            onChange={(e) => onInputChange('bank_account_number', e.target.value.trim())}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="account-holder">Account Holder Name</Label>
        <Input
          id="account-holder"
          placeholder="John Doe"
          value={account_holder_name}
          onChange={(e) => onInputChange('account_holder_name', e.target.value.trim())}
        />
      </div>
    </div>
  );
};
