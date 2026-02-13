import type { AccountAddresses, Money, RuneAsset } from '@leather.io/models';
import { RunesAvatarIcon } from '@leather.io/ui';
import { type SerializedCryptoAssetId, deserializeAssetId } from '@leather.io/utils';

import { useActivityByAsset } from '@app/query/activity/activity.query';
import { useRuneBalanceByRuneName } from '@app/query/bitcoin/runes/runes-balance.query';

import { useTokenMarketInfo } from './hooks/use-token-market-info';
import { RuneTokenDetailsLayout } from './rune-token-details.layout';
import { TokenDetailsError } from './token-details-error';
import { TokenDetailsLoading } from './token-details-loading';

interface RuneTokenDetailsProps {
  accountIndex: number;
  account: AccountAddresses;
  assetId: SerializedCryptoAssetId;
}

interface RuneTokenDetailsContentProps {
  asset: RuneAsset;
  crypto: { availableBalance: Money };
  quote: { availableBalance: Money };
  account: AccountAddresses;
}

function RuneTokenDetailsContent({ asset, crypto, quote, account }: RuneTokenDetailsContentProps) {
  const marketInfo = useTokenMarketInfo(asset);
  const activityQuery = useActivityByAsset(account, asset);

  const name = asset.spacedRuneName ?? asset.runeName;

  return (
    <RuneTokenDetailsLayout
      icon={<RunesAvatarIcon size="xl" />}
      name={name}
      symbol={asset.symbol}
      availableBalance={crypto.availableBalance}
      fiatBalance={quote.availableBalance}
      changePercent={marketInfo.changePercent}
      descriptionText={marketInfo.descriptionText}
      activity={activityQuery.data ?? []}
    />
  );
}

export function RuneTokenDetails({ accountIndex, account, assetId }: RuneTokenDetailsProps) {
  const { id: runeName } = deserializeAssetId(assetId);
  const rune = useRuneBalanceByRuneName(accountIndex, runeName);

  if (rune.state === 'error') {
    return <TokenDetailsError title="Rune" />;
  }

  if (rune.state === 'loading') {
    return <TokenDetailsLoading title="Rune" />;
  }

  if (rune.state !== 'success' || !rune.value) {
    return <TokenDetailsError title="Rune" />;
  }

  const { asset, crypto, quote } = rune.value;

  return <RuneTokenDetailsContent asset={asset} crypto={crypto} quote={quote} account={account} />;
}
