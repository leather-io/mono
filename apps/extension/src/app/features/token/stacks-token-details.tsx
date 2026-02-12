import { stxAsset } from '@leather.io/constants';
import type { AccountAddresses } from '@leather.io/models';
import { StxAvatarIcon } from '@leather.io/ui';

import { useActivityByAsset } from '@app/query/activity/activity.query';
import { useStxAccountBalance } from '@app/query/stacks/balance/stx-balance.hooks';

import { useTokenMarketInfo } from './hooks/use-token-market-info';
import { StacksTokenDetailsLayout } from './stacks-token-details.layout';
import { TokenDetailsError } from './token-details-error';
import { TokenDetailsLoading } from './token-details-loading';

interface StacksTokenDetailsProps {
  accountIndex: number;
  account: AccountAddresses;
}

export function StacksTokenDetails({ accountIndex, account }: StacksTokenDetailsProps) {
  const balance = useStxAccountBalance(accountIndex);
  const marketInfo = useTokenMarketInfo(stxAsset);
  const activityQuery = useActivityByAsset(account, stxAsset);

  const isLoading = balance.state === 'loading' || marketInfo.isLoading;
  const hasError = balance.state === 'error' || marketInfo.hasError;

  if (isLoading) {
    return <TokenDetailsLoading title="Stacks" />;
  }

  if (hasError || balance.state !== 'success') {
    return <TokenDetailsError title="Stacks" />;
  }

  const availableBalance = balance.value.stx.availableUnlockedBalance;
  const fiatBalance = balance.value.quote.availableUnlockedBalance;

  return (
    <StacksTokenDetailsLayout
      icon={<StxAvatarIcon size="xl" />}
      availableBalance={availableBalance}
      fiatBalance={fiatBalance}
      price={marketInfo.price!}
      changePercent={marketInfo.changePercent}
      priceChangeDelta={marketInfo.priceChangeDelta}
      descriptionText={marketInfo.descriptionText}
      address={account.stacks?.stxAddress}
      activity={activityQuery.data ?? []}
    />
  );
}
