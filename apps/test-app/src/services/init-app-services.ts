import { initializeServiceContainers } from '@leather.io/services';

import { createMobileHttpCacheService } from './mobile-http-cache.service';
import { createMobileSettingsService } from './mobile-settings.service';

export function initAppServices() {
  initializeServiceContainers(createMobileSettingsService(), createMobileHttpCacheService());
}
