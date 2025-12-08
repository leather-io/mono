import { toFetchState } from '@/components/loading';
import { useSettings } from '@/store/settings/settings';
import { useQuery } from '@tanstack/react-query';

import { FungibleCryptoAsset, HistoricalPeriod, QuoteCurrency } from '@leather.io/models';
import {
  createPriceChangePercentageQueryConfig,
  createPriceHistoryQueryConfig,
} from '@leather.io/queries';
import type { UserSettings } from '@leather.io/services';

export function usePriceChangePercentage(asset: FungibleCryptoAsset, period?: HistoricalPeriod) {
  return toFetchState(usePriceChangePercentageQuery(asset, period));
}

export function usePriceHistory(asset: FungibleCryptoAsset, period?: HistoricalPeriod) {
  return toFetchState(usePriceHistoryQuery(asset, period));
}

function usePriceChangePercentageQuery(asset: FungibleCryptoAsset, period?: HistoricalPeriod) {
  const { fiatCurrencyPreference, networkPreference, assetVisibility } = useSettings();
  const settings: UserSettings = {
    network: networkPreference,
    quoteCurrency: fiatCurrencyPreference as QuoteCurrency,
    assetVisibility,
  };

  return useQuery({
    ...createPriceChangePercentageQueryConfig(asset, period, settings),
  });
}

function usePriceHistoryQuery(asset: FungibleCryptoAsset, period?: HistoricalPeriod) {
  const { fiatCurrencyPreference, networkPreference, assetVisibility } = useSettings();
  const settings: UserSettings = {
    network: networkPreference,
    quoteCurrency: fiatCurrencyPreference as QuoteCurrency,
    assetVisibility,
  };

  return useQuery({
    ...createPriceHistoryQueryConfig(asset, period, settings),
  });
}
