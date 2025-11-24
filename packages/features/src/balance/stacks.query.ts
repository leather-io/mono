import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import {
  AccountRequest,
  getStxBalancesService,
  type QuotedStxAggregateBalance,
  type QuotedStxBalance,
} from '@leather.io/services';

import { balanceQueryOptions } from './query-options';
import { BalanceQueryHookOptions } from './types';

export function useGetStxAccountBalanceQuery(
  request: AccountRequest,
  options: BalanceQueryHookOptions<QuotedStxBalance> = {}
) {
  const { queryKeyContext = [], ...queryOptions } = options;
  return useQuery({
    queryKey: ['stx-balances-service-get-stx-account-balance', request, ...queryKeyContext],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getStxBalancesService().getStxAccountBalance(request, signal),
    ...balanceQueryOptions,
    ...queryOptions,
  });
}

export function useGetStxAggregateBalanceQuery(
  requests: AccountRequest[],
  options: BalanceQueryHookOptions<QuotedStxAggregateBalance> = {}
) {
  const { queryKeyContext = [], ...queryOptions } = options;
  return useQuery({
    queryKey: ['stx-balances-service-get-stx-aggregate-balance', requests, ...queryKeyContext],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getStxBalancesService().getStxAggregateBalance(requests, signal),
    ...balanceQueryOptions,
    ...queryOptions,
  });
}

export function useGetStxAddressBalanceQuery(
  address: string,
  options: BalanceQueryHookOptions<QuotedStxBalance> = {}
) {
  const { queryKeyContext = [], ...queryOptions } = options;
  return useQuery({
    queryKey: ['stx-balances-service-get-stx-address-balance', address, ...queryKeyContext],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getStxBalancesService().getStxAddressBalance(address, signal),
    enabled: !!address,
    ...balanceQueryOptions,
    ...queryOptions,
  });
}
