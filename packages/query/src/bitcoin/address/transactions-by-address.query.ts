import { QueryFunctionContext, useQueries, useQuery } from '@tanstack/react-query';

import { BitcoinQueryPrefixes } from '../../query-prefixes';
import { BitcoinClient, useBitcoinClient } from '../clients/bitcoin-client';

const staleTime = 10 * 1000;

const queryOptions = { staleTime, gcTime: Infinity, refetchInterval: staleTime };

interface CreateGetBitcoinTransactionsByAddressQueryOptionsArgs {
  address: string;
  client: BitcoinClient;
}
export function createGetBitcoinTransactionsByAddressQueryOptions({
  address,
  client,
}: CreateGetBitcoinTransactionsByAddressQueryOptionsArgs) {
  return {
    enabled: !!address,
    queryKey: [BitcoinQueryPrefixes.GetTransactionsByAddress, client.networkName, address],
    queryFn: async ({ signal }: QueryFunctionContext) =>
      client.addressApi.getTransactionsByAddress(address, signal),
    ...queryOptions,
  } as const;
}

export function useGetBitcoinTransactionsByAddressQuery(address: string) {
  const client = useBitcoinClient();
  return useQuery(createGetBitcoinTransactionsByAddressQueryOptions({ address, client }));
}

export function useGetBitcoinTransactionsByAddressListQuery(addresses: string[]) {
  const client = useBitcoinClient();

  return useQueries({
    queries: addresses.map(address => {
      return createGetBitcoinTransactionsByAddressQueryOptions({ address, client });
    }),
  });
}
