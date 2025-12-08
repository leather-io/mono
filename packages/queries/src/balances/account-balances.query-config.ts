import type { QueryFunctionContext, UseQueryOptions } from '@tanstack/react-query';

import type { Money } from '@leather.io/models';
import {
  type AccountRequest,
  type UserSettings,
  getAccountBalancesService,
} from '@leather.io/services';

import { createServiceQueryKey } from '../shared/query-key.factory';
import { balanceQueryOptions } from '../shared/query-options';

export function createAccountTotalBalanceQueryKey(
  request: AccountRequest,
  settings: UserSettings
) {
  return createServiceQueryKey(
    'account-balances-service--get-total-balance',
    ['total', request],
    settings
  );
}

export function createAccountTotalBalanceQueryConfig(
  request: AccountRequest,
  settings: UserSettings
) {
  return {
    queryKey: createAccountTotalBalanceQueryKey(request, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getAccountBalancesService().getTotalBalance(request, signal),
    ...balanceQueryOptions,
  } satisfies UseQueryOptions<Money, Error>;
}

export function createAccountUnlockedBalanceQueryKey(
  request: AccountRequest,
  settings: UserSettings
) {
  return createServiceQueryKey(
    'account-balances-service--get-unlocked-balance',
    ['unlocked', request],
    settings
  );
}

export function createAccountUnlockedBalanceQueryConfig(
  request: AccountRequest,
  settings: UserSettings
) {
  return {
    queryKey: createAccountUnlockedBalanceQueryKey(request, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getAccountBalancesService().getUnlockedBalance(request, signal),
    ...balanceQueryOptions,
  } satisfies UseQueryOptions<Money, Error>;
}

