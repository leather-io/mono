import { useQuery } from '@tanstack/react-query';

import type { FungibleCryptoAsset } from '@leather.io/models';
import { createAssetDescriptionQueryConfig } from '@leather.io/queries';

import { useUserSettings } from '@app/hooks/use-user-settings';
import { toFetchState } from '@app/services/fetch-state';

export function useAssetDescription(asset: FungibleCryptoAsset) {
  return toFetchState(useAssetDescriptionQuery(asset));
}

function useAssetDescriptionQuery(asset: FungibleCryptoAsset) {
  const settings = useUserSettings();
  return useQuery(createAssetDescriptionQueryConfig(asset, settings));
}
