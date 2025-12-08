import type { QueryFunctionContext, UseQueryOptions } from '@tanstack/react-query';

import {
  type AccountRequest,
  type UserSettings,
  type RuneBalance,
  type RunesAccountBalance,
  type RunesAggregateBalance,
  getRunesBalancesService,
} from '@leather.io/services';

import { createServiceQueryKey } from '../shared/query-key.factory';
import { balanceQueryOptions } from '../shared/query-options';

export function createRunesAccountBalanceQueryKey(
  request: AccountRequest,
  settings: UserSettings
) {
  return createServiceQueryKey(
    'runes-balances-service--get-runes-account-balance',
    ['account', request],
    settings
  );
}

export function createRunesAccountBalanceQueryConfig(
  request: AccountRequest,
  settings: UserSettings
) {
  return {
    queryKey: createRunesAccountBalanceQueryKey(request, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getRunesBalancesService().getRunesAccountBalance(request, signal),
    ...balanceQueryOptions,
  } satisfies UseQueryOptions<RunesAccountBalance, Error>;
}

export function createRunesAggregateBalanceQueryKey(
  requests: AccountRequest[],
  settings: UserSettings
) {
  return createServiceQueryKey(
    'runes-balances-service--get-runes-aggregate-balance',
    ['aggregate', requests],
    settings
  );
}

export function createRunesAggregateBalanceQueryConfig(
  requests: AccountRequest[],
  settings: UserSettings
) {
  return {
    queryKey: createRunesAggregateBalanceQueryKey(requests, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getRunesBalancesService().getRunesAggregateBalance(requests, signal),
    ...balanceQueryOptions,
  } satisfies UseQueryOptions<RunesAggregateBalance, Error>;
}

export function createRuneBalanceByRuneNameQueryKey(
  request: AccountRequest,
  runeName: string,
  settings: UserSettings
) {
  return createServiceQueryKey(
    'runes-balances-service--get-rune-balance-by-rune-name',
    ['by-rune-name', request, runeName],
    settings
  );
}

export function createRuneBalanceByRuneNameQueryConfig(
  request: AccountRequest,
  runeName: string,
  settings: UserSettings
) {
  return {
    queryKey: createRuneBalanceByRuneNameQueryKey(request, runeName, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getRunesBalancesService().getRuneBalanceByRuneName(request, runeName, signal),
    ...balanceQueryOptions,
  } satisfies UseQueryOptions<RuneBalance, Error>;
}

