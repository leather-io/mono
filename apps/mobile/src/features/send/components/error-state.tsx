import { t } from '@lingui/macro';
import { Image } from 'expo-image';

import { ArrowRotateClockwiseIcon, Box, Button, Text } from '@leather.io/ui/native';

interface ErrorStateProps {
  onRetry: () => void;
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <Box alignItems="center" justifyContent="center" gap="4" style={{ paddingTop: 64 }}>
      <Image
        style={{ height: 200, width: 200 }}
        source={require('@/assets/sticker_no_wallets.png')}
      />
      <Text variant="label01">
        {t({ id: 'send.error_page.title', message: 'Something went wrong' })}
      </Text>
      <Button
        onPress={onRetry}
        icon={<ArrowRotateClockwiseIcon color="ink.background-primary" />}
        title={t({ id: 'send.error_page.action', message: 'Try again' })}
      />
    </Box>
  );
}
