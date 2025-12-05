import type { QueryFunctionContext } from '@tanstack/react-query';

import {
  type AccountRequest,
  type UserSettings,
  getSip10BalancesService,
} from '@leather.io/services';

import { createServiceQueryKey } from '../shared/query-key.factory';
import { balanceQueryOptions } from '../shared/query-options';

export function createSip10AccountBalanceQueryKey(request: AccountRequest, settings: UserSettings) {
  return createServiceQueryKey(
    'sip10-balances-service--get-sip10-account-balance',
    ['account', request],
    settings
  );
}

export function createSip10AccountBalanceQueryConfig(
  request: AccountRequest,
  settings: UserSettings
) {
  return {
    queryKey: createSip10AccountBalanceQueryKey(request, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getSip10BalancesService().getSip10AccountBalance(request, signal),
    ...balanceQueryOptions,
  };
}

export function createSip10AggregateBalanceQueryKey(
  requests: AccountRequest[],
  settings: UserSettings
) {
  return createServiceQueryKey(
    'sip10-balances-service--get-sip10-aggregate-balance',
    ['aggregate', requests],
    settings
  );
}

export function createSip10AggregateBalanceQueryConfig(
  requests: AccountRequest[],
  settings: UserSettings
) {
  return {
    queryKey: createSip10AggregateBalanceQueryKey(requests, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getSip10BalancesService().getSip10AggregateBalance(requests, signal),
    ...balanceQueryOptions,
  };
}

export function createSip10AddressBalanceQueryKey(
  address: string,
  includeHiddenAssets: boolean,
  settings: UserSettings
) {
  return createServiceQueryKey(
    'sip10-balances-service--get-sip10-address-balance',
    ['address', address, includeHiddenAssets],
    settings
  );
}
export function createSip10AddressBalanceQueryConfig(
  address: string,
  includeHiddenAssets: boolean,
  settings: UserSettings
) {
  return {
    queryKey: createSip10AddressBalanceQueryKey(address, includeHiddenAssets, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getSip10BalancesService().getSip10AddressBalance(address, includeHiddenAssets, signal),
    ...balanceQueryOptions,
  };
}
