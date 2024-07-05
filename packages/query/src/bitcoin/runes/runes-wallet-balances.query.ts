import { useQueries } from '@tanstack/react-query';

import { useConfigRunesEnabled } from '../../common/remote-config/remote-config.query';
import { useLeatherNetwork } from '../../leather-query-provider';
import { AppUseQueryConfig } from '../../query-config';
import { RuneBalance } from '../clients/best-in-slot';
import { useBitcoinClient } from '../clients/bitcoin-client';

const queryOptions = { staleTime: 5 * 60 * 1000 };

export function useGetRunesWalletBalancesByAddressesQuery<T extends unknown = RuneBalance[]>(
  addresses: string[],
  options?: AppUseQueryConfig<RuneBalance[], T>
) {
  const client = useBitcoinClient();
  const network = useLeatherNetwork();
  const runesEnabled = useConfigRunesEnabled();

  return useQueries({
    queries: addresses.map(address => {
      return {
        enabled: !!address && (network.chain.bitcoin.bitcoinNetwork === 'testnet' || runesEnabled),
        queryKey: ['runes-wallet-balances', address],
        queryFn: () => client.BestinSlotApi.getRunesWalletBalances(address),
        ...queryOptions,
        ...options,
      };
    }),
  });
}
