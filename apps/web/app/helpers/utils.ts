import { isBrowser } from '@leather.io/sdk';
import { isDefined } from '@leather.io/utils';

const basename = '/';

export function getUiPackageAssetUrl(path: string) {
  if (import.meta.env.MODE === 'development') {
    return basename + 'node_modules/@leather.io/ui/dist-web/assets/' + path;
  }
  return basename + 'assets/' + path;
}

export function isLeatherInstalled() {
  return isBrowser() && isDefined(window.LeatherProvider);
}

export type ExtensionState = 'missing' | 'detected' | 'connected';
