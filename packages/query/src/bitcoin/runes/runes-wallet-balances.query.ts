import PQueue from 'p-queue';

import { NetworkConfiguration } from '@leather.io/models';

import { BitcoinQueryPrefixes } from '../../query-prefixes';
import { BitcoinClient } from '../clients/bitcoin-client';

const queryOptions = { staleTime: 5 * 60 * 1000 } as const;

interface CreateGetRunesWalletBalancesByAddressesQueryOptionsArgs {
  address: string;
  client: BitcoinClient;
  network: NetworkConfiguration;
  runesEnabled: boolean;
  limiter: PQueue;
}
export function createGetRunesWalletBalancesByAddressesQueryOptions({
  address,
  client,
  network,
  runesEnabled,
  limiter,
}: CreateGetRunesWalletBalancesByAddressesQueryOptionsArgs) {
  return {
    enabled: !!address && (network.chain.bitcoin.mode === 'testnet' || runesEnabled),
    queryKey: [BitcoinQueryPrefixes.GetRunesWalletBalances, address],
    queryFn: () =>
      limiter.add(() => client.BestInSlotApi.getRunesWalletBalances(address), {
        throwOnTimeout: true,
      }),
    ...queryOptions,
  } as const;
}
