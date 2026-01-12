import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { ORD_IO_URL } from '@leather.io/constants';
import { getBitcoinExplorerLink } from '@leather.io/features';
import {
  type AccountAddresses,
  type BitcoinNetwork,
  CryptoAssetProtocols,
  InscriptionAsset,
  Sip9Asset,
  StampAsset,
} from '@leather.io/models';
import {
  ArrowLeftIcon,
  Button,
  Callout,
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
  Spinner,
} from '@leather.io/ui';
import { type SerializedCryptoAssetId, truncateMiddle } from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';
import { isPopupMode } from '@app/common/utils';
import { openInNewTab } from '@app/common/utils/open-in-new-tab';
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

interface CollectibleDetailsProps {
  account: AccountAddresses;
  assetId: SerializedCryptoAssetId;
  protocol: (typeof CryptoAssetProtocols)['sip9' | 'inscription' | 'stamp'];
}

function SectionCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <Stack gap="space.04" bg="ink.background-primary" p="space.05" borderRadius="sm">
      {title && (
        <styled.h2 textStyle="label.02" margin="0">
          {title}
        </styled.h2>
      )}
      {children}
    </Stack>
  );
}

interface RowProps {
  label: string;
  value?: string | null;
  externalLink?: string;
}

function Row({ label, value, externalLink }: RowProps) {
  if (!value) return null;

  return (
    <Flex justifyContent="space-between" gap="space.04" py="space.02">
      <styled.span textStyle="caption.02" color="ink.text-subdued">
        {label}
      </styled.span>
      {externalLink ? (
        <styled.button
          type="button"
          display="inline-flex"
          alignItems="center"
          gap="space.01"
          textStyle="caption.02"
          color="ink.action-primary-default"
          _hover={{ cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() => openInNewTab(externalLink)}
        >
          {value}
          <ExternalLinkIcon variant="small" />
        </styled.button>
      ) : (
        <styled.span
          textStyle="caption.02"
          textAlign="right"
          overflowWrap="anywhere"
          maxWidth="70%"
        >
          {value}
        </styled.span>
      )}
    </Flex>
  );
}

function StatCard({ label, value, subValue }: { label: string; value: string; subValue?: string }) {
  return (
    <Box
      bg="ink.background-primary"
      p="space.04"
      borderRadius="sm"
      flex="1"
      display="flex"
      flexDirection="column"
      gap="space.01"
    >
      <styled.span textStyle="caption.02" color="ink.text-subdued">
        {label}
      </styled.span>
      <styled.span textStyle="label.01">{value}</styled.span>
      {subValue && (
        <styled.span textStyle="caption.02" color="ink.text-subdued">
          {subValue}
        </styled.span>
      )}
    </Box>
  );
}

function formatSats(value: string) {
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  return `${n.toLocaleString()} sats`;
}

function formatDate(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getLayerLabel(protocol: (typeof CryptoAssetProtocols)['sip9' | 'inscription' | 'stamp']) {
  return protocol === CryptoAssetProtocols.sip9 ? 'Layer 2 (Stacks)' : 'Layer 1 (Bitcoin)';
}

function getProtocolLabel(
  protocol: (typeof CryptoAssetProtocols)['sip9' | 'inscription' | 'stamp']
) {
  if (protocol === CryptoAssetProtocols.sip9) return 'SIP-009';
  if (protocol === CryptoAssetProtocols.inscription) return 'Ordinals';
  return 'Stamps';
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

interface InscriptionDetailsProps {
  asset: InscriptionAsset;
  bitcoinNetwork: BitcoinNetwork;
}

function InscriptionDetails({ asset, bitcoinNetwork }: InscriptionDetailsProps) {
  const outputValue = asset.value;
  const hasOutputValue = outputValue && Number(outputValue) > 0;

  const ordExplorerUrl = asset.number ? `${ORD_IO_URL}/${asset.number}` : undefined;
  const txExplorerUrl = asset.txid
    ? getBitcoinExplorerLink({ id: asset.txid, type: 'tx', networkPreference: bitcoinNetwork })
    : undefined;

  return (
    <>
      {hasOutputValue && (
        <Flex gap="space.03">
          <StatCard label="Output value" value={formatSats(outputValue)} />
        </Flex>
      )}

      <SectionCard title="Collectible Info">
        <Stack gap="space.01">
          <Row label="Name" value={asset.title} externalLink={ordExplorerUrl} />
          <Row label="Layer" value={getLayerLabel(CryptoAssetProtocols.inscription)} />
          <Row label="Protocol" value={getProtocolLabel(CryptoAssetProtocols.inscription)} />
          {asset.genesisTimestamp && (
            <Row label="Genesis time" value={formatDate(asset.genesisTimestamp)} />
          )}
          {asset.genesisBlockHeight && (
            <Row label="Genesis block" value={`#${asset.genesisBlockHeight}`} />
          )}
          {asset.txid && (
            <Row
              label="Transaction ID"
              value={truncateMiddle(asset.txid, 8)}
              externalLink={txExplorerUrl || undefined}
            />
          )}
          {asset.mimeType && <Row label="File type" value={asset.mimeType} />}
        </Stack>
      </SectionCard>
    </>
  );
}

interface Sip9DetailsProps {
  asset: Sip9Asset;
  isDescriptionExpanded: boolean;
  onToggleDescription(): void;
}

function Sip9Details({ asset, isDescriptionExpanded, onToggleDescription }: Sip9DetailsProps) {
  const description = asset.description || '';
  const shouldTruncateDescription = description.length > 180;
  const renderedDescription =
    shouldTruncateDescription && !isDescriptionExpanded
      ? `${description.slice(0, 180).trim()}…`
      : description;

  const collectionName = asset.collection?.name;
  const collectionLink = asset.collection?.collectionExplorerUrl
    ? `https://gamma.io${asset.collection.collectionExplorerUrl}`
    : undefined;

  const floorPrice = asset.collection?.floorPrice;
  const latestSale = asset.collection?.latestSale;
  const hasStats = Boolean(floorPrice || latestSale);

  const hiroExplorerUrl = asset.contractId
    ? `https://explorer.hiro.so/address/${asset.contractId}`
    : undefined;

  const attributes = asset.attributes?.filter(
    attr => attr.traitType && attr.value && attr.value !== 'None'
  );
  const hasAttributes = attributes && attributes.length > 0;

  return (
    <>
      {hasStats && (
        <Flex gap="space.03">
          {floorPrice && <StatCard label="Floor price" value={formatCurrency(floorPrice)} />}
          {latestSale && <StatCard label="Last sale" value={formatCurrency(latestSale)} />}
        </Flex>
      )}

      {description && (
        <SectionCard title="Description">
          <Stack gap="space.03">
            <styled.p textStyle="body.02" margin="0">
              {renderedDescription}
            </styled.p>
            {shouldTruncateDescription && (
              <styled.button
                type="button"
                display="inline-flex"
                alignItems="center"
                gap="space.02"
                width="fit-content"
                _hover={{ cursor: 'pointer' }}
                _focus={{ outline: 0, textDecoration: 'underline' }}
                onClick={onToggleDescription}
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
            )}
          </Stack>
        </SectionCard>
      )}

      <SectionCard title="Collectible Info">
        <Stack gap="space.01">
          <Row label="Name" value={asset.tokenId?.toString()} />
          {collectionName && (
            <Row label="Collection" value={collectionName} externalLink={collectionLink} />
          )}
          {asset.creator && <Row label="Creator" value={asset.creator} />}
          {asset.rarityRank && asset.collection?.totalItems && (
            <Row
              label="Rarity rank"
              value={`${asset.rarityRank} of ${asset.collection.totalItems}`}
            />
          )}
          <Row label="Layer" value={getLayerLabel(CryptoAssetProtocols.sip9)} />
          <Row label="Protocol" value={getProtocolLabel(CryptoAssetProtocols.sip9)} />
          {asset.contractId && (
            <Row
              label="Contract"
              value={truncateMiddle(asset.contractId, 5)}
              externalLink={hiroExplorerUrl}
            />
          )}
          {asset.content?.contentType && (
            <Row label="File type" value={asset.content.contentType} />
          )}
        </Stack>
      </SectionCard>

      {hasAttributes && (
        <SectionCard title="Attributes">
          <Stack gap="space.01">
            {attributes.slice(0, 12).map((attr, idx) => {
              const value = attr.rarityPercent
                ? `${attr.value} (${attr.rarityPercent}%)`
                : String(attr.value);
              return (
                <Row key={`${attr.traitType}-${idx}`} label={attr.traitType || ''} value={value} />
              );
            })}
          </Stack>
        </SectionCard>
      )}
    </>
  );
}

interface StampDetailsProps {
  asset: StampAsset;
  bitcoinNetwork: BitcoinNetwork;
}

function StampDetails({ asset, bitcoinNetwork }: StampDetailsProps) {
  const name = `Stamp #${asset.stamp}`;
  const blockExplorerUrl = asset.blockHeight
    ? getBitcoinExplorerLink({
        id: asset.blockHeight.toString(),
        type: 'block',
        networkPreference: bitcoinNetwork,
      })
    : undefined;

  return (
    <SectionCard title="Collectible Info">
      <Stack gap="space.01">
        <Row label="Name" value={name} externalLink={asset.stampExplorerUrl} />
        <Row label="Layer" value={getLayerLabel(CryptoAssetProtocols.stamp)} />
        <Row label="Protocol" value={getProtocolLabel(CryptoAssetProtocols.stamp)} />
        {asset.blockHeight && (
          <Row
            label="Last observed block"
            value={`#${asset.blockHeight}`}
            externalLink={blockExplorerUrl || undefined}
          />
        )}
      </Stack>
    </SectionCard>
  );
}
