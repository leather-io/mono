import { t } from '@lingui/core/macro';
import { Image } from 'expo-image';

import { Box, Button, Text } from '@leather.io/ui/native';

interface SwapReviewEmptyStateProps {
  onBack(): void;
}

export function SwapReviewEmptyState({ onBack }: SwapReviewEmptyStateProps) {
  return (
    <Box flex={1} px="7" justifyContent="center" alignItems="center" gap="5">
      <Image
        style={{ height: 180, width: 180 }}
        contentFit="contain"
        source={require('@/assets/stickers/ufo.png')}
      />
      <Box gap="2" alignItems="center">
        <Text variant="label01">{t`No quotes available`}</Text>
        <Text variant="body02" color="ink.text-subdued-primary" textAlign="center">
          {t`Not enough liquidity or no route available right now. Try a smaller amount or check back later.`}
        </Text>
      </Box>
      <Button size="sm" variant="outline" onPress={onBack}>
        {t`Go back`}
      </Button>
    </Box>
  );
}
