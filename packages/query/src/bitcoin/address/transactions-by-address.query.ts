import { QueryFunctionContext, useQueries, useQuery } from '@tanstack/react-query';

import type { BitcoinTx } from '@leather.io/models';

import { AppUseQueryConfig } from '../../query-config';
import { useBitcoinClient } from '../clients/bitcoin-client';

const staleTime = 10 * 1000;

const queryOptions = { staleTime, gcTime: Infinity, refetchInterval: staleTime };

export function useGetBitcoinTransactionsByAddressQuery<T extends unknown = BitcoinTx[]>(
  address: string,
  options?: AppUseQueryConfig<BitcoinTx[], T>
) {
  const client = useBitcoinClient();

  return useQuery({
    enabled: !!address,
    queryKey: ['btc-txs-by-address', address],
    queryFn: async ({ signal }) => client.addressApi.getTransactionsByAddress(address, signal),
    ...queryOptions,
    ...options,
  });
}
export function useGetBitcoinTransactionsByAddressesQuery<T extends unknown = BitcoinTx[]>(
  addresses: string[],
  options?: AppUseQueryConfig<BitcoinTx[], T>
) {
  const client = useBitcoinClient();

  return useQueries({
    queries: addresses.map(address => {
      return {
        enabled: !!address,
        queryKey: ['btc-txs-by-address', address],
        queryFn: async ({ signal }: QueryFunctionContext) =>
          client.addressApi.getTransactionsByAddress(address, signal),
        ...queryOptions,
        ...options,
      };
    }),
  });
}
