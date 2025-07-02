import { MobileAnalyticsService } from '@/utils/analytics';

import { initServicesContainer } from '@leather.io/services';

import { MobileHttpCacheService } from './mobile-http-cache.service';
import { MobileSettingsService } from './mobile-settings.service';

export function initAppServices() {
  initServicesContainer({
    env: {
      environment: process.env.EXPO_PUBLIC_NODE_ENV ?? 'development',
      leatherApiUrl: process.env.EXPO_PUBLIC_LEATHER_API_URL,
    },
    cacheService: MobileHttpCacheService,
    settingsService: MobileSettingsService,
    analyticsService: MobileAnalyticsService,
  });
}
