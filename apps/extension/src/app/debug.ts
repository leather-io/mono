import * as reduxPersist from 'redux-persist';

import { HIRO_API_BASE_URL_MAINNET } from '@leather.io/models';
import { getHiroApiRateLimiter } from '@leather.io/query';

import { WALLET_ENVIRONMENT } from '@shared/environment';
import { logger } from '@shared/logger';
import { getLogsFromBrowserStorage } from '@shared/logger-storage';
import { persistConfig } from '@shared/storage/redux-persist';

import leatherDev2LedgerStacksOnlyStore from '../shared/multi-wallet/leather-dev-2-ledger-stacks-only.json';
import leatherDev2LedgerStore from '../shared/multi-wallet/leather-dev-2-ledger.json';
import leatherDev2SoftwareStore from '../shared/multi-wallet/leather-dev-2-software.json';
import { queryClient } from './common/persistence';
import { store } from './store';
import { stxChainSlice } from './store/chains/stx-chain.slice';
import { settingsSlice } from './store/settings/settings.slice';
import { submittedTransactionsActions } from './store/submitted-transactions/submitted-transactions.actions';

const nonProductionMethods = {
  async setLeatherDevWalletLedger() {
    await chrome.storage.session.clear();
    await chrome.storage.local.set({ 'persist:root': leatherDev2LedgerStore });
    window.location.href = '/index.html';
  },
  async setLeatherDevWalletLedgerStacksOnly() {
    await chrome.storage.session.clear();
    await chrome.storage.local.set({ 'persist:root': leatherDev2LedgerStacksOnlyStore });
    window.location.href = '/index.html';
  },
  async setLeatherDevWalletSoftware() {
    await chrome.storage.session.set({
      encryptionKey: process.env.DEBUG_DEV_WALLET_ENCRYPTION_KEY,
    });

    await chrome.storage.local.set({ 'persist:root': leatherDev2SoftwareStore });
    window.location.href = '/index.html';
  },
};

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
  setHighestAccountIndex(fingerprint: string, accountIndex: number) {
    logger.info(`Highest account index set to ${accountIndex}`);
    store.dispatch(stxChainSlice.actions.restoreAccountIndex({ fingerprint, accountIndex }));
  },
  resetMessages() {
    store.dispatch(settingsSlice.actions.resetMessages());
  },
  resetPromoBanner() {
    store.dispatch(settingsSlice.actions.resetPromoBanner());
  },
  clearSubmittedTransactions() {
    store.dispatch(submittedTransactionsActions.clearSubmittedTransactions());
  },
  clearReactQueryCache() {
    queryClient.clear();
  },
  clearChromeStorage() {
    void chrome.storage.local.clear();
    void chrome.storage.session.clear();
  },
  bypassInscriptionChecks() {
    store.dispatch(settingsSlice.actions.dangerouslyChosenToBypassAllInscriptionChecks());
  },
  discardInscription(id: string) {
    store.dispatch(settingsSlice.actions.discardInscription(id));
  },
  resetInscriptionState() {
    store.dispatch(settingsSlice.actions.resetInscriptionState());
  },
  ...(WALLET_ENVIRONMENT !== 'production' ? nonProductionMethods : {}),
};

declare global {
  interface Window {
    debug: typeof debug;
  }
}
export function setDebugOnGlobal() {
  window.debug = debug;
}
