import { initServicesContainer } from '@leather.io/services';

import { MobileHttpCacheService } from './mobile-http-cache.service';
import { MobileSettingsService } from './mobile-settings.service';

export function initAppServices() {
  initServicesContainer({
    cacheService: MobileHttpCacheService,
    settingsService: MobileSettingsService,
  });
}
