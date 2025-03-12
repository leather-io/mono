import { isDefined } from '@leather.io/utils';

export function getUiPackageAssetUrl(path: string) {
  if (import.meta.env.MODE === 'development') {
    return 'node_modules/@leather.io/ui/dist-web/assets/' + path;
  }
  return 'assets/' + path;
}

export function isLeatherInstalled() {
  return isDefined(window.LeatherProvider);
}

export type ExtensionState = 'missing' | 'detected' | 'connected';
