import { useQueries } from '@tanstack/react-query';
import PQueue from 'p-queue';

import { BitcoinAddress, NetworkConfiguration } from '@leather.io/models';

import { useConfigRunesEnabled } from '../../common/remote-config/remote-config.query';
import { useLeatherNetwork } from '../../leather-query-provider';
import { BitcoinQueryPrefixes } from '../../query-prefixes';
import { useBestInSlotApiRateLimiter } from '../../rate-limiter/best-in-slot-limiter';
import { BitcoinClient, useBitcoinClient } from '../clients/bitcoin-client';

const queryOptions = { staleTime: 5 * 60 * 1000 } as const;

interface CreateGetRunesWalletBalancesByAddressesQueryOptionsArgs {
  address: BitcoinAddress;
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

export function useGetRunesWalletBalancesByAddressesQuery(addresses: BitcoinAddress[]) {
  const client = useBitcoinClient();
  const network = useLeatherNetwork();
  const runesEnabled = useConfigRunesEnabled();
  const limiter = useBestInSlotApiRateLimiter();

  return useQueries({
    queries: addresses.map(address => {
      return createGetRunesWalletBalancesByAddressesQueryOptions({
        address,
        client,
        network,
        runesEnabled,
        limiter,
      });
    }),
  });
}
