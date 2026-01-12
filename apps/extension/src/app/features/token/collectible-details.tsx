import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Box, Stack, styled } from 'leather-styles/jsx';

import {
  type AccountAddresses,
  CryptoAssetProtocols,
  InscriptionAsset,
  Sip9Asset,
  StampAsset,
} from '@leather.io/models';
import { ArrowLeftIcon, Button, Callout, Spinner } from '@leather.io/ui';
import type { SerializedCryptoAssetId } from '@leather.io/utils';

import { isPopupMode } from '@app/common/utils';
import { Header } from '@app/components/layout/headers/header';
import { HeaderActionButton } from '@app/components/layout/headers/header-action-button';
import { HeaderGrid } from '@app/components/layout/headers/header-grid';
import { useAccountCollectibles } from '@app/query/collectibles/account-collectibles.query';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

import { CollectibleTypeIconOverlay } from '../collectibles/components/collectible-type-icon-overlay.web';
import { InscriptionCard } from '../collectibles/components/inscription-card';
import { Sip9Card } from '../collectibles/components/sip9-card';
import { StampCard } from '../collectibles/components/stamp-card';
import { SendInscriptionDialog } from '../send-inscription';
import { SectionCard } from './collectible-details.layout';
import { InscriptionDetails } from './inscription-details';
import { Sip9Details } from './sip9-details';
import { StampDetails } from './stamp-details';

interface CollectibleDetailsProps {
  account: AccountAddresses;
  assetId: SerializedCryptoAssetId;
  protocol: (typeof CryptoAssetProtocols)['sip9' | 'inscription' | 'stamp'];
}

export function CollectibleDetails({ account, assetId, protocol }: CollectibleDetailsProps) {
  const navigate = useNavigate();
  const network = useCurrentNetwork();
  const { data: collectibles = [], isLoading, isError } = useAccountCollectibles(account);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [sendInscription, setSendInscription] = useState<InscriptionAsset | null>(null);

  if (isLoading) {
    return (
      <Box px="space.05" py="space.05" display="flex" justifyContent="center">
        <Spinner />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box px="space.05" py="space.05">
        <Callout variant="warning" title="Unable to load collectible details">
          Try again in a few moments.
        </Callout>
      </Box>
    );
  }

  const view = collectibles.find(item => item.key === assetId);

  if (!view) {
    return (
      <Box px="space.05" py="space.05">
        <Callout variant="info" title="Collectible not found">
          This collectible is not available for this account.
        </Callout>
      </Box>
    );
  }

  const mediaHeight = isPopupMode() ? 342 : 320;

  let media: React.ReactNode = null;
  if (protocol === CryptoAssetProtocols.stamp) {
    media = <StampCard item={view.asset as StampAsset} height={mediaHeight} />;
  } else if (protocol === CryptoAssetProtocols.sip9) {
    media = <Sip9Card item={view.asset as Sip9Asset} height={mediaHeight} />;
  } else {
    media = <InscriptionCard item={view.asset as InscriptionAsset} height={mediaHeight} />;
  }

  const title = view.title || 'Collectible';
  const subtitle = view.subtitle || '';

  return (
    <Stack width="100%" gap="space.04">
      <Header px={{ base: 'space.04', md: 'space.00' }}>
        <HeaderGrid
          leftCol={
            <HeaderActionButton
              icon={<ArrowLeftIcon />}
              onAction={() => navigate(-1)}
              dataTestId="collectible-details-back"
            />
          }
          centerCol={
            <Stack alignItems="center" gap="space.01">
              <styled.span textStyle="heading.05">{title}</styled.span>
              {subtitle ? (
                <styled.span textStyle="caption.02" color="ink.text-subdued">
                  {subtitle}
                </styled.span>
              ) : null}
            </Stack>
          }
          rightCol={<Box />}
        />
      </Header>

      <Stack
        px={{ base: 'space.04', md: 'space.00' }}
        width="100%"
        maxWidth={{ base: '100%', md: '780px' }}
        margin="0 auto"
        gap="space.04"
      >
        <SectionCard>
          <CollectibleTypeIconOverlay protocol={view.protocol}>{media}</CollectibleTypeIconOverlay>
        </SectionCard>

        {protocol === CryptoAssetProtocols.inscription && (
          <Button fullWidth onClick={() => setSendInscription(view.asset as InscriptionAsset)}>
            Send
          </Button>
        )}

        {sendInscription && (
          <SendInscriptionDialog
            inscription={sendInscription}
            isOpen={!!sendInscription}
            onClose={() => setSendInscription(null)}
          />
        )}

        {protocol === CryptoAssetProtocols.inscription && (
          <InscriptionDetails
            asset={view.asset as InscriptionAsset}
            bitcoinNetwork={network.chain.bitcoin.bitcoinNetwork}
          />
        )}

        {protocol === CryptoAssetProtocols.sip9 && (
          <Sip9Details
            asset={view.asset as Sip9Asset}
            isDescriptionExpanded={isDescriptionExpanded}
            onToggleDescription={() => setIsDescriptionExpanded(v => !v)}
          />
        )}

        {protocol === CryptoAssetProtocols.stamp && (
          <StampDetails
            asset={view.asset as StampAsset}
            bitcoinNetwork={network.chain.bitcoin.bitcoinNetwork}
          />
        )}
      </Stack>
    </Stack>
  );
}
