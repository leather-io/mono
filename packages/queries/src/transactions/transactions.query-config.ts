import type { QueryFunctionContext, UseQueryOptions } from '@tanstack/react-query';

import type { BitcoinTransaction, StacksTx } from '@leather.io/models';
import {
  type UserSettings,
  getBitcoinTransactionsService,
  getStacksTransactionsService,
} from '@leather.io/services';

import { createServiceQueryKey } from '../shared/query-key.factory';

export function createStacksTransactionByIdQueryKey(txid: string, settings: UserSettings) {
  return createServiceQueryKey(
    'stacks-transactions-service--get-transaction-by-id',
    [txid],
    settings
  );
}

export function createStacksTransactionByIdQueryConfig(txid: string, settings: UserSettings) {
  return {
    queryKey: createStacksTransactionByIdQueryKey(txid, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getStacksTransactionsService().getTransactionById(txid, signal),
  } satisfies UseQueryOptions<StacksTx | null, Error>;
}

export function createBitcoinTransactionByTxIdQueryKey(txid: string, settings: UserSettings) {
  return createServiceQueryKey(
    'bitcoin-transactions-service--get-transaction-by-tx-id',
    [txid],
    settings
  );
}

export function createBitcoinTransactionByTxIdQueryConfig(txid: string, settings: UserSettings) {
  return {
    queryKey: createBitcoinTransactionByTxIdQueryKey(txid, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getBitcoinTransactionsService().getTransactionByTxId(txid, signal),
  } satisfies UseQueryOptions<BitcoinTransaction | null, Error>;
}
