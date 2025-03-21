import type { QueryFunctionContext } from '@tanstack/react-query';

import { BitcoinQueryPrefixes } from '../../query-prefixes';
import { BitcoinClient } from '../clients/bitcoin-client';

const staleTime = 10 * 1000;

const queryOptions = {
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  staleTime,
  gcTime: Infinity,
  refetchInterval: staleTime,
};

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
