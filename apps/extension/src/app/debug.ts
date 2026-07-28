import * as reduxPersist from 'redux-persist';

import { HIRO_API_BASE_URL_MAINNET } from '@leather.io/models';
import { getHiroApiRateLimiter } from '@leather.io/query';

import { logger } from '@shared/logger';
import { getLogsFromBrowserStorage } from '@shared/logger-storage';
import { persistConfig } from '@shared/storage/redux-persist';

import { queryClient } from './common/persistence';
import { store } from './store';
import { selectActiveAccount } from './store/active/active.selectors';
import { stxChainSlice } from './store/chains/stx-chain.slice';
import { settingsSlice } from './store/settings/settings.slice';

const debug = {
  printDiagnosticInfo() {
    // eslint-disable-next-line no-console
    void getLogsFromBrowserStorage().then(logs => console.log(JSON.stringify(logs)));
  },
  logStore() {
    return store.getState();
  },
  logHiroLimiter(url = HIRO_API_BASE_URL_MAINNET) {
    const limiter = getHiroApiRateLimiter(url);

    return {
      size: limiter.size,
      pending: limiter.pending,
      limiter,
    };
  },
  getPersistedStore() {
    return reduxPersist.getStoredState(persistConfig);
  },
  logPersistedStore() {
    // eslint-disable-next-line no-console
    void reduxPersist.getStoredState(persistConfig).then(state => console.log(state));
  },
  setHighestAccountIndex(accountIndex: number) {
    const activeAccount = selectActiveAccount(store.getState());
    if (!activeAccount) {
      logger.warn('Cannot set highest account index: no active wallet');
      return;
    }
    logger.info(`Highest account index set to ${accountIndex}`);
    store.dispatch(
      stxChainSlice.actions.setHighestAccountIndex({
        fingerprint: activeAccount.fingerprint,
        accountIndex,
      })
    );
  },
  resetMessages() {
    store.dispatch(settingsSlice.actions.resetMessages());
  },
  resetPromoBanner() {
    store.dispatch(settingsSlice.actions.resetPromoBanner());
  },
  resetFeatureIntros() {
    store.dispatch(settingsSlice.actions.resetFeatureIntros());
  },
  clearReactQueryCache() {
    queryClient.clear();
  },
  clearChromeStorage() {
    void chrome.storage.local.clear();
    void chrome.storage.session.clear();
  },
};

declare global {
  interface Window {
    debug: typeof debug;
  }
}
export function setDebugOnGlobal() {
  window.debug = debug;
}
