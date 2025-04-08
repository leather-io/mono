import { isBrowser } from '@leather.io/sdk';
import { isDefined } from '@leather.io/utils';

export function isLeatherInstalled() {
  return isBrowser() && isDefined(window.LeatherProvider);
}

export type ExtensionState = 'missing' | 'detected' | 'connected';

export function whenExtensionState(state: ExtensionState) {
  return <T>(cases: { missing: T; detected: T; connected: T }): T => cases[state];
}
