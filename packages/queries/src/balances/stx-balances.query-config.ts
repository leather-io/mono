import type { QueryFunctionContext, UseQueryOptions } from '@tanstack/react-query';

import {
  type AccountRequest,
  type UserSettings,
  type QuotedStxBalance,
  getStxBalancesService,
} from '@leather.io/services';

import { createServiceQueryKey } from '../shared/query-key.factory';
import { balanceQueryOptions } from '../shared/query-options';

export function createStxAccountBalanceQueryKey(request: AccountRequest, settings: UserSettings) {
  return createServiceQueryKey(
    'stx-balances-service--get-stx-account-balance',
    ['account', request],
    settings
  );
}

export function createStxAccountBalanceQueryConfig(
  request: AccountRequest,
  settings: UserSettings
) {
  return {
    queryKey: createStxAccountBalanceQueryKey(request, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getStxBalancesService().getStxAccountBalance(request, signal),
    ...balanceQueryOptions,
  } satisfies UseQueryOptions<QuotedStxBalance, Error>;
}

export function createStxAggregateBalanceQueryKey(
  requests: AccountRequest[],
  settings: UserSettings
) {
  return createServiceQueryKey(
    'stx-balances-service--get-stx-aggregate-balance',
    ['aggregate', requests],
    settings
  );
}

export function createStxAggregateBalanceQueryConfig(
  requests: AccountRequest[],
  settings: UserSettings
) {
  return {
    queryKey: createStxAggregateBalanceQueryKey(requests, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getStxBalancesService().getStxAggregateBalance(requests, signal),
    ...balanceQueryOptions,
  } satisfies UseQueryOptions<QuotedStxBalance, Error>;
}

export function createStxAddressBalanceQueryKey(address: string, settings: UserSettings) {
  return createServiceQueryKey(
    'stx-balances-service--get-stx-address-balance',
    ['address', address],
    settings
  );
}

export function createStxAddressBalanceQueryConfig(address: string, settings: UserSettings) {
  return {
    queryKey: createStxAddressBalanceQueryKey(address, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getStxBalancesService().getStxAddressBalance(address, signal),
    ...balanceQueryOptions,
  } satisfies UseQueryOptions<QuotedStxBalance, Error>;
}

