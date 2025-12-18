import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import {
  type AccountAddresses,
  CryptoAssetProtocols,
  InscriptionAsset,
  Sip9Asset,
  StampAsset,
} from '@leather.io/models';
import { ArrowLeftIcon, Callout, ChevronDownIcon, ChevronUpIcon, Spinner } from '@leather.io/ui';
import { type SerializedCryptoAssetId } from '@leather.io/utils';

import { isPopupMode } from '@app/common/utils';
import { Header } from '@app/components/layout/headers/header';
import { HeaderActionButton } from '@app/components/layout/headers/header-action-button';
import { HeaderGrid } from '@app/components/layout/headers/header-grid';
import { useAccountCollectibles } from '@app/query/collectibles/account-collectibles.query';

import { CollectibleTypeIconOverlay } from '../collectibles/components/collectible-type-icon-overlay.web';
import { InscriptionCard } from '../collectibles/components/inscription-card';
import { Sip9Card } from '../collectibles/components/sip9-card';
import { StampCard } from '../collectibles/components/stamp-card';

interface CollectibleDetailsProps {
  account: AccountAddresses;
  assetId: SerializedCryptoAssetId;
  protocol: (typeof CryptoAssetProtocols)['sip9' | 'inscription' | 'stamp'];
}

function SectionDivider() {
  return (
    <styled.hr border="0" borderTop="1px solid" borderColor="ink.border-default" width="100%" />
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Flex justifyContent="space-between" gap="space.04">
      <styled.span textStyle="caption.02" color="ink.text-subdued">
        {label}
      </styled.span>
      <styled.span textStyle="caption.02" textAlign="right" overflowWrap="anywhere" maxWidth="70%">
        {value || '—'}
      </styled.span>
    </Flex>
  );
}

function formatSatsMaybe(value: string) {
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  return `${n.toLocaleString()} sats`;
}

export function CollectibleDetails({ account, assetId, protocol }: CollectibleDetailsProps) {
  const navigate = useNavigate();
  const { data: collectibles = [], isLoading, isError } = useAccountCollectibles(account);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

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

  const mediaHeight = isPopupMode() ? 240 : 320;

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

  const descriptionText =
    protocol === CryptoAssetProtocols.sip9 ? (view.asset as Sip9Asset).description || '' : '';

  const shouldTruncateDescription = descriptionText.length > 180;
  const renderedDescription =
    shouldTruncateDescription && !isDescriptionExpanded
      ? `${descriptionText.slice(0, 180).trim()}…`
      : descriptionText;

  const layer = protocol === CryptoAssetProtocols.sip9 ? 'Layer 2 (Stacks)' : 'Layer 1 (Bitcoin)';
  const protocolLabel =
    protocol === CryptoAssetProtocols.sip9
      ? 'SIP-009'
      : protocol === CryptoAssetProtocols.inscription
        ? 'Ordinals'
        : 'Stamps';

  const collection =
    protocol === CryptoAssetProtocols.sip9
      ? ((view.asset as Sip9Asset).collection?.name ?? view.subtitle)
      : view.subtitle;

  const creator =
    protocol === CryptoAssetProtocols.sip9 ? ((view.asset as Sip9Asset).creator ?? '') : '';

  const satsInUtxo =
    protocol === CryptoAssetProtocols.inscription
      ? formatSatsMaybe((view.asset as InscriptionAsset).value)
      : '';

  const contractDetails =
    protocol === CryptoAssetProtocols.sip9
      ? (view.asset as Sip9Asset).contractId || (view.asset as Sip9Asset).assetId
      : protocol === CryptoAssetProtocols.inscription
        ? `${(view.asset as InscriptionAsset).txid}:${(view.asset as InscriptionAsset).output}`
        : (view.asset as StampAsset).stampUrl;

  const properties =
    protocol === CryptoAssetProtocols.sip9 ? ((view.asset as Sip9Asset).attributes ?? []) : [];

  return (
    <Stack width="100%" gap="space.06">
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
        maxWidth={{ base: '100%', md: '640px' }}
        margin="0 auto"
        gap="space.06"
      >
        <Box maxWidth={{ base: '280px', md: '320px' }} width="100%" margin="0 auto">
          <CollectibleTypeIconOverlay protocol={view.protocol}>{media}</CollectibleTypeIconOverlay>
        </Box>

        <SectionDivider />

        {descriptionText ? (
          <Stack gap="space.03">
            <styled.h2 textStyle="label.02" margin="0">
              Description
            </styled.h2>
            <styled.p textStyle="body.02" margin="0">
              {renderedDescription}
            </styled.p>
            {shouldTruncateDescription ? (
              <styled.button
                type="button"
                display="inline-flex"
                alignItems="center"
                gap="space.02"
                width="fit-content"
                _hover={{ cursor: 'pointer' }}
                _focus={{ outline: 0, textDecoration: 'underline' }}
                onClick={() => setIsDescriptionExpanded(v => !v)}
              >
                <styled.span textStyle="label.03">
                  {isDescriptionExpanded ? 'Read less' : 'Read more'}
                </styled.span>
                {isDescriptionExpanded ? (
                  <ChevronUpIcon variant="small" />
                ) : (
                  <ChevronDownIcon variant="small" />
                )}
              </styled.button>
            ) : null}
          </Stack>
        ) : null}

        <SectionDivider />

        <Stack gap="space.04">
          <styled.h2 textStyle="label.02" margin="0">
            Details
          </styled.h2>
          <Flex justifyContent="space-between">
            <styled.span textStyle="label.03" color="ink.text-subdued">
              Assets
            </styled.span>
            <styled.span textStyle="label.03" color="ink.text-subdued">
              History
            </styled.span>
          </Flex>
          <Stack gap="space.03">
            <Row label="Collection" value={collection} />
            <Row label="Creator" value={creator} />
            <Row label="Floor price" value="" />
            <Row label="Layer" value={layer} />
            <Row label="Protocol" value={protocolLabel} />
            <Row label="Sats in UTXO" value={satsInUtxo} />
            <Row label="Collection holders" value="" />
            <Row label="Contract details" value={contractDetails} />
          </Stack>
        </Stack>

        {properties.length ? (
          <>
            <SectionDivider />
            <Stack gap="space.04">
              <styled.h2 textStyle="label.02" margin="0">
                Properties
              </styled.h2>
              <Stack gap="space.03">
                {properties.slice(0, 12).map((attr, idx) => (
                  <Row
                    key={`${attr.traitType}-${idx}`}
                    label={attr.traitType || `Property ${idx + 1}`}
                    value={String(attr.value ?? '')}
                  />
                ))}
              </Stack>
            </Stack>
          </>
        ) : null}
      </Stack>
    </Stack>
  );
}
