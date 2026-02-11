import { useOpenUrl } from '@/features/browser/browser/use-open-url';
import { t } from '@lingui/core/macro';

import { GAMMA_URL, MAGIC_EDEN_URL } from '@leather.io/constants';
import { Box, Text, gammaMarketplaceImage, magicEdenMarketplaceImage } from '@leather.io/ui/native';

import { NftSectionCell } from './nft-section-cell';

export function DiscoverMarketplacesSection() {
  const { openUrl } = useOpenUrl();

  return (
    <Box gap="2">
      <Box px="5">
        <Text variant="label01">{t`Discover marketplaces`}</Text>
      </Box>
      <NftSectionCell
        image={gammaMarketplaceImage}
        title={t`Gamma`}
        caption={t`Bitcoin NFTs and Web3 creativity built on Stacks.`}
        onPress={() => openUrl(GAMMA_URL)}
      />
      <NftSectionCell
        image={magicEdenMarketplaceImage}
        title={t`Magic Eden`}
        caption={t`Leading multi-chain marketplace across Bitcoin, Solana and more`}
        onPress={() => openUrl(MAGIC_EDEN_URL)}
      />
    </Box>
  );
}
