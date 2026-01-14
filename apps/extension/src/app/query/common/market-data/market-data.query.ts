import { useQuery } from '@tanstack/react-query';

import type { FungibleAssetId } from '@leather.io/models';
import { createMarketDataByAssetIdQueryConfig } from '@leather.io/queries';

import { useUserSettings } from '@app/hooks/use-user-settings';
import { toFetchState } from '@app/services/fetch-state';

export function useMarketDataByAssetId(assetId: FungibleAssetId) {
  const settings = useUserSettings();
  return toFetchState(useQuery(createMarketDataByAssetIdQueryConfig(assetId, settings)));
}
