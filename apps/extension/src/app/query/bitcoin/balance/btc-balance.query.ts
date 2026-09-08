import { useQuery } from '@tanstack/react-query';

import { createBtcBalanceQueryConfig } from '@leather.io/queries';
import type { AccountQuotedBtcBalance, AccountRequest } from '@leather.io/services';

import { useMockLockedBtc, withMockLockedBtc } from '@app/features/bonds/use-mock-locked-btc';
import { useUserSettings } from '@app/hooks/use-user-settings';
import { balanceQueryOptionsWithRefetch } from '@app/query/common/balance-query-options';

export function useGetBtcAccountBalanceQuery(request: AccountRequest) {
  const settings = useUserSettings();
  const mockLocked = useMockLockedBtc();
  return useQuery({
    ...createBtcBalanceQueryConfig(request, settings),
    ...balanceQueryOptionsWithRefetch,
    // Bond scenarios (non-production only) fold their bonded BTC into the
    // real balance so every consumer sees it the way the service would report it
    select: mockLocked
      ? (balance: AccountQuotedBtcBalance) => withMockLockedBtc(balance, mockLocked)
      : undefined,
  });
}
