import { toFetchState } from '@/components/loading';
import { useUserSettings } from '@/hooks/use-user-settings';
import { useQuery } from '@tanstack/react-query';

import { FungibleCryptoAsset, HistoricalPeriod } from '@leather.io/models';
import { createPriceChangePercentageQueryConfig, createPriceHistoryQueryConfig } from '@leather.io/queries';

export function usePriceChangePercentage(asset: FungibleCryptoAsset, period?: HistoricalPeriod) {
  return toFetchState(usePriceChangePercentageQuery(asset, period));
}

export function usePriceHistory(asset: FungibleCryptoAsset, period?: HistoricalPeriod) {
  return toFetchState(usePriceHistoryQuery(asset, period));
}

function usePriceChangePercentageQuery(asset: FungibleCryptoAsset, period?: HistoricalPeriod) {
  const settings = useUserSettings();
  return useQuery(createPriceChangePercentageQueryConfig(asset, period, settings));
}

function usePriceHistoryQuery(asset: FungibleCryptoAsset, period?: HistoricalPeriod) {
  const settings = useUserSettings();
  return useQuery(createPriceHistoryQueryConfig(asset, period, settings));
}
