
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { PayoutSettingsContainer } from './payout/PayoutSettingsContainer';
import { PayoutSettingsForm } from './payout/PayoutSettingsForm';
import { validatePayoutForm } from './payout/PayoutValidation';

interface BusinessPayoutSettingsProps {
  businessId: string;
}

export const BusinessPayoutSettings: React.FC<BusinessPayoutSettingsProps> = ({ businessId }) => {
  const [payoutSettings, setPayoutSettings] = useState({
    mpesa_number: '',
    airtel_number: '',
    bank_account_number: '',
    bank_name: '',
    account_holder_name: '',
    is_verified: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPayoutSettings();
  }, [businessId]);

  const loadPayoutSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('business_payouts')
        .select('*')
        .eq('business_id', businessId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPayoutSettings({
          mpesa_number: data.mpesa_number || '',
          airtel_number: data.airtel_number || '',
          bank_account_number: data.bank_account_number || '',
          bank_name: data.bank_name || '',
          account_holder_name: data.account_holder_name || '',
          is_verified: data.is_verified || false
        });
      }
    } catch (error) {
      console.error('Error loading payout settings:', error);
      toast.error('Failed to load payout settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!businessId) {
      toast.error('Business ID is required');
      return;
    }

    const validationError = validatePayoutForm(payoutSettings);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSaving(true);
    try {
      // First check if record exists
      const { data: existingRecord } = await supabase
        .from('business_payouts')
        .select('id')
        .eq('business_id', businessId)
        .maybeSingle();

      const payoutData = {
        business_id: businessId,
        mpesa_number: payoutSettings.mpesa_number || null,
        airtel_number: payoutSettings.airtel_number || null,
        bank_account_number: payoutSettings.bank_account_number || null,
        bank_name: payoutSettings.bank_name || null,
        account_holder_name: payoutSettings.account_holder_name || null,
        is_verified: false, // Reset verification when updating
        updated_at: new Date().toISOString()
      };

      let result;
      if (existingRecord) {
        // Update existing record
        result = await supabase
          .from('business_payouts')
          .update(payoutData)
          .eq('business_id', businessId);
      } else {
        // Insert new record
        result = await supabase
          .from('business_payouts')
          .insert(payoutData);
      }

      if (result.error) {
        throw result.error;
      }

      toast.success('Payout settings saved successfully');
      await loadPayoutSettings();
    } catch (error: any) {
      console.error('Error saving payout settings:', error);
      
      // Provide specific error messages based on the error type
      if (error.code === '23505') {
        toast.error('Duplicate entry detected. Please refresh and try again.');
      } else if (error.message) {
        toast.error(`Failed to save: ${error.message}`);
      } else {
        toast.error('Failed to save payout settings. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setPayoutSettings(prev => ({
      ...prev,
      [field]: value.trim()
    }));
  };

  return (
    <PayoutSettingsContainer 
      isLoading={isLoading} 
      isVerified={payoutSettings.is_verified}
    >
      <PayoutSettingsForm
        payoutSettings={payoutSettings}
        isSaving={isSaving}
        onInputChange={handleInputChange}
        onSave={handleSave}
      />
    </PayoutSettingsContainer>
  );
};
