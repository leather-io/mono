import { type UseQueryResult, useQueries } from '@tanstack/react-query';

import { useConfigRunesEnabled } from '../../common/remote-config/remote-config.query';
import { useLeatherNetwork } from '../../leather-query-provider';
import { type RuneTickerInfo, useBitcoinClient } from '../bitcoin-client';

const queryOptions = { staleTime: 5 * 60 * 1000 };

export function useGetRunesTickerInfoQuery(runeNames: string[]): UseQueryResult<RuneTickerInfo>[] {
  const client = useBitcoinClient();
  const network = useLeatherNetwork();
  const runesEnabled = useConfigRunesEnabled();

  return useQueries({
    queries: runeNames.map(runeName => {
      return {
        enabled: !!runeName && (network.chain.bitcoin.bitcoinNetwork === 'testnet' || runesEnabled),
        queryKey: ['runes-ticker-info', runeName],
        queryFn: () =>
          client.BestinSlotApi.getRunesTickerInfo(runeName, network.chain.bitcoin.bitcoinNetwork),
        ...queryOptions,
      };
    }),
  });
}
