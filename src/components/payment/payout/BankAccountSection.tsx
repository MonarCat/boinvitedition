
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Building } from 'lucide-react';

interface BankAccountSectionProps {
  accountHolderName: string;
  bankName: string;
  bankAccountNumber: string;
  onInputChange: (field: string, value: string) => void;
}

export const BankAccountSection: React.FC<BankAccountSectionProps> = ({
  accountHolderName,
  bankName,
  bankAccountNumber,
  onInputChange
}) => {
  return (
    <div className="space-y-4">
      <h4 className="font-medium flex items-center gap-2">
        <Building className="w-4 h-4" />
        Bank Account
      </h4>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="account_holder_name">Account Holder Name</Label>
          <Input
            id="account_holder_name"
            placeholder="John Doe"
            value={accountHolderName}
            onChange={(e) => onInputChange('account_holder_name', e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bank_name">Bank Name</Label>
            <Input
              id="bank_name"
              placeholder="Equity Bank"
              value={bankName}
              onChange={(e) => onInputChange('bank_name', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="bank_account_number">Account Number</Label>
            <Input
              id="bank_account_number"
              placeholder="1234567890"
              value={bankAccountNumber}
              onChange={(e) => onInputChange('bank_account_number', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
