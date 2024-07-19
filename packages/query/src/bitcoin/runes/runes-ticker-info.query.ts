import { useQueries } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';

import { baseCurrencyAmountInQuote, createMoney, isDefined } from '@leather.io/utils';

import { useCryptoCurrencyMarketDataMeanAverage } from '../../common/market-data/market-data.hooks';
import { BitcoinQueryPrefixes } from '../../query-prefixes';
import { RuneBalance, RuneTickerInfo } from '../clients/best-in-slot';
import { BitcoinClient, useBitcoinClient } from '../clients/bitcoin-client';
import { useRunesEnabled } from './runes.hooks';
import { createRuneCryptoAssetDetails } from './runes.utils';

const queryOptions = { staleTime: 5 * 60 * 1000 } as const;

interface CreateGetRunesTickerInfoQueryOptionsArgs {
  client: BitcoinClient;
  runeBalance: RuneBalance;
  runesEnabled: boolean;
}
export function createGetRunesTickerInfoQueryOptions({
  client,
  runeBalance,
  runesEnabled,
}: CreateGetRunesTickerInfoQueryOptionsArgs) {
  return {
    enabled: isDefined(runeBalance) && runesEnabled,
    queryKey: [BitcoinQueryPrefixes.GetRunesTickerInfo, runeBalance.rune_name],
    queryFn: () => client.BestinSlotApi.getRunesTickerInfo(runeBalance.rune_name),
    ...queryOptions,
  } as const;
}

export function useGetRunesTickerInfoQuery(runesBalances: RuneBalance[]) {
  const client = useBitcoinClient();
  const btcMarketData = useCryptoCurrencyMarketDataMeanAverage('BTC');
  const runesEnabled = useRunesEnabled();

  return useQueries({
    queries: runesBalances.map(runeBalance => {
      return {
        ...createGetRunesTickerInfoQueryOptions({ client, runeBalance, runesEnabled }),
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
