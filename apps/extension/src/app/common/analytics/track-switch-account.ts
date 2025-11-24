import { analytics } from '@shared/utils/analytics';

import { queryClient } from '@app/common/persistence';

export function trackSwitchAccount(address: string, index: number) {
  const accountBalanceCache = queryClient.getQueryData(['get-address-stx-balance', address]);
  if (!accountBalanceCache) return;
  const hasStxBalance = !!(accountBalanceCache as any).stx.unlockedStx.amount.isGreaterThan(0);
  void analytics.track('switch_account', { index, hasStxBalance });
}
