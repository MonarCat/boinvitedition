
import React from 'react';
import { GeneralSettingsContainer } from './general/GeneralSettingsContainer';
import { EnhancedPaymentMethodsSection } from './general/EnhancedPaymentMethodsSection';
import { PaystackIntegrationSection } from './PaystackIntegrationSection';
import { GeneralSettingsForm } from './general/GeneralSettingsForm';
import { useGeneralSettings } from '@/hooks/useGeneralSettings';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';

export const GeneralSettings = () => {
  const { 
    business, 
    settings, 
    isLoading: settingsLoading, 
    errors, 
    isUpdating, 
    handleSubmit 
  } = useGeneralSettings();
  
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
    <div className="space-y-8">
      <GeneralSettingsContainer isLoading={settingsLoading}>
        <GeneralSettingsForm
          settings={settings}
          errors={errors}
          isLoading={isUpdating}
          onSubmit={handleSubmit}
        />
      </GeneralSettingsContainer>
      
      <PaystackIntegrationSection />
      
      {!paymentMethodsLoading && (
        <EnhancedPaymentMethodsSection
          paymentMethods={paymentMethods}
          onAddPayment={addPaymentMethod}
          onUpdatePayment={(id: string, updates: any) => updatePaymentMethod({ id, updates })}
          onRemovePayment={removePaymentMethod}
        />
      )}
    </div>
  );
};
