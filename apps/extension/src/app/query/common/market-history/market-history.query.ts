import { useQuery } from '@tanstack/react-query';

import type { FungibleCryptoAsset, HistoricalPeriod } from '@leather.io/models';
import { createPriceChangePercentageQueryConfig } from '@leather.io/queries';

import { useUserSettings } from '@app/hooks/use-user-settings';
import { toFetchState } from '@app/services/fetch-state';

export function usePriceChangePercentage(asset: FungibleCryptoAsset, period?: HistoricalPeriod) {
  return toFetchState(usePriceChangePercentageQuery(asset, period));
}

function usePriceChangePercentageQuery(asset: FungibleCryptoAsset, period?: HistoricalPeriod) {
  const settings = useUserSettings();
  return useQuery(createPriceChangePercentageQueryConfig(asset, period, settings));
}
