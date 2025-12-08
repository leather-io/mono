import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { AccountRequest } from '@leather.io/services';
import {
  createSip10AccountBalanceQueryConfig,
  createSip10AddressBalanceQueryConfig,
} from '@leather.io/queries';

import {
  balanceQueryOptions,
  balanceQueryOptionsWithRefetch,
} from '@app/query/common/balance-query-options';
import { useUserSettings } from '@app/hooks/use-user-settings';

export function useGetSip10AccountBalanceQuery(account: AccountRequest) {
  const settings = useUserSettings();
  return useQuery({
    ...createSip10AccountBalanceQueryConfig(account, settings),
    ...balanceQueryOptionsWithRefetch,
    placeholderData: keepPreviousData,
  });
}

export function useGetSip10AddressBalanceQuery(address: string) {
  const settings = useUserSettings();
  return useQuery({
    ...createSip10AddressBalanceQueryConfig(address, false, settings),
    ...balanceQueryOptions,
  });
}
