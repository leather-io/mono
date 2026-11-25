import eggImage from '@/assets/stickers/egg.png';
import { t } from '@lingui/core/macro';
import { Image } from 'expo-image';

import { Box, Button, Text } from '@leather.io/ui/native';

interface ActivityErrorProps {
  onRetry(): void;
}

export function ActivityError({ onRetry }: ActivityErrorProps) {
  return (
    <Box flexGrow={1} px="7" justifyContent="center" alignItems="center">
      <Image style={{ height: 180, width: 180 }} contentFit="contain" source={eggImage} />
      <Box gap="2" alignItems="center" mb="4" px="5">
        <Text variant="label01">{t`Unable to load activity`}</Text>
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
