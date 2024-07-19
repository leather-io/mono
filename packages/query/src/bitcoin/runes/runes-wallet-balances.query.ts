import { useQueries } from '@tanstack/react-query';

import { NetworkConfiguration } from '@leather.io/models';

import { useConfigRunesEnabled } from '../../common/remote-config/remote-config.query';
import { useLeatherNetwork } from '../../leather-query-provider';
import { BitcoinQueryPrefixes } from '../../query-prefixes';
import { BitcoinClient, useBitcoinClient } from '../clients/bitcoin-client';

const queryOptions = { staleTime: 5 * 60 * 1000 } as const;

interface CreateGetRunesWalletBalancesByAddressesQueryOptionsArgs {
  address: string;
  client: BitcoinClient;
  network: NetworkConfiguration;
  runesEnabled: boolean;
}
export function createGetRunesWalletBalancesByAddressesQueryOptions({
  address,
  client,
  network,
  runesEnabled,
}: CreateGetRunesWalletBalancesByAddressesQueryOptionsArgs) {
  return {
    enabled: !!address && (network.chain.bitcoin.bitcoinNetwork === 'testnet' || runesEnabled),
    queryKey: [BitcoinQueryPrefixes.GetRunesWalletBalances, address],
    queryFn: () => client.BestinSlotApi.getRunesWalletBalances(address),
    ...queryOptions,
  } as const;
}

export function useGetRunesWalletBalancesByAddressesQuery(addresses: string[]) {
  const client = useBitcoinClient();
  const network = useLeatherNetwork();
  const runesEnabled = useConfigRunesEnabled();

  return useQueries({
    queries: addresses.map(address => {
      return createGetRunesWalletBalancesByAddressesQueryOptions({
        address,
        client,
        network,
        runesEnabled,
      });
    }),
  });
}
