import { ExternalLink } from '@/components/external-link';
import { SummaryTableItem, SummaryTableRoot } from '@/components/summary-table';
import { Sip9 } from '@/features/token/stacks/sip9';
import { useGetHiroExplorerUrl } from '@/hooks/use-get-hiro-explorer-url';
import { getChainDisplayLabel, getProtocolDisplayLabel } from '@/shared/display-preference';
import { formatCurrency } from '@/utils/currency-formatter';
import { t } from '@lingui/core/macro';

import { Sip9Asset } from '@leather.io/models';
import { truncateMiddle } from '@leather.io/utils';

import { Collectible, useCollectibleHeight } from '../collectible';
import { TokenDescription } from '../components/token-description';
import { TokenDetailsCard } from '../components/token-details-card';
import { TokenStatCard, TokenStatCardItem } from '../components/token-stat-card';

interface Sip9TokenDetailsProps {
  asset: Sip9Asset;
}

export function Sip9TokenDetails({ asset }: Sip9TokenDetailsProps) {
  const height = useCollectibleHeight();

  const hiroExplorerContractUrl = useGetHiroExplorerUrl({
    type: 'address',
    value: asset?.contractId ?? '',
  });

  const { name, description, tokenId, collection, rarityRank, creator, floorPrice, latestSale } =
    asset;
  const collectionLink = `https://gamma.io${collection?.collectionExplorerUrl ?? ''}`;
  const collectionName = collection?.name;
  const totalItems = collection?.totalItems;

  return (
    <Collectible name={name} details={asset}>
      <TokenDetailsCard>
        <Sip9 item={asset} height={height} />
      </TokenDetailsCard>
      {!!(latestSale || floorPrice) && (
        <TokenDetailsCard>
          <TokenStatCard>
            {latestSale && (
              <TokenStatCardItem label={t`Recent sale`} value={formatCurrency(latestSale)} />
            )}
            {floorPrice && (
              <TokenStatCardItem label={t`Floor price`} value={formatCurrency(floorPrice)} />
            )}
          </TokenStatCard>
        </TokenDetailsCard>
      )}
      {description && <TokenDescription description={description} />}

      <TokenDetailsCard title={t`Collectible Info`}>
        <SummaryTableRoot>
          <SummaryTableItem label={t`Name`} value={tokenId ?? ''} />
          <SummaryTableItem
            label={t`Collection`}
            value={<ExternalLink url={collectionLink} label={collectionName ?? ''} />}
          />
          {creator && (
            <SummaryTableItem
              label={t`Creator`}
              value={<ExternalLink url={creator} label={creator} />}
            />
          )}
          {rarityRank && totalItems && (
            <SummaryTableItem label={t`Rarity rank`} value={t`${rarityRank} of ${totalItems}`} />
          )}
          <SummaryTableItem label={t`Layer`} value={getChainDisplayLabel(asset?.chain)} />
          <SummaryTableItem label={t`Protocol`} value={getProtocolDisplayLabel(asset?.protocol)} />
          <SummaryTableItem
            label={t`Contract`}
            value={
              <ExternalLink
                url={hiroExplorerContractUrl}
                label={truncateMiddle(asset?.contractId ?? '', 5)}
              />
            }
          />
          <SummaryTableItem label={t`File type`} value={asset?.content?.contentType ?? ''} />
        </SummaryTableRoot>
      </TokenDetailsCard>
      {asset?.attributes && asset?.attributes?.length > 0 && (
        <TokenDetailsCard title={t`Attributes`}>
          <SummaryTableRoot>
            {asset?.attributes
              ?.filter(
                attribute => attribute?.traitType && attribute?.value && attribute?.value !== 'None'
              )
              .map(attribute => {
                const attributeValue = attribute?.rarityPercent
                  ? `${attribute?.value} (${attribute?.rarityPercent}%)`
                  : String(attribute?.value);
                return (
                  <SummaryTableItem
                    key={attribute?.traitType}
                    label={attribute?.traitType}
                    value={attributeValue}
                  />
                );
              })}
          </SummaryTableRoot>
        </TokenDetailsCard>
      )}
    </Collectible>
  );
}
