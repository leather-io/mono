import { useQueries } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';

import { baseCurrencyAmountInQuote, createMoney, isDefined } from '@leather.io/utils';

import { useCryptoCurrencyMarketDataMeanAverage } from '../../common/market-data/market-data.hooks';
import { RuneBalance, RuneTickerInfo } from '../clients/best-in-slot';
import { useBitcoinClient } from '../clients/bitcoin-client';
import { useRunesEnabled } from './runes.hooks';
import { createRuneCryptoAssetDetails } from './runes.utils';

const queryOptions = { staleTime: 5 * 60 * 1000 };

export function useGetRunesTickerInfoQuery(runesBalances: RuneBalance[]) {
  const client = useBitcoinClient();
  const btcMarketData = useCryptoCurrencyMarketDataMeanAverage('BTC');

  const runesEnabled = useRunesEnabled();

  return useQueries({
    queries: runesBalances.map(runeBalance => {
      return {
        enabled: isDefined(runeBalance) && runesEnabled,
        queryKey: ['runes-ticker-info', runeBalance.rune_name],
        queryFn: () => client.BestinSlotApi.getRunesTickerInfo(runeBalance.rune_name),
        select: (resp: RuneTickerInfo) => {
          const fiatPrice = baseCurrencyAmountInQuote(
            createMoney(new BigNumber(resp.min_listed_unit_price_in_sats ?? 0), 'BTC'),
            btcMarketData
          );
          return createRuneCryptoAssetDetails(runeBalance, resp, fiatPrice);
        },
        ...queryOptions,
      };
    }),
  });
}
