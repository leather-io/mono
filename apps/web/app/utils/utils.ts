import { isBrowser } from '@leather.io/sdk';
import { isDefined } from '@leather.io/utils';

declare global {
  interface Window {
    XverseProviders?: object;
    btc_providers?: object[];
    wbip_providers?: object[];
  }
}

export function isLeatherInstalled() {
  return isBrowser() && isDefined(window.LeatherProvider);
}

export function isAnyWalletInstalled() {
  if (!isBrowser()) return false;
  return (
    isLeatherInstalled() ||
    isDefined(window.XverseProviders) ||
    (window.btc_providers ?? []).length > 0 ||
    (window.wbip_providers ?? []).length > 0 ||
    (window.webbtc_stx_providers ?? []).length > 0
  );
}

export type ExtensionState = 'missing' | 'detected' | 'connected';

export function whenExtensionState(state: ExtensionState) {
  return <T>(cases: { missing: T; detected: T; connected: T }): T => cases[state];
}
