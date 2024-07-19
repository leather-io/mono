import { QueryFunctionContext, useQuery } from '@tanstack/react-query';
import PQueue from 'p-queue';

import { BitcoinNetworkModes } from '@leather.io/models';

import { useLeatherNetwork } from '../../leather-query-provider';
import { BitcoinQueryPrefixes } from '../../query-prefixes';
import { useBestInSlotApiRateLimiter } from '../../rate-limiter/best-in-slot-limiter';
import { BitcoinClient, useBitcoinClient } from '../clients/bitcoin-client';
import { useRunesEnabled } from './runes.hooks';

const queryOptions = { staleTime: 5 * 60 * 1000 } as const;

interface CreateGetRunesOutputsByAddressQueryOptionsArgs {
  address: string;
  client: BitcoinClient;
  limiter: PQueue;
  network: BitcoinNetworkModes;
  runesEnabled: boolean;
}
export function createGetRunesOutputsByAddressQueryOptions({
  address,
  client,
  limiter,
  network,
  runesEnabled,
}: CreateGetRunesOutputsByAddressQueryOptionsArgs) {
  return {
    enabled: !!address && runesEnabled,
    queryKey: [BitcoinQueryPrefixes.GetRunesOutputsByAddress, address],
    queryFn: ({ signal }: QueryFunctionContext) =>
      limiter.add(
        () =>
          client.BestinSlotApi.getRunesOutputsByAddress({
            address,
            network,
            signal,
          }),
        { signal, throwOnTimeout: true }
      ),
    ...queryOptions,
  } as const;
}

export function useGetRunesOutputsByAddressQuery(address: string) {
  const client = useBitcoinClient();
  const network = useLeatherNetwork();
  const runesEnabled = useRunesEnabled();
  const limiter = useBestInSlotApiRateLimiter();

  return useQuery(
    createGetRunesOutputsByAddressQueryOptions({
      address,
      client,
      limiter,
      network: network.chain.bitcoin.bitcoinNetwork,
      runesEnabled,
    })
  );
}
