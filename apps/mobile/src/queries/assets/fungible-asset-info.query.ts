import { useSettings } from '@/store/settings/settings';
import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { FungibleCryptoAsset } from '@leather.io/models';
import { getFungibleAssetInfoService } from '@leather.io/services';

const DEFAULT_LOCALE = 'en';
const DEFAULT_PRICE_HISTORY_PERIOD = '24h';

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

export function useAssetPriceChangeQuery(asset: FungibleCryptoAsset) {
  return useQuery({
    queryKey: ['fungible-asset-info-service-get-asset-price-change', asset],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getFungibleAssetInfoService().getAssetPriceChange(
        asset,
        DEFAULT_PRICE_HISTORY_PERIOD,
        signal
      ),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 1 * 5000,
    gcTime: 1 * 5000,
  });
}

export function useAssetPriceHistoryQuery(asset: FungibleCryptoAsset) {
  const { fiatCurrencyPreference } = useSettings();
  return useQuery({
    queryKey: [
      'fungible-asset-info-service-get-asset-price-history',
      asset,
      fiatCurrencyPreference,
    ],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getFungibleAssetInfoService().getAssetPriceHistory(
        asset,
        DEFAULT_PRICE_HISTORY_PERIOD,
        signal
      ),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 1 * 10000,
    gcTime: 1 * 10000,
  });
}
