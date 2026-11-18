import type { QueryFunctionContext, UseQueryOptions } from '@tanstack/react-query';

import type { BitcoinTx } from '@leather.io/models';
import { type UserSettings, getMempoolApiClient } from '@leather.io/services';
import { secondsInMs } from '@leather.io/utils';

import { createServiceQueryKey } from '../shared/query-key.factory';

const bitcoinAddressTransactionsStaleTime = secondsInMs(10);

export function createBitcoinAddressTransactionsQueryKey(address: string, settings: UserSettings) {
  return createServiceQueryKey(
    'mempool-api-client--fetch-address-bitcoin-txs',
    [address],
    settings
  );
}

export function createBitcoinAddressTransactionsQueryConfig(
  address: string,
  settings: UserSettings
) {
  return {
    enabled: !!address,
    queryKey: createBitcoinAddressTransactionsQueryKey(address, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getMempoolApiClient().fetchAddressBitcoinTxs(address, { signal }),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: bitcoinAddressTransactionsStaleTime,
    gcTime: Infinity,
    refetchInterval: bitcoinAddressTransactionsStaleTime,
  } satisfies UseQueryOptions<BitcoinTx[]>;
}
