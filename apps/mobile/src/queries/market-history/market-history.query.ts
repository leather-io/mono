import { toFetchState } from '@/components/loading';
import { useSettings } from '@/store/settings/settings';
import { useQuery } from '@tanstack/react-query';

import { type FungibleCryptoAsset, type HistoricalPeriod } from '@leather.io/models';
import { createPriceChangePercentageQueryConfig } from '@leather.io/queries';
import type { UserSettings } from '@leather.io/services';

export function usePriceChangePercentage(asset: FungibleCryptoAsset, period?: HistoricalPeriod) {
  return toFetchState(usePriceChangePercentageQuery(asset, period));
}

function usePriceChangePercentageQuery(asset: FungibleCryptoAsset, period?: HistoricalPeriod) {
  const { fiatCurrencyPreference, networkPreference, assetVisibility } = useSettings();
  const settings: UserSettings = {
    network: networkPreference,
    quoteCurrency: fiatCurrencyPreference,
    assetVisibility,
  };

  return useQuery({
    ...createPriceChangePercentageQueryConfig(asset, period, settings),
  });
}
