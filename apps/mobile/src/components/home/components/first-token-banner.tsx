import { t } from '@lingui/core/macro';
import { Image } from 'expo-image';

import { Box, Text } from '@leather.io/ui/native';

export function FirstTokenBanner() {
  return (
    <Box p="5" alignItems="center" flexDirection="row">
      <Box flexShrink={1}>
        <Text variant="label01">{t`Get your first token`}</Text>
        <Text variant="caption01">
          {t`Fund your wallet by buying tokens or transferring from another account.`}
        </Text>
      </Box>
      <Box>
        <Image
          style={{ height: 48, width: 80 }}
          contentFit="cover"
          source={require('@leather.io/ui/assets/images/exchange-icons.png')}
        />
      </Box>
    </Box>
  );
}
