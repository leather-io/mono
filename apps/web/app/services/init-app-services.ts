import { LEATHER_API_URL, MODE } from '~/constants/environment';
import { WebAnalyticsService } from '~/features/analytics/analytics';

import { initServicesContainer } from '@leather.io/services';

import { WebHttpCacheService } from './web-http-cache.service';
import { WebSettingsService } from './web-settings.service';

export function initAppServices() {
  initServicesContainer({
    env: {
      environment: MODE ?? 'development',
      leatherApiUrl: LEATHER_API_URL,
    },

    cacheService: WebHttpCacheService,
    settingsService: WebSettingsService,
    analyticsService: WebAnalyticsService,
  });
}
