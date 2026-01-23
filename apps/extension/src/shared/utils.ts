import type { AccountId } from '@leather.io/models';
import { getPrincipalFromAssetString } from '@leather.io/stacks';
import { delay } from '@leather.io/utils';

import { logger } from './logger';

export const assumedZeroFingerprint = '00000000';

export function closeWindow() {
  // We prevent `window.close()` directly as to allow for debugging helper
  if (process.env.DEBUG_PREVENT_WINDOW_CLOSE === 'true') {
    logger.warn('Prevented window close with flag DEBUG_PREVENT_WINDOW_CLOSE');
    return;
  }
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

export function isMatchingAccountId(...args: AccountId[]) {
  const [first, ...rest] = args;
  return rest.every(
    account =>
      account.fingerprint === first.fingerprint && account.accountIndex === first.accountIndex
  );
}
