import { ExternalLink } from '@/components/external-link';
import { SummaryTableItem, SummaryTableRoot } from '@/components/summary-table';
import { Inscription } from '@/features/token/bitcoin/inscription';
import { getChainDisplayLabel, getProtocolDisplayLabel } from '@/shared/display-preference';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/core/macro';
import dayjs from 'dayjs';

import { getInscriptionInfo } from '@leather.io/features';
import { type InscriptionAsset } from '@leather.io/models';
import { truncateMiddle } from '@leather.io/utils';

import { Collectible, useCollectibleHeight } from '../collectible';
import { TokenDetailsCard } from '../components/token-details-card';
import { InscriptionTokenStats } from './inscription-token-stats';

interface InscriptionTokenDetailsProps {
  asset: InscriptionAsset;
}

export function InscriptionTokenDetails({ asset }: InscriptionTokenDetailsProps) {
  const { networkPreference } = useSettings();
  const bitcoinNetwork = networkPreference.chain.bitcoin.bitcoinNetwork;

  const info = getInscriptionInfo(asset, bitcoinNetwork);
  const hasOutputValue = info.outputValue && Number(info.outputValue) > 0;

  const height = useCollectibleHeight();
  return (
    <Collectible name={info.title} details={asset}>
      <TokenDetailsCard>
        <Inscription item={asset} height={height} />
      </TokenDetailsCard>
      {hasOutputValue && <InscriptionTokenStats outputValue={info.outputValue} />}
      <TokenDetailsCard title={t`Collectible Info`}>
        <SummaryTableRoot>
          {info.title && (
            <SummaryTableItem
              label={t`Name`}
              value={
                info.ordExplorerUrl ? (
                  <ExternalLink url={info.ordExplorerUrl} label={info.title} />
                ) : (
                  info.title
                )
              }
            />
          )}
          <SummaryTableItem label={t`Layer`} value={getChainDisplayLabel(asset.chain)} />
          <SummaryTableItem label={t`Protocol`} value={getProtocolDisplayLabel(asset.protocol)} />
          {info.genesisTimestamp && (
            <SummaryTableItem
              label={t`Genesis time`}
              value={dayjs(info.genesisTimestamp * 1000).format('YYYY-MM-DD HH:mm [UTC]')}
            />
          )}
          {info.genesisBlockHeight && (
            <SummaryTableItem label={t`Genesis block`} value={`#${info.genesisBlockHeight}`} />
          )}
          {asset.txid && (
            <SummaryTableItem
              label={t`Transaction ID`}
              value={
                info.txExplorerUrl ? (
                  <ExternalLink url={info.txExplorerUrl} label={truncateMiddle(asset.txid, 8)} />
                ) : (
                  truncateMiddle(asset.txid, 8)
                )
              }
            />
          )}
          {info.mimeType && <SummaryTableItem label={t`File type`} value={info.mimeType} />}
        </SummaryTableRoot>
      </TokenDetailsCard>
    </Collectible>
  );
}
