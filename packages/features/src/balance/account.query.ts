import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { Money } from '@leather.io/models';
import { AccountRequest, getAccountBalancesService } from '@leather.io/services';

import { balanceQueryOptions } from './query-options';
import { BalanceQueryHookOptions } from './types';

export function useGetAccountTotalBalanceQuery(
  request: AccountRequest,
  options: BalanceQueryHookOptions<Money> = {}
) {
  const { queryKeyContext = [], ...queryOptions } = options;
  return useQuery({
    queryKey: ['account-balances-service-get-total-balance', request, ...queryKeyContext],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getAccountBalancesService().getTotalBalance(request, signal),
    ...balanceQueryOptions,
    ...queryOptions,
  });
}

export function useGetAccountUnlockedBalanceQuery(
  request: AccountRequest,
  options: BalanceQueryHookOptions<Money> = {}
) {
  const { queryKeyContext = [], ...queryOptions } = options;
  return useQuery({
    queryKey: ['account-balances-service-get-unlocked-balance', request, ...queryKeyContext],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getAccountBalancesService().getUnlockedBalance(request, signal),
    ...balanceQueryOptions,
    ...queryOptions,
  });
}
