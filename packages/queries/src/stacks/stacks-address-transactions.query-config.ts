import type { AddressTransactionWithTransfers } from '@stacks/stacks-blockchain-api-types';
import type { QueryFunctionContext, UseQueryOptions } from '@tanstack/react-query';

import { type UserSettings, getHiroStacksApiClient } from '@leather.io/services';
import { oneMinInMs, secondsInMs } from '@leather.io/utils';

import { createServiceQueryKey } from '../shared/query-key.factory';

const addressTransactionsPages = { pages: 1 } as const;

export function createStacksAddressTransactionsQueryKey(address: string, settings: UserSettings) {
  return createServiceQueryKey(
    'hiro-stacks-api-client--get-address-transactions',
    [address],
    settings
  );
}

export function createStacksAddressTransactionsQueryConfig(
  address: string,
  settings: UserSettings
) {
  return {
    enabled: !!address,
    queryKey: createStacksAddressTransactionsQueryKey(address, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getHiroStacksApiClient().getAddressTransactions(address, addressTransactionsPages, {
        signal,
      }),
    staleTime: oneMinInMs,
    refetchInterval: secondsInMs(30),
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: true,
  } satisfies UseQueryOptions<AddressTransactionWithTransfers[]>;
}
