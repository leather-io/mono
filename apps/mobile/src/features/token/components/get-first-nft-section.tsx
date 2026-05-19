import { useGlobalSheets } from '@/core/global-sheet-provider';
import { useOpenUrl } from '@/features/browser/browser/use-open-url';
import { t } from '@lingui/core/macro';
import { Image } from 'expo-image';

import { BNS_REGISTRATION_URL } from '@leather.io/constants';
import { Box, Cell, Text } from '@leather.io/ui/native';

export function GetFirstNftSection() {
  const { openUrl } = useOpenUrl();
  const { receiveSheetRef } = useGlobalSheets();

  return (
    <Box gap="2">
      <Box px="5" gap="1">
        <Text variant="label01">{t`Get your first NFT`}</Text>
        <Text variant="caption01" color="ink.text-subdued">
          {t`Add your first NFT by buying or transferring from another account.`}
        </Text>
      </Box>
      <Cell.Root pressable onPress={() => openUrl(BNS_REGISTRATION_URL)}>
        <Cell.Icon borderRadius="round">
          <Image
            style={{ height: 40, width: 40 }}
            contentFit="cover"
            source={require('@/assets/btc-domain.png')}
          />
        </Cell.Icon>
        <Cell.Content>
          <Cell.Label variant="primary">{t`Register .btc domain`}</Cell.Label>
          <Cell.Label variant="secondary">{t`Decentralized Bitcoin identity`}</Cell.Label>
        </Cell.Content>
      </Cell.Root>
      <Cell.Root pressable onPress={() => receiveSheetRef.current?.present('stacks')}>
        <Cell.Icon borderRadius="round">
          <Image
            style={{ height: 40, width: 40 }}
            contentFit="cover"
            source={require('@/assets/stx-nft.png')}
          />
        </Cell.Icon>
        <Cell.Content>
          <Cell.Label variant="primary">{t`Receive Stacks NFT`}</Cell.Label>
          <Cell.Label variant="secondary">{t`Transfer from another account`}</Cell.Label>
        </Cell.Content>
      </Cell.Root>
      <Cell.Root pressable onPress={() => openUrl('https://stacks.gamma.io/')}>
        <Cell.Icon borderRadius="round">
          <Image
            style={{ height: 40, width: 40 }}
            contentFit="cover"
            source={require('@/assets/gamma-marketplace.png')}
          />
        </Cell.Icon>
        <Cell.Content>
          <Cell.Label variant="primary">{t`Discover Stacks NFTs`}</Cell.Label>
          <Cell.Label variant="secondary">{t`Browse on Gamma`}</Cell.Label>
        </Cell.Content>
      </Cell.Root>
    </Box>
  );
}
