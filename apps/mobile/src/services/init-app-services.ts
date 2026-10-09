import { defaultVisibleSip10AssetIds } from '@/shared/default-visible-sip10-assets';

import { initServicesContainer } from '@leather.io/services';
import { serializeAssetId } from '@leather.io/utils';

import { MobileHttpCacheService } from './mobile-http-cache.service';
import { MobileSettingsService } from './mobile-settings.service';

export function initAppServices() {
  initServicesContainer({
    env: {
      environment: process.env.EXPO_PUBLIC_NODE_ENV ?? 'development',
      leatherApiUrl: process.env.EXPO_PUBLIC_LEATHER_API_URL,
      bitflow: {
        bitflowApiHost: process.env.EXPO_PUBLIC_BITFLOW_API_HOST ?? '',
        bitflowApiKey: process.env.EXPO_PUBLIC_BITFLOW_API_KEY ?? '',
        bitflowProviderAddress: process.env.EXPO_PUBLIC_BITFLOW_PROVIDER_ADDRESS ?? '',
        keeperApiHost: process.env.EXPO_PUBLIC_BITFLOW_KEEPER_API_HOST ?? '',
        keeperApiKey: process.env.EXPO_PUBLIC_BITFLOW_KEEPER_API_KEY ?? '',
      },
    },
    cacheService: MobileHttpCacheService,
    settingsService: MobileSettingsService,
    defaultAssetVisibility: {
      type: 'allowlist',
      assets: defaultVisibleSip10AssetIds.map(id => serializeAssetId({ protocol: 'sip10', id })),
    },
  });
}
