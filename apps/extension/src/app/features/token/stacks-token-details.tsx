import { useNavigate } from 'react-router';

import { stxAsset } from '@leather.io/constants';
import type { AccountAddresses, Money } from '@leather.io/models';
import { StxAvatarIcon } from '@leather.io/ui';
import { baseCurrencyAmountInQuote } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';

import {
  formatShortDate,
  isCurrentPosition,
  isUpcomingPosition,
  sortByUnlock,
  subtractMoneyFloor,
  sumBondStx,
} from '@app/features/bonds/bond-position.utils';
import { useBlockchainActivityByAssetId } from '@app/query/activity/blockchain-activity.query';
import { useCurrentBtcStakingPositions } from '@app/query/bitcoin/staking/bitcoin-staking.hooks';
import { useMarketData } from '@app/query/common/market-data/market-data.query';
import { useStxAccountBalanceByAddresses } from '@app/query/stacks/balance/stx-balance.hooks';

import { useTokenMarketInfo } from './hooks/use-token-market-info';
import { type StacksBalanceEntry, StacksTokenDetailsLayout } from './stacks-token-details.layout';
import { TokenDetailsError } from './token-details-error';
import { TokenDetailsLoading } from './token-details-loading';

interface StacksTokenDetailsProps {
  account: AccountAddresses;
}

export function StacksTokenDetails({ account }: StacksTokenDetailsProps) {
  const navigate = useNavigate();
  const balance = useStxAccountBalanceByAddresses(account);
  const marketInfo = useTokenMarketInfo(stxAsset);
  const marketData = useMarketData(stxAsset);
  const activityQuery = useBlockchainActivityByAssetId(account, stxAsset);
  const positions = useCurrentBtcStakingPositions();

  const isLoading = balance.state === 'loading' || marketInfo.isLoading;
  const hasError = balance.state === 'error' || marketInfo.hasError;

  if (isLoading) {
    return <TokenDetailsLoading title="Stacks" />;
  }

  if (hasError || balance.state !== 'success') {
    return <TokenDetailsError title="Stacks" />;
  }

  const stx = balance.value.stx;
  const quote = balance.value.quote;
  const availableBalance = stx.availableUnlockedBalance;
  const fiatBalance = quote.availableUnlockedBalance;

  function toQuote(money: Money): Money | undefined {
    if (marketData.state !== 'success') return undefined;
    return baseCurrencyAmountInQuote(money, marketData.value);
  }

  const positionList = positions.state === 'success' ? positions.value : [];
  const bondStx = sumBondStx(positionList);
  const hasBondStx = bondStx.amount.isGreaterThan(0);
  const runningBond = sortByUnlock(
    positionList.filter(p => isCurrentPosition(p) && !isUpcomingPosition(p))
  )[0];

  // STX locked for any reason other than the bond, e.g. solo or pooled stacking
  const otherLockedStx = hasBondStx
    ? subtractMoneyFloor(stx.lockedBalance, bondStx)
    : stx.lockedBalance;

  const balances: StacksBalanceEntry[] = [
    {
      title: 'Available to transfer',
      stxBalance: availableBalance,
      fiatBalance,
    },
  ];

  if (hasBondStx) {
    balances.push({
      title: 'In a bond',
      caption: runningBond
        ? `Unlocks about ${formatShortDate(runningBond.estimatedUnlockAt)}`
        : undefined,
      stxBalance: bondStx,
      fiatBalance: toQuote(bondStx),
      onPressRow: () => void navigate(RouteUrls.AllBalancesDetail.replace(':category', 'bonded')),
    });
  }

  if (otherLockedStx.amount.isGreaterThan(0)) {
    balances.push({
      title: 'Locked',
      stxBalance: otherLockedStx,
      fiatBalance: hasBondStx ? toQuote(otherLockedStx) : quote.lockedBalance,
    });
  }

  if (stx.inboundBalance.amount.isGreaterThan(0)) {
    balances.push({
      title: 'Pending',
      stxBalance: stx.inboundBalance,
      fiatBalance: quote.inboundBalance,
    });
  }

  return (
    <StacksTokenDetailsLayout
      icon={<StxAvatarIcon size="xl" />}
      availableBalance={availableBalance}
      fiatBalance={fiatBalance}
      price={marketInfo.price!}
      changePercent={marketInfo.changePercent}
      priceChangeDelta={marketInfo.priceChangeDelta}
      descriptionText={marketInfo.descriptionText}
      balances={balances}
      activity={activityQuery.data ?? []}
    />
  );
}
