import { SummaryTableItem, SummaryTableRoot } from '@/components/summary-table';
import {
  BitcoinNetworkPreference,
  makeMempoolExplorerLink,
} from '@/features/activity/utils/make-activity-link';
import { DetailsLink } from '@/features/collectibles/components/details-link';
import { Inscription } from '@/features/collectibles/components/inscription';
import { getChainDisplayLabel, getProtocolDisplayLabel } from '@/shared/display-preference';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/core/macro';

import { InscriptionAsset } from '@leather.io/models';
import { truncateMiddle } from '@leather.io/utils';

import { Collectible, useCollectibleHeight } from '../collectible';
import { TokenDetailsCard } from '../components/token-details-card';

interface InscriptionTokenDetailsProps {
  asset: InscriptionAsset;
}
export function InscriptionTokenDetails({ asset }: InscriptionTokenDetailsProps) {
  const { title, chain, mimeType, protocol, genesisTimestamp, genesisBlockHeight, txid, value } =
    asset;

  const { networkPreference } = useSettings();
  const bitcoinNetwork = networkPreference.chain.bitcoin.bitcoinNetwork;

  // FIXME: need to refactor makeMempoolExplorerLink - deprecate in extension
  const mempoolExplorerTxUrl = makeMempoolExplorerLink({
    txid,
    networkPreference: bitcoinNetwork as BitcoinNetworkPreference,
  });

  const height = useCollectibleHeight();
  return (
    <Collectible name={title} description={title} details={asset}>
      <TokenDetailsCard>
        <Inscription item={asset} height={height} />
      </TokenDetailsCard>
      <TokenDetailsCard title={t`Collectible Info`}>
        <SummaryTableRoot>
          <SummaryTableItem label={t`Name`} value={title ?? ''} />
          <SummaryTableItem label={t`Layer`} value={getChainDisplayLabel(chain)} />
          <SummaryTableItem label={t`Protocol`} value={getProtocolDisplayLabel(protocol)} />
          {/* use formatActivityCaption to format the timestamp */}
          <SummaryTableItem
            label={t`Genesis time`}
            value={new Date(genesisTimestamp * 1000).toLocaleString()}
          />
          <SummaryTableItem label={t`Genesis block`} value={`#${genesisBlockHeight}`} />
          <SummaryTableItem
            label={t`Transaction ID`}
            value={<DetailsLink url={mempoolExplorerTxUrl} label={truncateMiddle(txid ?? '', 5)} />}
          />
          <SummaryTableItem label={t`File type`} value={mimeType ?? ''} />
        </SummaryTableRoot>
      </TokenDetailsCard>
    </Collectible>
  );
}
