import { Flex, Stack, styled } from 'leather-styles/jsx';

import {
  formatAttributeValue,
  getChainDisplayLabel,
  getProtocolDisplayLabel,
  getSip9Info,
  truncateDescription,
} from '@leather.io/features';
import type { Sip9Asset } from '@leather.io/models';
import { ChevronDownIcon, ChevronUpIcon } from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';

import { Row, SectionCard, StatCard } from './collectible-details.layout';

interface Sip9DetailsProps {
  asset: Sip9Asset;
  isDescriptionExpanded: boolean;
  onToggleDescription(): void;
}

export function Sip9Details({
  asset,
  isDescriptionExpanded,
  onToggleDescription,
}: Sip9DetailsProps) {
  const info = getSip9Info(asset);
  const description = info.description || '';
  const { text: renderedDescription, isTruncated } = isDescriptionExpanded
    ? { text: description, isTruncated: description.length > 180 }
    : truncateDescription(description);

  const floorPrice = asset.collection?.floorPrice;
  const latestSale = asset.collection?.latestSale;
  const hasStats = Boolean(floorPrice || latestSale);
  const hasAttributes = info.attributes.length > 0;

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
            {isTruncated && (
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
          <Row label="Name" value={info.tokenId?.toString()} />
          {info.collectionName && (
            <Row label="Collection" value={info.collectionName} externalLink={info.collectionUrl} />
          )}
          {info.creator && <Row label="Creator" value={info.creator} />}
          {info.rarityRank && info.totalItems && (
            <Row label="Rarity rank" value={`${info.rarityRank} of ${info.totalItems}`} />
          )}
          <Row label="Layer" value={getChainDisplayLabel(asset.chain)} />
          <Row label="Protocol" value={getProtocolDisplayLabel(asset.protocol)} />
          {asset.contractId && (
            <Row
              label="Contract"
              value={truncateMiddle(asset.contractId, 5)}
              externalLink={info.contractUrl}
            />
          )}
          {info.contentType && <Row label="File type" value={info.contentType} />}
        </Stack>
      </SectionCard>

      {hasAttributes && (
        <SectionCard title="Attributes">
          <Stack gap="space.01">
            {info.attributes.slice(0, 12).map((attr, idx) => (
              <Row
                key={`${attr.traitType}-${idx}`}
                label={attr.traitType || ''}
                value={formatAttributeValue(attr)}
              />
            ))}
          </Stack>
        </SectionCard>
      )}
    </>
  );
}
