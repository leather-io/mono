import { ExternalLink } from '@/components/external-link';
import { SummaryTableItem, SummaryTableRoot } from '@/components/summary-table';
import { Sip9 } from '@/features/token/stacks/sip9';
import { getChainDisplayLabel, getProtocolDisplayLabel } from '@/shared/display-preference';
import { t } from '@lingui/core/macro';

import { formatAttributeValue, getSip9Info } from '@leather.io/features';
import { Sip9Asset } from '@leather.io/models';
import { truncateMiddle } from '@leather.io/utils';

import { Collectible, useCollectibleHeight } from '../collectible';
import { TokenDescription } from '../components/token-description';
import { TokenDetailsCard } from '../components/token-details-card';
import { Sip9TokenStats } from './sip9-token-stats';

interface Sip9TokenDetailsProps {
  asset: Sip9Asset;
}

export function Sip9TokenDetails({ asset }: Sip9TokenDetailsProps) {
  const height = useCollectibleHeight();
  const {
    attributes,
    collectionName,
    collectionUrl,
    contentType,
    contractUrl,
    creator,
    description,
    floorPrice,
    latestSale,
    name,
    rarityRank,
    tokenId,
    totalItems,
  } = getSip9Info(asset);

  return (
    <Collectible name={name || asset.name} details={asset}>
      <TokenDetailsCard>
        <Sip9 item={asset} height={height} />
      </TokenDetailsCard>
      {!!(latestSale || floorPrice) && (
        <Sip9TokenStats floorPrice={floorPrice} latestSale={latestSale} />
      )}
      {description && <TokenDescription description={description} />}

      <TokenDetailsCard title={t`Collectible Info`}>
        <SummaryTableRoot>
          {tokenId && <SummaryTableItem label={t`Name`} value={tokenId.toString()} />}
          {collectionName && (
            <SummaryTableItem
              label={t`Collection`}
              value={
                collectionUrl ? (
                  <ExternalLink url={collectionUrl} label={collectionName} />
                ) : (
                  collectionName
                )
              }
            />
          )}
          {creator && (
            <SummaryTableItem
              label={t`Creator`}
              value={<ExternalLink url={creator} label={creator} />}
            />
          )}
          {rarityRank && totalItems && (
            <SummaryTableItem label={t`Rarity rank`} value={t`${rarityRank} of ${totalItems}`} />
          )}
          <SummaryTableItem label={t`Layer`} value={getChainDisplayLabel(asset.chain)} />
          <SummaryTableItem label={t`Protocol`} value={getProtocolDisplayLabel(asset.protocol)} />
          <SummaryTableItem
            label={t`Contract`}
            value={
              contractUrl ? (
                <ExternalLink url={contractUrl} label={truncateMiddle(asset.contractId, 5)} />
              ) : (
                truncateMiddle(asset.contractId, 5)
              )
            }
          />
          {contentType && <SummaryTableItem label={t`File type`} value={contentType} />}
        </SummaryTableRoot>
      </TokenDetailsCard>
      {attributes.length > 0 && (
        <TokenDetailsCard title={t`Attributes`}>
          <SummaryTableRoot>
            {attributes.slice(0, 12).map((attribute, idx) => (
              <SummaryTableItem
                key={`${attribute.traitType}-${idx}`}
                label={attribute.traitType}
                value={formatAttributeValue(attribute)}
              />
            ))}
          </SummaryTableRoot>
        </TokenDetailsCard>
      )}
    </Collectible>
  );
}
