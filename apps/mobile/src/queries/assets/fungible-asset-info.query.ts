import { useUserSettings } from '@/hooks/use-user-settings';
import { useQuery } from '@tanstack/react-query';

import { FungibleCryptoAsset } from '@leather.io/models';
import { createFungibleAssetDescriptionQueryConfig } from '@leather.io/queries';

export function useAssetDescriptionQuery(asset: FungibleCryptoAsset) {
  const settings = useUserSettings();
  return useQuery({
    ...createFungibleAssetDescriptionQueryConfig(asset, settings),
  });
}
