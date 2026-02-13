import { useQuery } from '@tanstack/react-query';

import type { FungibleAssetId, FungibleCryptoAsset } from '@leather.io/models';
import { createMarketDataByAssetIdQueryConfig } from '@leather.io/queries';
import { getAssetId } from '@leather.io/utils';

import { useUserSettings } from '@app/hooks/use-user-settings';
import { toFetchState } from '@app/services/fetch-state';

export function useMarketDataByAssetId(assetId: FungibleAssetId) {
  const settings = useUserSettings();
  return toFetchState(useQuery(createMarketDataByAssetIdQueryConfig(assetId, settings)));
}

export function useMarketData(asset: FungibleCryptoAsset) {
  const assetId = getAssetId(asset) as FungibleAssetId;
  return useMarketDataByAssetId(assetId);
}
