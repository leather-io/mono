import { WALLET_ENVIRONMENT } from '@/shared/environment';

import { initServicesContainer } from '@leather.io/services';

import { MobileHttpCacheService } from './mobile-http-cache.service';
import { MobileSettingsService } from './mobile-settings.service';

export function initAppServices() {
  initServicesContainer({
    walletEnvironment: WALLET_ENVIRONMENT,
    cacheService: MobileHttpCacheService,
    settingsService: MobileSettingsService,
  });
}
