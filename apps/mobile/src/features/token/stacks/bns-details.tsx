import { ExternalLink } from '@/components/external-link';
import { SummaryTableItem, SummaryTableRoot } from '@/components/summary-table';
import { Sip9 } from '@/features/token/stacks/sip9';
import { useGetHiroExplorerUrl } from '@/hooks/use-get-hiro-explorer-url';
import { useGetBnsName } from '@/queries/bns/bns.query';
import { getChainDisplayLabel, getProtocolDisplayLabel } from '@/shared/display-preference';
import { t } from '@lingui/core/macro';

import { Sip9Asset } from '@leather.io/models';

import { Collectible, useCollectibleHeight } from '../collectible';
import { TokenDetailsCard } from '../components/token-details-card';

interface BnsDetailsProps {
  asset: Sip9Asset;
}

export function BnsDetails({ asset }: BnsDetailsProps) {
  const height = useCollectibleHeight();
  const { data: bnsData } = useGetBnsName(asset?.name);

  const { renewalHeight, registeredAtBlockNumber } = bnsData ?? {};
  const hiroBlockUrl = useGetHiroExplorerUrl({ type: 'block', value: registeredAtBlockNumber ?? 0 });

  return (
    <Collectible name={asset.name} details={asset}>
      <TokenDetailsCard>
        <Sip9 item={asset} height={height} />
      </TokenDetailsCard>
      <TokenDetailsCard title={t`Collectible Info`}>
        <SummaryTableRoot>
          <SummaryTableItem label={t`Name`} value={asset?.name ?? ''} />
          <SummaryTableItem
            label={t`Registered at block`}
            value={<ExternalLink url={hiroBlockUrl} label={`#${registeredAtBlockNumber}`} />}
          />
          <SummaryTableItem label={t`Renewal height`} value={renewalHeight} />
          <SummaryTableItem label={t`Layer`} value={getChainDisplayLabel(asset?.chain)} />
          <SummaryTableItem label={t`Protocol`} value={getProtocolDisplayLabel(asset?.protocol)} />
        </SummaryTableRoot>
      </TokenDetailsCard>
    </Collectible>
  );
}
