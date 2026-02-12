import { keepPreviousData, useQuery } from '@tanstack/react-query';

import {
  createRuneBalanceByRuneNameQueryConfig,
  createRunesAccountBalanceQueryConfig,
} from '@leather.io/queries';
import type { AccountRequest } from '@leather.io/services';

import { useUserSettings } from '@app/hooks/use-user-settings';
import { balanceQueryOptionsWithRefetch } from '@app/query/common/balance-query-options';

export function useGetRunesAccountBalanceQuery(request: AccountRequest) {
  const settings = useUserSettings();
  return useQuery({
    ...createRunesAccountBalanceQueryConfig(request, settings),
    ...balanceQueryOptionsWithRefetch,
    placeholderData: keepPreviousData,
  });
}

export function useGetRuneBalanceByRuneNameQuery(request: AccountRequest, runeName: string) {
  const settings = useUserSettings();
  return useQuery({
    ...createRuneBalanceByRuneNameQueryConfig(request, runeName, settings),
    ...balanceQueryOptionsWithRefetch,
    placeholderData: keepPreviousData,
  });
}
