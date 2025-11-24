import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import {
  AccountRequest,
  RuneBalance,
  RunesAggregateBalance,
  getRunesBalancesService,
} from '@leather.io/services';

import { balanceQueryOptions } from './query-options';
import { BalanceQueryHookOptions } from './types';

export function useGetRunesAccountBalanceQuery(
  request: AccountRequest,
  options: BalanceQueryHookOptions<RunesAggregateBalance> = {}
) {
  const { queryKeyContext = [], ...queryOptions } = options;
  return useQuery({
    queryKey: ['runes-balances-service-get-runes-account-balance', request, ...queryKeyContext],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getRunesBalancesService().getRunesAccountBalance(request, signal),
    ...balanceQueryOptions,
    ...queryOptions,
  });
}

export function useGetRunesAggregateBalanceQuery(
  requests: AccountRequest[],
  options: BalanceQueryHookOptions<RunesAggregateBalance> = {}
) {
  const { queryKeyContext = [], ...queryOptions } = options;
  return useQuery({
    queryKey: [
      'runes-balances-service-get-runes-aggregate-balance',
      requests,
      ...queryKeyContext,
    ],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getRunesBalancesService().getRunesAggregateBalance(requests, signal),
    ...balanceQueryOptions,
    ...queryOptions,
  });
}

export function useGetRuneBalanceByRuneNameQuery(
  request: AccountRequest,
  runeName: string,
  options: BalanceQueryHookOptions<RuneBalance> = {}
) {
  const { queryKeyContext = [], ...queryOptions } = options;
  return useQuery({
    queryKey: [
      'runes-balances-service-get-rune-balance-by-rune-name',
      request,
      runeName,
      ...queryKeyContext,
    ],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getRunesBalancesService().getRuneBalanceByRuneName(request, runeName, signal),
    ...balanceQueryOptions,
    ...queryOptions,
  });
}
