import { toFetchState } from '@/components/loading';
import { useUserSettings } from '@/hooks/use-user-settings';
import { useQuery } from '@tanstack/react-query';

import { FungibleCryptoAsset } from '@leather.io/models';
import { createFungibleAssetDescriptionQueryConfig } from '@leather.io/queries';

export function useAssetDescription(asset: FungibleCryptoAsset) {
  return toFetchState(useAssetDescriptionQuery(asset));
}

export function useAssetDescriptionQuery(asset: FungibleCryptoAsset) {
  const settings = useUserSettings();
  return useQuery({
    ...createFungibleAssetDescriptionQueryConfig(asset, settings),
  });
}
