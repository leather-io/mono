import { useQuery } from '@tanstack/react-query';

import type { FungibleCryptoAsset } from '@leather.io/models';
import { createMarketDataQueryConfig } from '@leather.io/queries';

import { useUserSettings } from '@app/hooks/use-user-settings';

export function useMarketData(asset: FungibleCryptoAsset) {
  return useGetMarketDataQuery(asset);
}

function useGetMarketDataQuery(asset: FungibleCryptoAsset) {
  const settings = useUserSettings();
  return useQuery(createMarketDataQueryConfig(asset, settings));
}
