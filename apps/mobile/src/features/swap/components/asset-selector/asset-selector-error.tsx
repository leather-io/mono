import { t } from '@lingui/core/macro';
import { Image } from 'expo-image';

import { Box, Button, Text } from '@leather.io/ui/native';

interface AssetSelectorErrorProps {
  error: Error;
  onRetry(): void;
}

export function AssetSelectorError({ onRetry }: AssetSelectorErrorProps) {
  return (
    <Box flex={1} px="7" justifyContent="center" alignItems="center">
      <Image
        style={{ height: 180, width: 180 }}
        contentFit="contain"
        source={require('@/assets/stickers/egg.png')}
      />
      <Box gap="2" alignItems="center" mb="4" px="5">
        <Text variant="label01">{t`Unable to load assets`}</Text>
        <Text variant="body02" color="ink.text-subdued-primary" textAlign="center">
          {t`This is usually a temporary network or provider-side issue.`}
        </Text>
      </Box>
      <Button size="sm" variant="outline" onPress={onRetry}>
        {t`Retry`}
      </Button>
    </Box>
  );
}
