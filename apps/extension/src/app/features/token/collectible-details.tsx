import { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { ORD_IO_URL } from '@leather.io/constants';
import {
  type AccountAddresses,
  CryptoAssetProtocols,
  InscriptionAsset,
  Sip9Asset,
  StampAsset,
} from '@leather.io/models';
import {
  ArrowLeftIcon,
  ArrowUpIcon,
  Callout,
  DropdownMenu,
  EllipsisVIcon,
  ExternalLinkIcon,
  Flag,
  IconButton,
  LockIcon,
  UnlockIcon,
} from '@leather.io/ui';
import type { SerializedCryptoAssetId } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';

import { isPopupMode } from '@app/common/utils';
import { openInNewTab } from '@app/common/utils/open-in-new-tab';
import { Header } from '@app/components/layout/headers/header';
import { HeaderActionButton } from '@app/components/layout/headers/header-action-button';
import { HeaderGrid } from '@app/components/layout/headers/header-grid';
import { useAccountCollectibles } from '@app/query/collectibles/account-collectibles.query';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';
import { useCurrentAccountDiscardedInscriptions } from '@app/store/settings/settings.selectors';

import { CollectibleTypeIconOverlay } from '../collectibles/components/collectible-type-icon-overlay.web';
import { InscriptionCard } from '../collectibles/components/inscription-card';
import { Sip9Card } from '../collectibles/components/sip9-card';
import { StampCard } from '../collectibles/components/stamp-card';
import { CollectibleDetailsLoading } from './collectible-details-loading';
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
  const location = useLocation();
  const network = useCurrentNetwork();
  const { data: collectibles = [], isLoading, isError } = useAccountCollectibles(account);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const { hasInscriptionBeenDiscarded, discardInscription, recoverInscription } =
    useCurrentAccountDiscardedInscriptions();

  const view = collectibles.find(item => item.key === assetId);
  const inscription =
    protocol === CryptoAssetProtocols.inscription ? (view?.asset as InscriptionAsset) : null;
  const isInscriptionDiscarded = inscription ? hasInscriptionBeenDiscarded(inscription) : false;

  const handleSendInscription = useCallback(() => {
    if (!inscription) return;
    void navigate(`/${RouteUrls.SendOrdinalInscription}`, {
      state: { inscription, backgroundLocation: location },
    });
  }, [navigate, inscription, location]);

  const handleOpenOriginal = useCallback(() => {
    if (!inscription) return;
    openInNewTab(`${ORD_IO_URL}/${inscription.number}`);
  }, [inscription]);

  const handleToggleProtection = useCallback(() => {
    if (!inscription) return;
    if (isInscriptionDiscarded) {
      recoverInscription(inscription);
    } else {
      discardInscription(inscription);
    }
  }, [inscription, isInscriptionDiscarded, recoverInscription, discardInscription]);

  if (isLoading) {
    return <CollectibleDetailsLoading onBack={() => navigate(-1)} />;
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
    <Stack width="100%" gap="space.04" data-testid="collectible-details-container">
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
          rightCol={
            protocol === CryptoAssetProtocols.inscription && inscription ? (
              <Flex alignItems="center" gap="space.01">
                <HeaderActionButton
                  icon={<ArrowUpIcon />}
                  onAction={handleSendInscription}
                  dataTestId="collectible-details-send"
                />
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    <IconButton
                      _focus={{ outline: 'focus' }}
                      _hover={{ bg: 'ink.component-background-hover' }}
                      color="ink.action-primary-default"
                      icon={<EllipsisVIcon />}
                      data-testid="collectible-details-options"
                    />
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content align="end" side="bottom" sideOffset={4}>
                    <DropdownMenu.Item
                      onClick={handleOpenOriginal}
                      data-testid="view-original-menu-item"
                    >
                      <Flag img={<ExternalLinkIcon />} width="100%">
                        <styled.span textStyle="label.02">View original</styled.span>
                      </Flag>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onClick={handleToggleProtection}
                      data-testid={
                        isInscriptionDiscarded ? 'protect-menu-item' : 'unprotect-menu-item'
                      }
                    >
                      <Flag
                        img={isInscriptionDiscarded ? <LockIcon /> : <UnlockIcon />}
                        width="100%"
                      >
                        <styled.span textStyle="label.02">
                          {isInscriptionDiscarded ? 'Protect' : 'Unprotect'}
                        </styled.span>
                      </Flag>
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </Flex>
            ) : (
              <Box />
            )
          }
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
