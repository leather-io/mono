import type BigNumber from 'bignumber.js';

import { analytics } from '@shared/utils/analytics';

import { queryClient } from '@app/common/persistence';

interface AccountStxBalanceCache {
  stx: { unlockedStx: { amount: BigNumber } };
}

export function trackSwitchAccount(address: string, index: number) {
  const accountBalanceCache = queryClient.getQueryData<AccountStxBalanceCache>([
    'get-address-stx-balance',
    address,
  ]);
  if (!accountBalanceCache) return;
  const hasStxBalance = !!accountBalanceCache.stx.unlockedStx.amount.isGreaterThan(0);
  analytics.track('switch_account', { index, hasStxBalance });
}
