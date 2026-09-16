import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { FungibleCryptoAsset, HistoricalPeriod } from '@leather.io/models';
import { createPriceHistoryQueryConfig } from '@leather.io/queries';

import { useUserSettings } from '@app/hooks/use-user-settings';
import { toFetchState } from '@app/services/fetch-state';

export function usePriceHistory(asset: FungibleCryptoAsset, period: HistoricalPeriod) {
  const query = usePriceHistoryQuery(asset, period);
  return { ...toFetchState(query), isPlaceholderData: query.isPlaceholderData };
}

function usePriceHistoryQuery(asset: FungibleCryptoAsset, period: HistoricalPeriod) {
  const settings = useUserSettings();
  return useQuery({
    ...createPriceHistoryQueryConfig(asset, period, settings),
    placeholderData: keepPreviousData,
  });
}
