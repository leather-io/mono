import type { QueryFunctionContext, UseQueryOptions } from '@tanstack/react-query';

import {
  type HiroPrincipalTransaction,
  type UserSettings,
  getHiroStacksApiClient,
} from '@leather.io/services';
import { oneMinInMs, secondsInMs } from '@leather.io/utils';

import { createServiceQueryKey } from '../shared/query-key.factory';

const addressTransactionsLimit = 50;

export function createStacksAddressTransactionsQueryKey(address: string, settings: UserSettings) {
  return createServiceQueryKey(
    'hiro-stacks-api-client--get-principal-transactions',
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
    async queryFn({ signal }: QueryFunctionContext) {
      const resp = await getHiroStacksApiClient().getPrincipalTransactions(
        address,
        { limit: addressTransactionsLimit },
        { signal }
      );
      return resp.results.map(result => result.transaction);
    },
    staleTime: oneMinInMs,
    refetchInterval: secondsInMs(30),
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: true,
  } satisfies UseQueryOptions<HiroPrincipalTransaction[]>;
}
