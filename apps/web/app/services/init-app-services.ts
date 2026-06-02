import { LEATHER_API_URL, MODE } from '~/constants/environment';

import { initServicesContainer } from '@leather.io/services';

import { WebAuthSessionService } from './web-auth-session.service';
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
    authSessionService: WebAuthSessionService,
  });
}
