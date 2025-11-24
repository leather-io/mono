import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import {
  AccountRequest,
  getBtcBalancesService,
  type QuotedBtcAggregateBalance,
  type QuotedBtcBalance,
} from '@leather.io/services';

import { balanceQueryOptions } from './query-options';
import { BalanceQueryHookOptions } from './types';

export function useGetBtcAccountBalanceQuery(
  request: AccountRequest,
  options: BalanceQueryHookOptions<QuotedBtcBalance> = {}
) {
  const { queryKeyContext = [], ...queryOptions } = options;
  return useQuery({
    queryKey: ['btc-balance-service-get-btc-account-balance', request, ...queryKeyContext],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getBtcBalancesService().getBtcAccountBalance(request, signal),
    ...balanceQueryOptions,
    ...queryOptions,
  });
}

export function useGetBtcAggregateBalanceQuery(
  requests: AccountRequest[],
  options: BalanceQueryHookOptions<QuotedBtcAggregateBalance> = {}
) {
  const { queryKeyContext = [], ...queryOptions } = options;
  return useQuery({
    queryKey: ['btc-balance-service-get-btc-aggregate-balance', requests, ...queryKeyContext],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getBtcBalancesService().getBtcAggregateBalance(requests, signal),
    ...balanceQueryOptions,
    ...queryOptions,
  });
}
