
import React from 'react';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { BusinessSettingsContainer } from '@/components/settings/business/BusinessSettingsContainer';
import { BusinessSettingsForm } from '@/components/settings/business/BusinessSettingsForm';
import { NewUserBusinessSetup } from '@/components/settings/business/NewUserBusinessSetup';

export const BusinessSettings = () => {
  const {
    business,
    isLoading,
    errors,
    isUpdating,
    handleSubmit
  } = useBusinessSettings();

  // Show new user setup if no business exists
  if (!isLoading && !business) {
    return <NewUserBusinessSetup />;
  }

  return (
    <BusinessSettingsContainer isLoading={isLoading} business={business}>
      <BusinessSettingsForm
        business={business}
        errors={errors}
        isLoading={isUpdating}
        onSubmit={handleSubmit}
      />
    </BusinessSettingsContainer>
  );
};
