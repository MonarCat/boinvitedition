
import React from 'react';
import { useGeneralSettings } from '@/hooks/useGeneralSettings';
import { GeneralSettingsContainer } from '@/components/settings/general/GeneralSettingsContainer';
import { GeneralSettingsForm } from '@/components/settings/general/GeneralSettingsForm';

export const GeneralSettings = () => {
  const {
    settings,
    isLoading,
    errors,
    isUpdating,
    handleSubmit,
    error,
    handleError
  } = useGeneralSettings();

  // Handle error using useEffect
  React.useEffect(() => {
    if (error) {
      handleError(error, { customMessage: 'Failed to load general settings' });
    }
  }, [error, handleError]);

  return (
    <GeneralSettingsContainer isLoading={isLoading}>
      <GeneralSettingsForm
        settings={settings}
        errors={errors}
        isLoading={isUpdating}
        onSubmit={handleSubmit}
      />
    </GeneralSettingsContainer>
  );
};
