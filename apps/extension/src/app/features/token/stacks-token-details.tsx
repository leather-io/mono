import { useNavigate } from 'react-router';

import { TokenDetailsSelectors } from '@tests/selectors/token-details.selectors';

import { LEATHER_STACKING_URL, stxAsset } from '@leather.io/constants';
import type { AccountAddresses, Money } from '@leather.io/models';
import type { StxLockInfo } from '@leather.io/services';
import { StxAvatarIcon } from '@leather.io/ui';
import { baseCurrencyAmountInQuote } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';

import { openInNewTab } from '@app/common/utils/open-in-new-tab';
import {
  formatShortDate,
  isCurrentPosition,
  isUpcomingPosition,
  sortByUnlock,
  subtractMoneyFloor,
  sumBondStx,
} from '@app/features/bonds/bond-position.utils';
import { tooltipTextMap } from '@app/pages/all-balances/all-balances.utils';
import { useBlockchainActivityByAssetId } from '@app/query/activity/blockchain-activity.query';
import { useCurrentBtcStakingPositions } from '@app/query/bitcoin/staking/bitcoin-staking.hooks';
import { useMarketData } from '@app/query/common/market-data/market-data.query';
import { useStxAccountBalanceByAddresses } from '@app/query/stacks/balance/stx-balance.hooks';

import type { TokenBalanceEntry } from './components/token-balances-tab';
import { useTokenMarketInfo } from './hooks/use-token-market-info';
import { StacksTokenDetailsLayout } from './stacks-token-details.layout';
import { TokenDetailsError } from './token-details-error';
import { TokenDetailsLoading } from './token-details-loading';

const stakingStatusUrl = `${LEATHER_STACKING_URL}/status`;

function getStakedCaption(lock: StxLockInfo | undefined, hasBondStx: boolean, now = new Date()) {
  if (!lock || hasBondStx || lock.estimatedUnlockAt <= now) return 'Staked';
  return `Staked · unlocks about ${formatShortDate(lock.estimatedUnlockAt)}`;
}

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
  const lock = balance.value.lock;
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

  const balances: TokenBalanceEntry[] = [
    {
      title: 'Available to transfer',
      tooltipText: tooltipTextMap.stxAvailable,
      amount: availableBalance,
      fiatAmount: fiatBalance,
      testId: TokenDetailsSelectors.TokenDetailsBalanceAvailable,
    },
  ];

  if (hasBondStx) {
    balances.push({
      title: 'In a bond',
      tooltipText: tooltipTextMap.stxBonded,
      caption: runningBond
        ? `Unlocks about ${formatShortDate(runningBond.estimatedUnlockAt)}`
        : undefined,
      amount: bondStx,
      fiatAmount: toQuote(bondStx),
      onPressRow: () => void navigate(RouteUrls.AllBalancesDetail.replace(':category', 'bonded')),
    });
  }

  if (otherLockedStx.amount.isGreaterThan(0)) {
    balances.push({
      title: 'Locked',
      tooltipText: tooltipTextMap.stxLocked,
      caption: getStakedCaption(lock, hasBondStx),
      amount: otherLockedStx,
      fiatAmount: hasBondStx ? toQuote(otherLockedStx) : quote.lockedBalance,
      onPressRow: () => openInNewTab(stakingStatusUrl),
      testId: TokenDetailsSelectors.TokenDetailsLockedRow,
    });
  }

  if (stx.inboundBalance.amount.isGreaterThan(0)) {
    balances.push({
      title: 'Pending',
      tooltipText: tooltipTextMap.stxPending,
      amount: stx.inboundBalance,
      fiatAmount: quote.inboundBalance,
    });
  }

  return (
    <StacksTokenDetailsLayout
      icon={<StxAvatarIcon size="xl" />}
      balance={stx.totalBalance}
      fiatBalance={quote.totalBalance}
      price={marketInfo.price!}
      descriptionText={marketInfo.descriptionText}
      balances={balances}
      activity={activityQuery.data ?? []}
    />
  );
}
