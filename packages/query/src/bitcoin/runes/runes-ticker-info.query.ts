import { useQueries } from '@tanstack/react-query';

import { useConfigRunesEnabled } from '../../common/remote-config/remote-config.query';
import { useLeatherNetwork } from '../../leather-query-provider';
import { RuneBalance, type RuneTickerInfo, useBitcoinClient } from '../bitcoin-client';
import { createRuneCryptoAssetDetails } from './runes.utils';

const queryOptions = { staleTime: 5 * 60 * 1000 };

export function useGetRunesTickerInfoQuery(runesBalances: RuneBalance[]) {
  const client = useBitcoinClient();
  const network = useLeatherNetwork();
  const runesEnabled = useConfigRunesEnabled();

  return useQueries({
    queries: runesBalances.map(runeBalance => {
      return {
        enabled:
          !runeBalance && (network.chain.bitcoin.bitcoinNetwork === 'testnet' || runesEnabled),
        queryKey: ['runes-ticker-info', runeBalance.rune_name],
        queryFn: () =>
          client.BestinSlotApi.getRunesTickerInfo(
            runeBalance.rune_name,
            network.chain.bitcoin.bitcoinNetwork
          ),
        select: (resp: RuneTickerInfo) => createRuneCryptoAssetDetails(runeBalance, resp),
        ...queryOptions,
      };
    }),
  });
}
