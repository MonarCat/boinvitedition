
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

interface PaystackSectionProps {
  paystack_subaccount_code: string;
  auto_split_enabled: boolean;
  onInputChange: (field: string, value: string | boolean) => void;
}

export const PaystackSection: React.FC<PaystackSectionProps> = ({
  paystack_subaccount_code,
  auto_split_enabled,
  onInputChange
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Recommended: Automatic Split</h4>
        <p className="text-sm text-blue-800">
          Clients pay once, you receive 95% automatically, Boinvit receives 5%. 
          Requires a Paystack subaccount.
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="paystack-subaccount">Paystack Subaccount Code</Label>
        <Input
          id="paystack-subaccount"
          placeholder="ACCT_xxxxxxxxxx"
          value={paystack_subaccount_code}
          onChange={(e) => onInputChange('paystack_subaccount_code', e.target.value.trim())}
        />
        <p className="text-xs text-gray-600">
          Create a subaccount in your Paystack dashboard and enter the code here
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="auto-split"
          checked={auto_split_enabled}
          onCheckedChange={(checked) => onInputChange('auto_split_enabled', checked)}
        />
        <Label htmlFor="auto-split">Enable automatic payment splitting</Label>
      </div>
    </div>
  );
};
