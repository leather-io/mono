import { BitflowSDK } from '@bitflowlabs/core-sdk';

import { bitflowReadonlyCallApiHost } from '@leather.io/constants';

import {
  BITFLOW_API_HOST,
  BITFLOW_API_KEY,
  BITFLOW_KEEPER_API_HOST,
  BITFLOW_KEEPER_API_KEY,
  BITFLOW_PROVIDER_ADDRESS,
} from '@shared/environment';
import { logger } from '@shared/logger';

export const bitflow: BitflowSDK = (() => {
  try {
    return new BitflowSDK({
      BITFLOW_API_HOST: BITFLOW_API_HOST,
      BITFLOW_API_KEY: BITFLOW_API_KEY,
      READONLY_CALL_API_HOST: bitflowReadonlyCallApiHost,
      KEEPER_API_KEY: BITFLOW_KEEPER_API_KEY,
      KEEPER_API_HOST: BITFLOW_KEEPER_API_HOST,
      BITFLOW_PROVIDER_ADDRESS: BITFLOW_PROVIDER_ADDRESS,
    });
  } catch {
    logger.error('Bitflow SDK initialization failed');
    // return fallback dummy object
    return {} as BitflowSDK;
  }
})();
