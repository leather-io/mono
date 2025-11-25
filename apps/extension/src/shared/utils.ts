import { getPrincipalFromAssetString } from '@leather.io/stacks';
import { delay } from '@leather.io/utils';

import { logger } from './logger';

export const defaultWalletKeyId = 'default';

export function closeWindow() {
  const isAutomationEnv = typeof navigator !== 'undefined' && navigator.webdriver;
  const preventCloseWithFlag = process.env.DEBUG_PREVENT_WINDOW_CLOSE === 'true';
  if (preventCloseWithFlag || isAutomationEnv) {
    logger.warn(
      preventCloseWithFlag
        ? 'Prevented window close with flag DEBUG_PREVENT_WINDOW_CLOSE'
        : 'Prevented window close while running in an automated browser'
    );
    return;
  }
  // We prevent `window.close()` directly as to allow for debugging helper
  // eslint-disable-next-line no-restricted-properties
  window.close();
}

export function createDelay(ms: number) {
  return async () => delay(ms);
}

// TODO: Relocate to mono repo, we have this in services but not stacks pkg
// See in services, getAddressFromAssetIdentifier
export function getAddressFromAssetString(assetString: string) {
  const principal = getPrincipalFromAssetString(assetString);
  return principal.split('.')[0];
}

type Ok<T> = readonly [value: T, error: null];
type Err = readonly [value: null, error: unknown];

export function safeCall<T>(fn: () => T): Ok<T> | Err {
  try {
    return [fn(), null] as const;
  } catch (e) {
    return [null, e] as const;
  }
}
