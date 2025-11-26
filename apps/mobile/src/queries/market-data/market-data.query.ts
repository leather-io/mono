import { useUserSettings } from '@/hooks/use-user-settings';
import { useQuery } from '@tanstack/react-query';

import { FungibleCryptoAsset } from '@leather.io/models';
import { createMarketDataQueryConfig } from '@leather.io/queries';

export function useMarketDataQuery(asset: FungibleCryptoAsset) {
  const settings = useUserSettings();
  return useQuery(createMarketDataQueryConfig(asset, settings));
}
