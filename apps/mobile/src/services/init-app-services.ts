import { initializeServiceContainers } from '@leather.io/services';

import { createMobileHttpCacheService } from './mobile-http-cache.service';
import { createMobileNetworkSettingsService } from './mobile-network-settings.service';

export function initAppServices() {
  initializeServiceContainers(createMobileNetworkSettingsService(), createMobileHttpCacheService());
}
