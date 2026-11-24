import { getDefaultStore } from 'jotai';
import { leather } from '~/utils/leather-sdk';

import { isBrowser } from '@leather.io/sdk';

import { createGatedLeatherClient } from './create-gated-leather-client';
import { outdatedExtensionVersionAtom } from './outdated-extension.atom';

function getInjectedProvider(): unknown {
  return isBrowser() ? window.LeatherProvider : undefined;
}

export const multisigLeather = createGatedLeatherClient(leather, {
  getProvider: getInjectedProvider,
  onOutdated(installedVersion) {
    getDefaultStore().set(outdatedExtensionVersionAtom, installedVersion);
  },
  onUpToDate() {
    getDefaultStore().set(outdatedExtensionVersionAtom, null);
  },
});
