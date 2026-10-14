import { useQuery } from '@tanstack/react-query';

import type { FungibleCryptoAsset } from '@leather.io/models';
import { createMarketStatsQueryConfig } from '@leather.io/queries';

import { useUserSettings } from '@app/hooks/use-user-settings';
import { toFetchState } from '@app/services/fetch-state';

export function useMarketStats(asset: FungibleCryptoAsset) {
  return toFetchState(useMarketStatsQuery(asset));
}

function useMarketStatsQuery(asset: FungibleCryptoAsset) {
  const settings = useUserSettings();
  return useQuery(createMarketStatsQueryConfig(asset, settings));
}
