
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PaystackSection } from './PaystackSection';
import { MpesaSection } from './MpesaSection';
import { BankSection } from './BankSection';
import { ActiveConfigurationsList } from './ActiveConfigurationsList';

interface PaymentSetupFormProps {
  formData: {
    mpesa_number: string;
    bank_name: string;
    bank_account_number: string;
    account_holder_name: string;
    paystack_subaccount_code: string;
    auto_split_enabled: boolean;
  };
  configs: any[];
  loading: boolean;
  onInputChange: (field: string, value: string | boolean) => void;
  onSave: () => void;
}

export const PaymentSetupForm: React.FC<PaymentSetupFormProps> = ({
  formData,
  configs,
  loading,
  onInputChange,
  onSave
}) => {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="paystack" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="paystack">Paystack Split</TabsTrigger>
          <TabsTrigger value="mpesa">M-Pesa</TabsTrigger>
          <TabsTrigger value="bank">Bank Account</TabsTrigger>
        </TabsList>

        <TabsContent value="paystack">
          <PaystackSection
            paystack_subaccount_code={formData.paystack_subaccount_code}
            auto_split_enabled={formData.auto_split_enabled}
            onInputChange={onInputChange}
          />
        </TabsContent>

        <TabsContent value="mpesa">
          <MpesaSection
            mpesa_number={formData.mpesa_number}
            onInputChange={onInputChange}
          />
        </TabsContent>

        <TabsContent value="bank">
          <BankSection
            bank_name={formData.bank_name}
            bank_account_number={formData.bank_account_number}
            account_holder_name={formData.account_holder_name}
            onInputChange={onInputChange}
          />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end pt-4">
        <Button onClick={onSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Payment Settings'}
        </Button>
      </div>

      <ActiveConfigurationsList configs={configs} />
    </div>
  );
};
