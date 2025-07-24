import { useState } from 'react';
import { Alert } from 'react-native';

import { getStoreButtonText, handleStoreRedirect } from '@/utils/app-store-utils';
import { t } from '@lingui/macro';

import { ButtonV2 } from '@leather.io/ui/native';
import { isError } from '@leather.io/utils';

interface UpdateButtonProps {
  onPress?: () => void;
}

export function UpdateButton({ onPress }: UpdateButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handlePress() {
    onPress?.();

    setIsLoading(true);

    try {
      await handleStoreRedirect();
    } catch (error) {
      Alert.alert(
        t({ id: 'version_guard.store_error_title', message: 'Unable to Open Store' }),
        isError(error) ? error.message : t({ id: 'version_guard.store_error_message' }),
        [{ text: t({ id: 'common.ok', message: 'OK' }), style: 'default' }]
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ButtonV2
      buttonState="default"
      onPress={handlePress}
      disabled={isLoading}
      testID="update-app-button"
      title={getStoreButtonText()}
    />
  );
}
