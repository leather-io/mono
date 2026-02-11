import { useGlobalSheets } from '@/core/global-sheet-provider';
import { useOpenUrl } from '@/features/browser/browser/use-open-url';
import { t } from '@lingui/core/macro';

import { BNS_REGISTRATION_URL } from '@leather.io/constants';
import {
  Box,
  Button,
  Text,
  btcDomainImage,
  ordInscriptionImage,
  stxNftImage,
} from '@leather.io/ui/native';

import { NftSectionCell } from './nft-section-cell';

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
      <NftSectionCell
        image={btcDomainImage}
        title={t`.btc domain`}
        caption={t`Get your .btc domain`}
        asideComponent={
          <Button variant="outline" size="sm" onPress={() => openUrl(BNS_REGISTRATION_URL)}>
            {t`Register`}
          </Button>
        }
      />
      <NftSectionCell
        image={stxNftImage}
        title={t`Stacks NFT`}
        caption={t`Stacks Blockchain`}
        asideComponent={
          <Button
            variant="outline"
            size="sm"
            onPress={() => receiveSheetRef.current?.present('stacks')}
          >
            {t`Receive`}
          </Button>
        }
      />
      <NftSectionCell
        image={ordInscriptionImage}
        title={t`Ordinal Inscriptions`}
        caption={t`Bitcoin Blockchain`}
        asideComponent={
          <Button
            variant="outline"
            size="sm"
            onPress={() => receiveSheetRef.current?.present('taproot')}
          >
            {t`Receive`}
          </Button>
        }
      />
    </Box>
  );
}
