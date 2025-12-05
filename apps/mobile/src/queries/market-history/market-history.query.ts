import { toFetchState } from '@/components/loading';
import { useSettings } from '@/store/settings/settings';
import { useQuery, type QueryFunctionContext } from '@tanstack/react-query';

import { FungibleCryptoAsset, HistoricalPeriod } from '@leather.io/models';
import { createPriceChangePercentageQueryConfig } from '@leather.io/queries';
import { getMarketHistoryService } from '@leather.io/services';

export function usePriceChangePercentage(asset: FungibleCryptoAsset, period?: HistoricalPeriod) {
  return toFetchState(usePriceChangePercentageQuery(asset, period));
}

export function usePriceHistory(asset: FungibleCryptoAsset, period?: HistoricalPeriod) {
  return toFetchState(usePriceHistoryQuery(asset, period));
}

function usePriceChangePercentageQuery(asset: FungibleCryptoAsset, period?: HistoricalPeriod) {
  const settings = useSettings();
  return useQuery(createPriceChangePercentageQueryConfig(asset, period, settings));
}

function usePriceHistoryQuery(asset: FungibleCryptoAsset, period?: HistoricalPeriod) {
  const { fiatCurrencyPreference } = useSettings();
  return useQuery({
    queryKey: ['market-history-service-get-price-history', asset, period, fiatCurrencyPreference],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getMarketHistoryService().getPriceHistory(asset, period, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 1 * 30000,
    gcTime: 1 * 30000,
  });
}
