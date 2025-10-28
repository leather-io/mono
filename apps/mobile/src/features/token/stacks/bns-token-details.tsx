import { SummaryTableItem, SummaryTableRoot } from '@/components/summary-table';
import { DetailsLink } from '@/features/collectibles/components/details-link';
import { Sip9 } from '@/features/collectibles/components/sip9';
// FIXME: This locale is still hardcoded in Send
import { locale } from '@/features/send/constants';
import { useGetBnsName } from '@/queries/bns/bns.query';
import { getChainDisplayLabel, getProtocolDisplayLabel } from '@/shared/display-preference';
import { t } from '@lingui/core/macro';

import { Sip9Asset } from '@leather.io/models';

import { Collectible, useCollectibleHeight } from '../collectible';
import { TokenDetailsCard } from '../components/token-details-card';
import { useGetHiroExplorerUrl } from './use-get-hiro-explorer-link';

interface BnsTokenDetailsProps {
  asset: Sip9Asset;
}

export function BnsTokenDetails({ asset }: BnsTokenDetailsProps) {
  const height = useCollectibleHeight();
  const { data: profile } = useGetBnsName(asset?.name);

  const formatter = new Intl.NumberFormat(locale);
  const renewalHeight = formatter.format(parseInt(profile?.renewalHeight ?? '0', 10));
  const registeredAtBlockNumber = parseInt(profile?.registeredAt ?? '0', 10);
  const registeredAtBlock = formatter.format(registeredAtBlockNumber);
  const hiroBlockUrl = useGetHiroExplorerUrl({ type: 'block', value: registeredAtBlockNumber });

  return (
    <Collectible name={asset.name} description={asset.description} details={asset}>
      <Sip9 item={asset} height={height} />
      <TokenDetailsCard title={t`Collectible Info`}>
        <SummaryTableRoot>
          <SummaryTableItem label={t`Name`} value={asset?.name ?? ''} />
          <SummaryTableItem
            label={t`Registered at block`}
            value={<DetailsLink url={hiroBlockUrl} label={`#${registeredAtBlock}`} />}
          />
          <SummaryTableItem label={t`Renewal height`} value={renewalHeight} />
          <SummaryTableItem label={t`Layer`} value={getChainDisplayLabel(asset?.chain)} />
          <SummaryTableItem label={t`Protocol`} value={getProtocolDisplayLabel(asset?.protocol)} />
        </SummaryTableRoot>
      </TokenDetailsCard>
    </Collectible>
  );
}
