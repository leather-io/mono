import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { initServicesContainer } from '@leather.io/services';

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
        readonlyCallApiHost: process.env.EXPO_PUBLIC_BITFLOW_READONLY_CALL_API_HOST ?? '',
        readonlyCallApiKey: process.env.EXPO_PUBLIC_BITFLOW_READONLY_CALL_API_KEY ?? '',
        keeperApiHost: process.env.EXPO_PUBLIC_BITFLOW_KEEPER_API_HOST ?? '',
        keeperApiKey: process.env.EXPO_PUBLIC_BITFLOW_KEEPER_API_KEY ?? '',
      },
    },
    cacheService: MobileHttpCacheService,
    settingsService: MobileSettingsService,
  });

  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    scopes: ['https://www.googleapis.com/auth/drive.appdata'],
    offlineAccess: true,
    forceCodeForRefreshToken: true,
  });
}
