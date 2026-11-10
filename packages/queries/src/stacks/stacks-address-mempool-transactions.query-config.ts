import type { QueryFunctionContext, UseQueryOptions } from '@tanstack/react-query';

import {
  type HiroPrincipalMempoolTransactionsResponse,
  type UserSettings,
  getHiroStacksApiClient,
} from '@leather.io/services';

import { createServiceQueryKey } from '../shared/query-key.factory';

export function createStacksAddressMempoolTransactionsQueryKey(
  address: string,
  settings: UserSettings
) {
  return createServiceQueryKey(
    'hiro-stacks-api-client--get-principal-mempool-transactions',
    [address],
    settings
  );
}

export function createStacksAddressMempoolTransactionsQueryConfig(
  address: string,
  settings: UserSettings
) {
  return {
    enabled: !!address,
    queryKey: createStacksAddressMempoolTransactionsQueryKey(address, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getHiroStacksApiClient().getPrincipalMempoolTransactions(address, {}, { signal }),
  } satisfies UseQueryOptions<HiroPrincipalMempoolTransactionsResponse>;
}
