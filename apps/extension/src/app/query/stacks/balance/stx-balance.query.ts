import { useQuery } from '@tanstack/react-query';

import type { AccountRequest } from '@leather.io/services';
import {
  createStxAccountBalanceQueryConfig,
  createStxAddressBalanceQueryConfig,
} from '@leather.io/queries';

import {
  balanceQueryOptions,
  balanceQueryOptionsWithRefetch,
} from '@app/query/common/balance-query-options';
import { useUserSettings } from '@app/hooks/use-user-settings';

export function useGetStxAccountBalanceQuery(account: AccountRequest) {
  const settings = useUserSettings();
  return useQuery({
    ...createStxAccountBalanceQueryConfig(account, settings),
    ...balanceQueryOptionsWithRefetch,
  });
}

export function useGetStxAddressBalanceQuery(address: string) {
  const settings = useUserSettings();
  return useQuery({
    ...createStxAddressBalanceQueryConfig(address, settings),
    enabled: !!address,
    ...balanceQueryOptions,
  });
}
