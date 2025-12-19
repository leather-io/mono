import type { QueryFunctionContext } from '@tanstack/react-query';

import {
  type AccountRequest,
  type UserSettings,
  getBtcBalancesService,
} from '@leather.io/services';

import { createServiceQueryKey } from '../shared/query-key.factory';
import { balanceQueryOptions } from '../shared/query-options';

export function createBtcBalanceQueryKey(request: AccountRequest, settings: UserSettings) {
  return createServiceQueryKey(
    'btc-balances-service--get-btc-account-balance',
    [request],
    settings
  );
}
export function createBtcBalanceQueryConfig(request: AccountRequest, settings: UserSettings) {
  return {
    queryKey: createBtcBalanceQueryKey(request, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getBtcBalancesService().getBtcAccountBalance(request, signal),
    ...balanceQueryOptions,
  };
}

export function createBtcAggregateBalanceQueryKey(
  requests: AccountRequest[],
  settings: UserSettings
) {
  return createServiceQueryKey(
    'btc-balances-service--get-btc-aggregate-balance',
    [requests],
    settings
  );
}
export function createBtcAggregateBalanceQueryConfig(
  requests: AccountRequest[],
  settings: UserSettings
) {
  return {
    queryKey: createBtcAggregateBalanceQueryKey(requests, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getBtcBalancesService().getBtcAggregateBalance(requests, signal),
    ...balanceQueryOptions,
  };
}
