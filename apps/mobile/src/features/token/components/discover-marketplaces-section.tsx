import { useOpenUrl } from '@/features/browser/browser/use-open-url';
import { t } from '@lingui/core/macro';
import { Image } from 'expo-image';

import { GAMMA_URL } from '@leather.io/constants';
import { Box, Cell, Text } from '@leather.io/ui/native';

export function DiscoverMarketplacesSection() {
  const { openUrl } = useOpenUrl();

  return (
    <Box gap="2">
      <Box px="5">
        <Text variant="label01">{t`Discover marketplaces`}</Text>
      </Box>
      <Cell.Root pressable onPress={() => openUrl(GAMMA_URL)}>
        <Cell.Icon borderRadius="round">
          <Image
            style={{ height: 40, width: 40 }}
            contentFit="cover"
            source={require('@/assets/gamma-marketplace.png')}
          />
        </Cell.Icon>
        <Cell.Content>
          <Cell.Label variant="primary">{t`Gamma`}</Cell.Label>
          <Cell.Label variant="secondary">{t`Discover and trade Stacks NFTs`}</Cell.Label>
        </Cell.Content>
      </Cell.Root>
    </Box>
  );
}
