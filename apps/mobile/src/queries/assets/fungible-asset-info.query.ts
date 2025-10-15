import { toFetchState } from '@/components/loading';
import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { FungibleCryptoAsset } from '@leather.io/models';
import { getFungibleAssetInfoService } from '@leather.io/services';

const DEFAULT_LOCALE = 'en';

export function useAssetDescription(asset: FungibleCryptoAsset) {
  return toFetchState(useAssetDescriptionQuery(asset));
}

export function useAssetDescriptionQuery(asset: FungibleCryptoAsset) {
  return useQuery({
    queryKey: ['fungible-asset-info-service-get-asset-description', asset],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getFungibleAssetInfoService().getAssetDescription(asset, DEFAULT_LOCALE, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 1 * 60000,
    gcTime: 1 * 60000,
  });
}
