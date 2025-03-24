import { isDefined } from '@leather.io/utils';

export function isLeatherInstalled() {
  return isDefined(window.LeatherProvider);
}

export type ExtensionState = 'missing' | 'detected' | 'connected';
