
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { PaymentSetupContainer } from './payment-setup/PaymentSetupContainer';
import { PaymentSetupForm } from './payment-setup/PaymentSetupForm';
import { validatePaymentSetup } from './payment-setup/PaymentSetupValidation';

interface BusinessPaymentSetupProps {
  businessId: string;
  onSetupComplete?: () => void;
}

export const BusinessPaymentSetup: React.FC<BusinessPaymentSetupProps> = ({
  businessId,
  onSetupComplete
}) => {
  const [loading, setLoading] = useState(false);
  const [payoutData, setPayoutData] = useState<any>(null);
  const [configs, setConfigs] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    mpesa_number: '',
    bank_name: '',
    bank_account_number: '',
    account_holder_name: '',
    paystack_subaccount_code: '',
    auto_split_enabled: false
  });

  useEffect(() => {
    loadPaymentData();
  }, [businessId]);

  const loadPaymentData = async () => {
    try {
      // Load existing payout data
      const { data: payout } = await supabase
        .from('business_payouts')
        .select('*')
        .eq('business_id', businessId)
        .maybeSingle();

      if (payout) {
        setPayoutData(payout);
        setFormData({
          mpesa_number: payout.mpesa_number || '',
          bank_name: payout.bank_name || '',
          bank_account_number: payout.bank_account_number || '',
          account_holder_name: payout.account_holder_name || '',
          paystack_subaccount_code: payout.paystack_subaccount_code || '',
          auto_split_enabled: Boolean(payout.auto_split_enabled)
        });
      }

      // Load payment configs
      const { data: configData } = await supabase
        .from('business_payment_configs')
        .select('*')
        .eq('business_id', businessId);

      setConfigs(configData || []);
    } catch (error) {
      console.error('Error loading payment data:', error);
    }
  };

  const savePaymentData = async () => {
    if (!businessId) {
      toast.error('Business ID is required');
      return;
    }

    const validationError = validatePaymentSetup(formData);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoading(true);
    try {
      // Check if record exists
      const { data: existingRecord } = await supabase
        .from('business_payouts')
        .select('id')
        .eq('business_id', businessId)
        .maybeSingle();

      const payoutPayload = {
        business_id: businessId,
        mpesa_number: formData.mpesa_number || null,
        bank_name: formData.bank_name || null,
        bank_account_number: formData.bank_account_number || null,
        account_holder_name: formData.account_holder_name || null,
        paystack_subaccount_code: formData.paystack_subaccount_code || null,
        auto_split_enabled: formData.auto_split_enabled,
        split_percentage: 95.0,
        updated_at: new Date().toISOString()
      };

      let payoutResult;
      if (existingRecord) {
        payoutResult = await supabase
          .from('business_payouts')
          .update(payoutPayload)
          .eq('business_id', businessId);
      } else {
        payoutResult = await supabase
          .from('business_payouts')
          .insert(payoutPayload);
      }

      if (payoutResult.error) throw payoutResult.error;

      // Update business payment setup status
      const hasValidPayment = formData.mpesa_number || 
        (formData.bank_name && formData.bank_account_number) ||
        formData.paystack_subaccount_code;

      const { error: businessError } = await supabase
        .from('businesses')
        .update({
          payment_setup_complete: Boolean(hasValidPayment),
          paystack_subaccount_id: formData.paystack_subaccount_code || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', businessId);

      if (businessError) throw businessError;

      toast.success('Payment settings saved successfully');
      loadPaymentData();
      onSetupComplete?.();
    } catch (error: any) {
      console.error('Error saving payment data:', error);
      
      if (error.code === '23505') {
        toast.error('Duplicate entry detected. Please refresh and try again.');
      } else if (error.message) {
        toast.error(`Failed to save: ${error.message}`);
      } else {
        toast.error('Failed to save payment settings. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? value.trim() : value
    }));
  };

  const hasPaystack = formData.paystack_subaccount_code;
  const hasMpesa = formData.mpesa_number;
  const hasBank = formData.bank_name && formData.bank_account_number;

  return (
    <PaymentSetupContainer
      hasPaystack={!!hasPaystack}
      hasMpesa={!!hasMpesa}
      hasBank={!!hasBank}
    >
      <PaymentSetupForm
        formData={formData}
        configs={configs}
        loading={loading}
        onInputChange={handleInputChange}
        onSave={savePaymentData}
      />
    </PaymentSetupContainer>
  );
};
