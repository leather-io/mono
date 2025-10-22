import { ExternalLink } from '@/components/external-link';
import { SummaryTableItem, SummaryTableRoot } from '@/components/summary-table';
import {
  BitcoinNetworkPreference,
  getMempoolExplorerLink,
} from '@/features/activity/utils/make-activity-link';
import { Inscription } from '@/features/token/bitcoin/inscription';
import { getChainDisplayLabel, getProtocolDisplayLabel } from '@/shared/display-preference';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/core/macro';
import dayjs from 'dayjs';

import { ORD_IO_URL } from '@leather.io/constants';
import { InscriptionAsset } from '@leather.io/models';
import { truncateMiddle } from '@leather.io/utils';

import { Collectible, useCollectibleHeight } from '../collectible';
import { TokenDetailsCard } from '../components/token-details-card';
import { TokenStatCard, TokenStatCardItem } from '../components/token-stat-card';

interface InscriptionTokenDetailsProps {
  asset: InscriptionAsset;
}

export function InscriptionTokenDetails({ asset }: InscriptionTokenDetailsProps) {
  const {
    number,
    title,
    chain,
    mimeType,
    protocol,
    genesisTimestamp,
    genesisBlockHeight,
    txid,
    value,
  } = asset;

  const { networkPreference } = useSettings();
  const bitcoinNetwork = networkPreference.chain.bitcoin.bitcoinNetwork;

  const mempoolExplorerTxUrl = getMempoolExplorerLink({
    id: txid,
    type: 'tx',
    networkPreference: bitcoinNetwork as BitcoinNetworkPreference,
  });

  const height = useCollectibleHeight();
  return (
    <Collectible name={title} details={asset}>
      <TokenDetailsCard>
        <Inscription item={asset} height={height} />
      </TokenDetailsCard>
      {!!value && (
        <TokenDetailsCard>
          <TokenStatCard>
            <TokenStatCardItem label={t`Output value`} value={`${value} sats`} />
          </TokenStatCard>
        </TokenDetailsCard>
      )}
      <TokenDetailsCard title={t`Collectible Info`}>
        <SummaryTableRoot>
          <SummaryTableItem
            label={t`Name`}
            value={<ExternalLink url={`${ORD_IO_URL}/${number}`} label={title} />}
          />
          <SummaryTableItem label={t`Layer`} value={getChainDisplayLabel(chain)} />
          <SummaryTableItem label={t`Protocol`} value={getProtocolDisplayLabel(protocol)} />
          <SummaryTableItem
            label={t`Genesis time`}
            value={dayjs(genesisTimestamp * 1000).format('YYYY-MM-DD HH:mm [UTC]')}
          />
          <SummaryTableItem label={t`Genesis block`} value={`#${genesisBlockHeight}`} />
          <SummaryTableItem
            label={t`Transaction ID`}
            value={
              <ExternalLink url={mempoolExplorerTxUrl} label={truncateMiddle(txid ?? '', 8)} />
            }
          />
          <SummaryTableItem label={t`File type`} value={mimeType ?? ''} />
        </SummaryTableRoot>
      </TokenDetailsCard>
    </Collectible>
  );
}
