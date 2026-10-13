import { Box, Stack, styled } from 'leather-styles/jsx';

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

import { Row, SectionCard } from './collectible-details.layout';

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
  const hasAttributes = info.attributes.length > 0;

  return (
    <>
      {description && (
        <Stack bg="ink.background-primary" py="space.03" gap="space.00">
          <Box mx="space.05" borderTopWidth="1px" borderColor="ink.border-default" />
          <Box px="space.05" py="space.02">
            <styled.h2 textStyle="label.03" margin="0">
              Description
            </styled.h2>
          </Box>
          <Stack px="space.05" gap="space.03" pb="space.03">
            <styled.p textStyle="caption.01" margin="0">
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
                <styled.span textStyle="label.02">
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
        </Stack>
      )}

      <SectionCard title="Details">
        {info.collectionName && (
          <Row label="Collection" value={info.collectionName} externalLink={info.collectionUrl} />
        )}
        {info.creator && <Row label="Creator" value={info.creator} />}
        {floorPrice && <Row label="Floor price" value={formatCurrency(floorPrice)} />}
        <Row label="Layer" value={getChainDisplayLabel(asset.chain)} />
        <Row label="Protocol" value={getProtocolDisplayLabel(asset.protocol)} />
        {asset.contractId && (
          <Row
            label="Contract details"
            value={truncateMiddle(asset.contractId, 5)}
            externalLink={info.contractUrl}
          />
        )}
      </SectionCard>

      {hasAttributes && (
        <SectionCard title="Properties">
          {info.attributes.slice(0, 12).map((attr, idx) => (
            <Row
              key={`${attr.traitType}-${idx}`}
              label={attr.traitType || ''}
              value={formatAttributeValue(attr)}
            />
          ))}
        </SectionCard>
      )}
    </>
  );
}
