import { ExternalLink } from '@/components/external-link';
import { SummaryTableItem, SummaryTableRoot } from '@/components/summary-table';
import { Stamp } from '@/features/token/bitcoin/stamp';
import { getChainDisplayLabel, getProtocolDisplayLabel } from '@/shared/display-preference';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/core/macro';

import { getStampInfo } from '@leather.io/features';
import { StampAsset } from '@leather.io/models';

import { Collectible, useCollectibleHeight } from '../collectible';
import { TokenDetailsCard } from '../components/token-details-card';

interface StampTokenDetailsProps {
  asset: StampAsset;
}
export function StampTokenDetails({ asset }: StampTokenDetailsProps) {
  const { networkPreference } = useSettings();
  const bitcoinNetwork = networkPreference.chain.bitcoin.bitcoinNetwork;

  const info = getStampInfo(asset, bitcoinNetwork);

  const height = useCollectibleHeight();
  return (
    <Collectible name={info.name} details={asset}>
      <TokenDetailsCard>
        <Stamp item={asset} height={height} />
      </TokenDetailsCard>
      <TokenDetailsCard title={t`Collectible Info`}>
        <SummaryTableRoot>
          <SummaryTableItem
            label={t`Name`}
            value={
              info.stampExplorerUrl ? (
                <ExternalLink url={info.stampExplorerUrl} label={info.name} />
              ) : (
                info.name
              )
            }
          />
          <SummaryTableItem label={t`Layer`} value={getChainDisplayLabel(asset.chain)} />
          <SummaryTableItem label={t`Protocol`} value={getProtocolDisplayLabel(asset.protocol)} />
          {info.blockHeight && (
            <SummaryTableItem
              label={t`Last observed block`}
              value={
                info.blockExplorerUrl ? (
                  <ExternalLink url={info.blockExplorerUrl} label={`#${info.blockHeight}`} />
                ) : (
                  `#${info.blockHeight}`
                )
              }
            />
          )}
        </SummaryTableRoot>
      </TokenDetailsCard>
    </Collectible>
  );
}
