import { SummaryTableItem, SummaryTableRoot } from '@/components/summary-table';
import { DetailsLink } from '@/features/collectibles/components/details-link';
import { Sip9 } from '@/features/collectibles/components/sip9';
import { getChainDisplayLabel, getProtocolDisplayLabel } from '@/shared/display-preference';
import { t } from '@lingui/core/macro';

import { Sip9Asset } from '@leather.io/models';
import { truncateMiddle } from '@leather.io/utils';

import { Collectible, useCollectibleHeight } from '../collectible';
import { TokenDescription } from '../components/token-description';
import { TokenDetailsCard } from '../components/token-details-card';
import { useGetHiroExplorerUrl } from './use-get-hiro-explorer-link';

interface Sip9TokenDetailsProps {
  asset: Sip9Asset;
}

export function Sip9TokenDetails({ asset }: Sip9TokenDetailsProps) {
  const height = useCollectibleHeight();

  const hiroExplorerContractUrl = useGetHiroExplorerUrl({
    type: 'address',
    value: asset?.contractId ?? '',
  });

  const collection = asset?.collection;

  const collectionLink = `https://gamma.io${collection?.collectionExplorerUrl ?? ''}`;
  const { name, description, tokenId } = asset;

  return (
    <Collectible name={name} details={asset}>
      <TokenDetailsCard>
        <Sip9 item={asset} height={height} />
      </TokenDetailsCard>

      {description && <TokenDescription description={description} />}

      <TokenDetailsCard title={t`Collectible Info`}>
        <SummaryTableRoot>
          <SummaryTableItem label={t`Name`} value={tokenId ?? ''} />
          <SummaryTableItem
            label={t`Collection`}
            value={<DetailsLink url={collectionLink} label={collection?.name ?? ''} />}
          />
          <SummaryTableItem label={t`Creator`} value="" />
          <SummaryTableItem
            label={t`Rarity rank`}
            value={t`?? of ${collection?.totalItems ?? ''}`}
          />
          <SummaryTableItem label={t`Layer`} value={getChainDisplayLabel(asset?.chain)} />
          <SummaryTableItem label={t`Protocol`} value={getProtocolDisplayLabel(asset?.protocol)} />
          <SummaryTableItem
            label={t`Contract`}
            value={
              <DetailsLink
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
