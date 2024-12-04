import { BitcoinNetwork } from '@leather.io/models';

import { BitcoinQueryPrefixes } from '../../query-prefixes';
import { BitcoinClient } from '../clients/bitcoin-client';

async function fetchBitcoinFeeEstimates(client: BitcoinClient, network: BitcoinNetwork) {
  if (network === 'mainnet')
    return Promise.allSettled([
      client.feeEstimatesApi.getFeeEstimatesFromMempoolSpaceApi('main'),
      client.feeEstimatesApi.getFeeEstimatesFromBlockcypherApi('main'),
    ]);

  if (network === 'testnet4')
    return Promise.allSettled([client.feeEstimatesApi.getFeeEstimatesFromMempoolSpaceApi('test4')]);

  // Using `allSettled` so we can add more testnet apis to the array
  return Promise.allSettled([client.feeEstimatesApi.getFeeEstimatesFromBlockcypherApi('test3')]);
}

interface CreateGetBitcoinFeeEstimatesQueryOptionsArgs {
  client: BitcoinClient;
  network: BitcoinNetwork;
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
