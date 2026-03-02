import { initServicesContainer } from '@leather.io/services';

import {
  BITFLOW_API_HOST,
  BITFLOW_API_KEY,
  BITFLOW_KEEPER_API_HOST,
  BITFLOW_KEEPER_API_KEY,
  BITFLOW_PROVIDER_ADDRESS,
  BITFLOW_READONLY_CALL_API_HOST,
  BITFLOW_READONLY_CALL_API_KEY,
  WALLET_ENVIRONMENT,
} from '@shared/environment';

import { ExtensionHttpCacheService } from './extension-http-cache.service';
import { ExtensionSettingsService } from './extension-settings.service';

export function initAppServices() {
  initServicesContainer({
    env: {
      environment: WALLET_ENVIRONMENT,
      bitflow: {
        bitflowApiHost: BITFLOW_API_HOST,
        bitflowApiKey: BITFLOW_API_KEY,
        bitflowProviderAddress: BITFLOW_PROVIDER_ADDRESS,
        readonlyCallApiHost: BITFLOW_READONLY_CALL_API_HOST,
        readonlyCallApiKey: BITFLOW_READONLY_CALL_API_KEY,
        keeperApiKey: BITFLOW_KEEPER_API_KEY,
        keeperApiHost: BITFLOW_KEEPER_API_HOST,
      },
    },
    cacheService: ExtensionHttpCacheService,
    settingsService: ExtensionSettingsService,
  });
}
