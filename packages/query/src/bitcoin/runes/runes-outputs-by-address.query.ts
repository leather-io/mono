import { useQuery } from '@tanstack/react-query';

import { useLeatherNetwork } from '../../leather-query-provider';
import { AppUseQueryConfig } from '../../query-config';
import { RunesOutputsByAddress } from '../clients/best-in-slot';
import { useBitcoinClient } from '../clients/bitcoin-client';
import { useRunesEnabled } from './runes.hooks';

const queryOptions = { staleTime: 5 * 60 * 1000 };

export function useGetRunesOutputsByAddressQuery<T extends unknown = RunesOutputsByAddress[]>(
  address: string,
  options?: AppUseQueryConfig<RunesOutputsByAddress[], T>
) {
  const client = useBitcoinClient();
  const runesEnabled = useRunesEnabled();
  const network = useLeatherNetwork();

  return useQuery({
    enabled: !!address && runesEnabled,
    queryKey: ['runes-outputs-by-address', address],
    queryFn: ({ signal }) =>
      client.BestinSlotApi.getRunesOutputsByAddress({
        address,
        network: network.chain.bitcoin.bitcoinNetwork,
        signal,
      }),
    ...queryOptions,
    ...options,
  });
}
