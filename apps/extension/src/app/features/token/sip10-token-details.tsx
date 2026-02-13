import type { AccountAddresses } from '@leather.io/models';
import type { Sip10Balance } from '@leather.io/services';
import { Sip10AvatarIcon } from '@leather.io/ui';
import {
  type SerializedCryptoAssetId,
  deserializeAssetId,
  truncateMiddle,
} from '@leather.io/utils';

import { useActivityByAsset } from '@app/query/activity/activity.query';
import { useSip10BalanceByAssetId } from '@app/query/stacks/sip10/sip10-balance.hooks';

import { useTokenMarketInfo } from './hooks/use-token-market-info';
import { Sip10TokenDetailsLayout } from './sip10-token-details.layout';
import { TokenDetailsError } from './token-details-error';
import { TokenDetailsLoading } from './token-details-loading';

interface Sip10TokenDetailsProps {
  accountIndex: number;
  account: AccountAddresses;
  assetId: SerializedCryptoAssetId;
}

interface Sip10TokenDetailsContentProps {
  account: AccountAddresses;
  balance: Sip10Balance;
}

function Sip10TokenDetailsContent({ account, balance }: Sip10TokenDetailsContentProps) {
  const { asset, crypto, quote } = balance;
  const marketInfo = useTokenMarketInfo(asset);
  const activityQuery = useActivityByAsset(account, asset);

  return (
    <Sip10TokenDetailsLayout
      icon={
        <Sip10AvatarIcon
          contractId={asset.assetId}
          imageCanonicalUri={asset.imageCanonicalUri}
          name={asset.name}
        />
      }
      name={asset.name}
      symbol={asset.symbol}
      availableBalance={crypto.availableBalance}
      fiatBalance={quote.availableBalance}
      price={marketInfo.price}
      changePercent={marketInfo.changePercent}
      priceChangeDelta={marketInfo.priceChangeDelta}
      descriptionText={marketInfo.descriptionText}
      contractDetails={truncateMiddle(asset.assetId, 4)}
      activity={activityQuery.data ?? []}
    />
  );
}

export function Sip10TokenDetails({ accountIndex, account, assetId }: Sip10TokenDetailsProps) {
  const { id: assetIdentifier } = deserializeAssetId(assetId);
  const sip10 = useSip10BalanceByAssetId(accountIndex, assetIdentifier);

  if (sip10.state === 'error') {
    return <TokenDetailsError title="Token" />;
  }

  if (sip10.state === 'loading') {
    return <TokenDetailsLoading title="Token" />;
  }

  if (sip10.state !== 'success' || !sip10.value) {
    return <TokenDetailsError title="Token" />;
  }

  return <Sip10TokenDetailsContent account={account} balance={sip10.value} />;
}
