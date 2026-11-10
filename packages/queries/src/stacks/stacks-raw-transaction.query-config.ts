import type { GetRawTransactionResult } from '@stacks/stacks-blockchain-api-types';
import type { QueryFunctionContext, UseQueryOptions } from '@tanstack/react-query';

import { type UserSettings, getHiroStacksApiClient } from '@leather.io/services';

import { createServiceQueryKey } from '../shared/query-key.factory';

export function createStacksRawTransactionByIdQueryKey(txid: string, settings: UserSettings) {
  return createServiceQueryKey(
    'hiro-stacks-api-client--get-raw-transaction-by-id',
    [txid],
    settings
  );
}

export function createStacksRawTransactionByIdQueryConfig(txid: string, settings: UserSettings) {
  return {
    queryKey: createStacksRawTransactionByIdQueryKey(txid, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getHiroStacksApiClient().getRawTransactionById(txid, { signal }),
  } satisfies UseQueryOptions<GetRawTransactionResult>;
}
