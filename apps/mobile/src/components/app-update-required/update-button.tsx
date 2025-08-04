import { useState } from 'react';
import { Alert } from 'react-native';

import { getStoreButtonText, handleStoreRedirect } from '@/utils/app-store-utils';
import { t } from '@lingui/core/macro';

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
      Alert.alert(t`Unable to Open Store`, isError(error) ? error.message : undefined, [
        { text: t`OK`, style: 'default' },
      ]);
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
