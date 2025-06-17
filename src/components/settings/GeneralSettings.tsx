
import React from 'react';
import { GeneralSettingsContainer } from './general/GeneralSettingsContainer';
import { PaymentDetailsSection } from './general/PaymentDetailsSection';
import { useGeneralSettings } from '@/hooks/useGeneralSettings';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';

export const GeneralSettings = () => {
  const { business, isLoading: settingsLoading } = useGeneralSettings();
  const {
    paymentMethods,
    addPaymentMethod,
    updatePaymentMethod,
    removePaymentMethod,
    isLoading: paymentMethodsLoading
  } = usePaymentMethods(business?.id || '');

  if (!business) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading business settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <GeneralSettingsContainer isLoading={settingsLoading}>
        <div className="text-lg font-semibold">General Settings</div>
      </GeneralSettingsContainer>
      
      {!paymentMethodsLoading && (
        <PaymentDetailsSection
          paymentMethods={paymentMethods}
          onAddPayment={addPaymentMethod}
          onUpdatePayment={(id: string, updates: any) => updatePaymentMethod({ id, updates })}
          onRemovePayment={removePaymentMethod}
        />
      )}
    </div>
  );
};
