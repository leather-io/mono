import { QueryFunctionContext, useQuery } from '@tanstack/react-query';
import PQueue from 'p-queue';

import { BitcoinAddress, BitcoinNetworkModes } from '@leather.io/models';

import { useLeatherNetwork } from '../../leather-query-provider';
import { BitcoinQueryPrefixes } from '../../query-prefixes';
import { useBestInSlotApiRateLimiter } from '../../rate-limiter/best-in-slot-limiter';
import { BitcoinClient, useBitcoinClient } from '../clients/bitcoin-client';
import { useRunesEnabled } from './runes.hooks';

const queryOptions = { staleTime: 5 * 60 * 1000 } as const;

export function createGetRuneOutputsByAddressCacheKey(address: BitcoinAddress) {
  return [BitcoinQueryPrefixes.GetRunesOutputsByAddress, address];
}

interface CreateGetRunesOutputsByAddressQueryOptionsArgs {
  address: BitcoinAddress;
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
    queryKey: createGetRuneOutputsByAddressCacheKey(address),
    queryFn: ({ signal }: QueryFunctionContext) =>
      limiter.add(
        () =>
          client.BestInSlotApi.getRunesOutputsByAddress({
            address,
            network,
            signal,
          }),
        { signal, throwOnTimeout: true }
      ),
    ...queryOptions,
  } as const;
}

export function useGetRunesOutputsByAddressQuery(address: BitcoinAddress) {
  const client = useBitcoinClient();
  const network = useLeatherNetwork();
  const runesEnabled = useRunesEnabled();
  const limiter = useBestInSlotApiRateLimiter();

  return useQuery(
    createGetRunesOutputsByAddressQueryOptions({
      address,
      client,
      limiter,
      network: network.chain.bitcoin.mode,
      runesEnabled,
    })
  );
}
