import type { QueryFunctionContext } from '@tanstack/react-query';

import { BitcoinTx } from '@leather.io/models';

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

// We do not use these and they can be huge strings that consume too much storage
function omitVinWitnessScript(txs: BitcoinTx[]): BitcoinTx[] {
  return txs.map(tx => ({
    ...tx,
    vin: tx.vin?.map(vin => (vin ? { ...vin, witness: ['reacted'] } : vin)),
  }));
}

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
      omitVinWitnessScript(await client.addressApi.getTransactionsByAddress(address, signal)),
    ...queryOptions,
  } as const;
}
