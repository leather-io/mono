import type { QueryFunctionContext } from '@tanstack/react-query';
import PQueue from 'p-queue';

import { BitcoinNetworkModes } from '@leather.io/models';

import { BitcoinQueryPrefixes } from '../../query-prefixes';
import { BitcoinClient } from '../clients/bitcoin-client';

const queryOptions = { staleTime: 5 * 60 * 1000 } as const;

export function createGetRuneOutputsByAddressCacheKey(address: string) {
  return [BitcoinQueryPrefixes.GetRunesOutputsByAddress, address];
}

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
