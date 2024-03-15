import type { BitcoinTx } from '@leather-wallet/models';
import { useQueries, useQuery } from '@tanstack/react-query';

import { AppUseQueryConfig } from '../../query-config';
import { useBitcoinClient } from '../bitcoin-client';

const staleTime = 10 * 1000;

const queryOptions = { staleTime, refetchInterval: staleTime };

export function useGetBitcoinTransactionsByAddressQuery<T extends unknown = BitcoinTx[]>(
  address: string,
  options?: AppUseQueryConfig<BitcoinTx[], T>
) {
  const client = useBitcoinClient();

  return useQuery({
    enabled: !!address,
    queryKey: ['btc-txs-by-address', address],
    queryFn: () => client.addressApi.getTransactionsByAddress(address),
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
        queryFn: () => client.addressApi.getTransactionsByAddress(address),
        ...queryOptions,
        ...options,
      };
    }),
  });
}
