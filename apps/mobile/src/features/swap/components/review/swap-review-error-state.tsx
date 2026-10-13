import { t } from '@lingui/core/macro';
import { Image } from 'expo-image';

import { Box, Button, Text } from '@leather.io/ui/native';

interface SwapReviewErrorStateProps {
  onRetry(): void;
}

export function SwapReviewErrorState({ onRetry }: SwapReviewErrorStateProps) {
  return (
    <Box flex={1} px="7" justifyContent="center" alignItems="center" gap="5">
      <Image
        style={{ height: 180, width: 180 }}
        contentFit="contain"
        source={require('@/assets/stickers/egg.png')}
      />
      <Box gap="2" alignItems="center">
        <Text variant="label01">{t`Unable to load swap details`}</Text>
        <Text variant="body02" color="ink.text-subdued" textAlign="center">
          {t`This is usually a temporary network or provider-side issue.`}
        </Text>
      </Box>
      <Button size="sm" variant="outline" onPress={onRetry}>
        {t`Retry`}
      </Button>
    </Box>
  );
}
