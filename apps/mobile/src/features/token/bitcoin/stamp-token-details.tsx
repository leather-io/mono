import { ExternalLink } from '@/components/external-link';
import { SummaryTableItem, SummaryTableRoot } from '@/components/summary-table';
import { Stamp } from '@/features/token/bitcoin/stamp';
import { getChainDisplayLabel, getProtocolDisplayLabel } from '@/shared/display-preference';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/core/macro';

import { type BitcoinNetworkPreference, getMempoolExplorerLink } from '@leather.io/features';
import { StampAsset } from '@leather.io/models';

import { Collectible, useCollectibleHeight } from '../collectible';
import { TokenDetailsCard } from '../components/token-details-card';

interface StampTokenDetailsProps {
  asset: StampAsset;
}
export function StampTokenDetails({ asset }: StampTokenDetailsProps) {
  const { stamp, chain, protocol, stampExplorerUrl, blockHeight } = asset;
  const name = `${t`Stamp`} #${stamp}`;
  const { networkPreference } = useSettings();
  const mempoolExplorerUrl = getMempoolExplorerLink({
    id: blockHeight.toString(),
    type: 'block',
    networkPreference: networkPreference.chain.bitcoin.bitcoinNetwork as BitcoinNetworkPreference,
  });

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
            value={<ExternalLink url={stampExplorerUrl} label={name} />}
          />
          <SummaryTableItem label={t`Layer`} value={getChainDisplayLabel(chain)} />
          <SummaryTableItem label={t`Protocol`} value={getProtocolDisplayLabel(protocol)} />
          <SummaryTableItem
            label={t`Last observed block`}
            value={<ExternalLink url={mempoolExplorerUrl || undefined} label={`#${blockHeight}`} />}
          />
        </SummaryTableRoot>
      </TokenDetailsCard>
    </Collectible>
  );
}
