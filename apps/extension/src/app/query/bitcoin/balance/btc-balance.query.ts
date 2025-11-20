import { useQuery } from '@tanstack/react-query';

import { createBtcBalanceQueryConfig } from '@leather.io/queries';
import type { AccountRequest } from '@leather.io/services';

import { useUserSettings } from '@app/hooks/use-user-settings';
import { balanceQueryOptionsWithRefetch } from '@app/query/common/balance-query-options';

export function useGetBtcAccountBalanceQuery(request: AccountRequest) {
  const settings = useUserSettings();
  return useQuery({
    ...createBtcBalanceQueryConfig(request, settings),
    ...balanceQueryOptionsWithRefetch,
  });
}
