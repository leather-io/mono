import { SummaryTableItem, SummaryTableRoot } from '@/components/summary-table';
import { DetailsLink } from '@/features/collectibles/components/details-link';
import { Stamp } from '@/features/collectibles/components/stamp';
import { getChainDisplayLabel, getProtocolDisplayLabel } from '@/shared/display-preference';
import { t } from '@lingui/core/macro';

import { StampAsset } from '@leather.io/models';

import { Collectible, useCollectibleHeight } from '../collectible';
import { TokenDetailsCard } from '../components/token-details-card';

interface StampTokenDetailsProps {
  asset: StampAsset;
}
export function StampTokenDetails({ asset }: StampTokenDetailsProps) {
  const { stamp, chain, protocol, stampUrl, stampExplorerUrl, blockHeight } = asset;
  const name = `${t`Stamp`} #${stamp}`;
  // FIXME: need to refactor makeMempoolExplorerLink - deprecate in extension and accept block / tx
  const mempoolBaseUrl = 'https://mempool.space';
  const mempoolExplorerUrl = `${mempoolBaseUrl}/block/${blockHeight}`;
  const height = useCollectibleHeight();
  return (
    <Collectible name={name} details={asset}>
      <TokenDetailsCard>
        <Stamp item={asset} height={height} />
      </TokenDetailsCard>
      <TokenDetailsCard title={t`Collectible Info`}>
        <SummaryTableRoot>
          <SummaryTableItem
            label={t`Name`}
            value={<DetailsLink url={stampExplorerUrl} label={name} />}
          />
          <SummaryTableItem label={t`Layer`} value={getChainDisplayLabel(chain)} />
          <SummaryTableItem label={t`Protocol`} value={getProtocolDisplayLabel(protocol)} />
          <SummaryTableItem
            label={t`Last observed block`}
            value={<DetailsLink url={mempoolExplorerUrl} label={`#${blockHeight}`} />}
          />
          <SummaryTableItem label={t`Stamp URL`} value={stampUrl} />
        </SummaryTableRoot>
      </TokenDetailsCard>
    </Collectible>
  );
}
