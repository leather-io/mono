import { BitcoinNetworkModes } from '@leather.io/models';

import { BitcoinQueryPrefixes } from '../../query-prefixes';
import { BitcoinClient } from '../clients/bitcoin-client';

async function fetchBitcoinFeeEstimates(client: BitcoinClient, network: BitcoinNetworkModes) {
  if (network === 'mainnet')
    return Promise.allSettled([
      client.feeEstimatesApi.getFeeEstimatesFromMempoolSpaceApi(),
      client.feeEstimatesApi.getFeeEstimatesFromBlockcypherApi('main'),
    ]);
  // Using `allSettled` so we can add more testnet apis to the array
  return Promise.allSettled([client.feeEstimatesApi.getFeeEstimatesFromBlockcypherApi('test3')]);
}

interface CreateGetBitcoinFeeEstimatesQueryOptionsArgs {
  client: BitcoinClient;
  network: BitcoinNetworkModes;
}
export function createGetBitcoinFeeEstimatesQueryOptions({
  client,
  network,
}: CreateGetBitcoinFeeEstimatesQueryOptionsArgs) {
  return {
    queryKey: [BitcoinQueryPrefixes.GetBitcoinFeeEstimates, network],
    queryFn: () => fetchBitcoinFeeEstimates(client, network),
    refetchInterval: 2000 * 60,
  } as const;
}
