import { getAppEnvironment, getBitflowEnv, getLeatherApiUrl } from '@/shared/environment';

import { initServicesContainer } from '@leather.io/services';

import { MobileHttpCacheService } from './mobile-http-cache.service';
import { MobileSettingsService } from './mobile-settings.service';

export function initAppServices() {
  initServicesContainer({
    env: {
      environment: getAppEnvironment(),
      leatherApiUrl: getLeatherApiUrl(),
      bitflow: getBitflowEnv(),
    },
    cacheService: MobileHttpCacheService,
    settingsService: MobileSettingsService,
  });
}
