
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { MobileMoneySection } from './MobileMoneySection';
import { BankAccountSection } from './BankAccountSection';
import { VerificationStatus } from './VerificationStatus';
import { RevenueInfoCard } from './RevenueInfoCard';

interface PayoutSettingsData {
  mpesa_number: string;
  airtel_number: string;
  bank_account_number: string;
  bank_name: string;
  account_holder_name: string;
  is_verified: boolean;
}

interface PayoutSettingsFormProps {
  payoutSettings: PayoutSettingsData;
  isSaving: boolean;
  onInputChange: (field: string, value: string) => void;
  onSave: () => void;
}

export const PayoutSettingsForm: React.FC<PayoutSettingsFormProps> = ({
  payoutSettings,
  isSaving,
  onInputChange,
  onSave
}) => {
  return (
    <div className="space-y-6">
      <MobileMoneySection
        mpesaNumber={payoutSettings.mpesa_number}
        airtelNumber={payoutSettings.airtel_number}
        onInputChange={onInputChange}
      />

      <Separator />

      <BankAccountSection
        accountHolderName={payoutSettings.account_holder_name}
        bankName={payoutSettings.bank_name}
        bankAccountNumber={payoutSettings.bank_account_number}
        onInputChange={onInputChange}
      />

      <Separator />

      <VerificationStatus />

      <Button 
        onClick={onSave} 
        disabled={isSaving}
        className="w-full"
      >
        {isSaving ? 'Saving...' : 'Save Payout Settings'}
      </Button>

      <RevenueInfoCard />
    </div>
  );
};
