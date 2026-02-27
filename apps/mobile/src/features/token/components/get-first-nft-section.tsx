import { useGlobalSheets } from '@/core/global-sheet-provider';
import { useOpenUrl } from '@/features/browser/browser/use-open-url';
import { t } from '@lingui/core/macro';
import { Image } from 'expo-image';

import { BNS_REGISTRATION_URL } from '@leather.io/constants';
import { Box, Button, Cell, Text } from '@leather.io/ui/native';

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
      <Cell.Root pressable={false}>
        <Cell.Icon borderRadius="round">
          <Image
            style={{ height: 40, width: 40 }}
            contentFit="cover"
            source={require('@/assets/btc-domain.png')}
          />
        </Cell.Icon>
        <Cell.Content>
          <Cell.Label variant="primary">{t`.btc domain`}</Cell.Label>
          <Cell.Label variant="secondary">{t`Get your .btc domain`}</Cell.Label>
        </Cell.Content>
        <Cell.Aside>
          <Button variant="outline" size="sm" onPress={() => openUrl(BNS_REGISTRATION_URL)}>
            {t`Register`}
          </Button>
        </Cell.Aside>
      </Cell.Root>
      <Cell.Root pressable={false}>
        <Cell.Icon borderRadius="round">
          <Image
            style={{ height: 40, width: 40 }}
            contentFit="cover"
            source={require('@/assets/stx-nft.png')}
          />
        </Cell.Icon>
        <Cell.Content>
          <Cell.Label variant="primary">{t`Stacks NFT`}</Cell.Label>
          <Cell.Label variant="secondary">{t`Stacks Blockchain`}</Cell.Label>
        </Cell.Content>
        <Cell.Aside>
          <Button
            variant="outline"
            size="sm"
            onPress={() => receiveSheetRef.current?.present('stacks')}
          >
            {t`Receive`}
          </Button>
        </Cell.Aside>
      </Cell.Root>
      <Cell.Root pressable={false}>
        <Cell.Icon borderRadius="round">
          <Image
            style={{ height: 40, width: 40 }}
            contentFit="cover"
            source={require('@/assets/ord-inscription.png')}
          />
        </Cell.Icon>
        <Cell.Content>
          <Cell.Label variant="primary">{t`Ordinal Inscriptions`}</Cell.Label>
          <Cell.Label variant="secondary">{t`Bitcoin Blockchain`}</Cell.Label>
        </Cell.Content>
        <Cell.Aside>
          <Button
            variant="outline"
            size="sm"
            onPress={() => receiveSheetRef.current?.present('taproot')}
          >
            {t`Receive`}
          </Button>
        </Cell.Aside>
      </Cell.Root>
    </Box>
  );
}
