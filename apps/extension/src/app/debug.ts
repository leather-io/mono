import * as reduxPersist from 'redux-persist';

import { HIRO_API_BASE_URL_MAINNET } from '@leather.io/models';
import { getHiroApiRateLimiter } from '@leather.io/query';

import { IS_TEST_ENV } from '@shared/environment';
import { logger } from '@shared/logger';
import { getLogsFromBrowserStorage } from '@shared/logger-storage';
import { backgroundErrorsStorageKey } from '@shared/storage/background-errors';
import { persistConfig } from '@shared/storage/redux-persist';

import { queryClient } from './common/persistence';
import { store } from './store';
import { selectActiveAccount } from './store/active/active.selectors';
import { stxChainSlice } from './store/chains/stx-chain.slice';
import { settingsSlice } from './store/settings/settings.slice';

const baseDebug = {
  async printDiagnosticInfo() {
    const logs = await getLogsFromBrowserStorage();
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(logs));
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
  async logPersistedStore() {
    const state = await reduxPersist.getStoredState(persistConfig);
    // eslint-disable-next-line no-console
    console.log(state);
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

const testEnvironmentDebug = {
  getRouterLocation() {
    return window.location.hash;
  },
  getQueryCacheSummary() {
    return queryClient
      .getQueryCache()
      .getAll()
      .map(query => ({
        queryKey: query.queryKey,
        status: query.state.status,
        fetchStatus: query.state.fetchStatus,
        dataUpdatedAt: query.state.dataUpdatedAt,
      }));
  },
  async getBackgroundErrors() {
    const stored = await chrome.storage.session.get([backgroundErrorsStorageKey]);
    const errors: unknown = stored[backgroundErrorsStorageKey];
    return errors;
  },
};

const debug = { ...baseDebug, ...(IS_TEST_ENV ? testEnvironmentDebug : {}) };

declare global {
  interface Window {
    debug: typeof debug;
  }
}
export function setDebugOnGlobal() {
  window.debug = debug;
}
