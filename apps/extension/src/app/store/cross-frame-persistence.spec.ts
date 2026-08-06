import {
  type Action,
  type Middleware,
  Tuple,
  combineReducers,
  configureStore,
  isAction,
} from '@reduxjs/toolkit';
import { base64urlnopad } from '@scure/base';
import { ChainId } from '@stacks/network';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  type PersistConfig,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import { isPlainObject } from 'remeda';
import { describe, expect, test } from 'vitest';

import { keychainSlice } from '@leather.io/state/keychains';
import { userAddsWallet, walletSlice } from '@leather.io/state/wallet';

import type { PlatformUnlockConfig } from '@shared/crypto/platform-unlock';
import { createDirtySliceTracker } from '@shared/storage/dirty-slice-tracker';
import { createMergePersistStorage } from '@shared/storage/merge-persist-storage';
import { persistWhitelist } from '@shared/storage/persist-whitelist';
import { clearChromeStorage } from '@shared/storage/redux-persist';

import { accountsSlice } from './accounts/accounts.slice';
import { activeSlice, walletKeyGenerated } from './active/active.slice';
import { stxChainSlice } from './chains/stx-chain.slice';
import { manageTokensSlice } from './manage-tokens/manage-tokens.slice';
import { type PersistedNetworkConfiguration, networksSlice } from './networks/networks.slice';
import { settingsSlice } from './settings/settings.slice';
import { readAuthoritativeWalletTransactionState } from './software-keys/software-key-state';
import {
  type SoftwareKeyConfig,
  type WalletAuthenticationMode,
  keySlice,
} from './software-keys/software-key.slice';
import { hydrateSlicesFromStorage, initCrossFrameStorageSync } from './utils/storage-sync';
import { createTrackDirtySlicesMiddleware } from './utils/track-dirty-slices';

const persistRootKey = 'persist:root';

const frameReducer = combineReducers({
  accounts: accountsSlice.reducer,
  active: activeSlice.reducer,
  chains: combineReducers({ stx: stxChainSlice.reducer }),
  keychains: keychainSlice.reducer,
  networks: networksSlice.reducer,
  settings: settingsSlice.reducer,
  manageTokens: manageTokensSlice.reducer,
  softwareKeys: keySlice.reducer,
  wallets: walletSlice.reducer,
});

type FrameState = ReturnType<typeof frameReducer>;

function frameRootReducer(state: FrameState | undefined, action: Action) {
  if (hydrateSlicesFromStorage.match(action) && state) return { ...state, ...action.payload };
  return frameReducer(state, action);
}

const frameInitialState = frameReducer(undefined, { type: 'test/initialStateProbe' });

interface CreateFrameArgs {
  withSync?: boolean;
}

// Each frame mirrors how a real extension context assembles its store: its own
// dirty tracker, merging storage driver, redux-persist instance and sync
// listener, all sharing the one chrome.storage.local mock
function createFrame({ withSync = true }: CreateFrameArgs = {}) {
  const tracker = createDirtySliceTracker();
  const dispatchedActionTypes: string[] = [];

  function recordActionTypes(): ReturnType<Middleware> {
    return next => action => {
      if (isAction(action)) dispatchedActionTypes.push(action.type);
      return next(action);
    };
  }

  const persistConfig: PersistConfig<FrameState> & { deserialize?: boolean } = {
    key: 'root',
    stateReconciler: autoMergeLevel2,
    version: 4,
    storage: createMergePersistStorage(tracker),
    serialize: false,
    deserialize: false,
    whitelist: [...persistWhitelist],
  };

  const store = configureStore({
    reducer: persistReducer(persistConfig, frameRootReducer),
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }).concat(new Tuple(createTrackDirtySlicesMiddleware(tracker), recordActionTypes)),
  });

  const persistor = persistStore(store);
  if (withSync) initCrossFrameStorageSync(store, tracker, frameInitialState);

  async function waitForRehydration() {
    if (store.getState()._persist.rehydrated) return;
    await new Promise<void>(resolve => {
      const unsubscribe = store.subscribe(() => {
        if (!store.getState()._persist.rehydrated) return;
        unsubscribe();
        resolve();
      });
    });
  }

  async function settle() {
    await persistor.flush();
    await new Promise(resolve => setTimeout(resolve, 0));
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  return { store, persistor, tracker, dispatchedActionTypes, waitForRehydration, settle };
}

type Frame = ReturnType<typeof createFrame>;

async function bootFrame(args: CreateFrameArgs = {}): Promise<Frame> {
  const frame = createFrame(args);
  await frame.waitForRehydration();
  await frame.settle();
  return frame;
}

const devnetNetwork: PersistedNetworkConfiguration = {
  id: 'devnet',
  name: 'Devnet',
  chainId: ChainId.Testnet,
  url: 'http://localhost:3999',
  bitcoinNetwork: 'regtest',
  mode: 'testnet',
  bitcoinUrl: 'http://localhost:8999/api',
};

async function readStoredRoot() {
  const stored = await chrome.storage.local.get(persistRootKey);
  const root = stored[persistRootKey];
  if (!isPlainObject(root)) throw new Error('persist:root is not an object');
  return root;
}

interface PersistWalletArgs {
  authenticationMode: WalletAuthenticationMode;
  encryptedSecretKey: string;
  fingerprint: string;
  platformUnlock?: PlatformUnlockConfig;
  salt?: string;
}

function createSoftwareKeyAction(
  authoritative: Awaited<ReturnType<typeof readAuthoritativeWalletTransactionState>>,
  { authenticationMode, encryptedSecretKey, fingerprint, platformUnlock, salt }: PersistWalletArgs
) {
  const key: SoftwareKeyConfig = { type: 'software', id: fingerprint, encryptedSecretKey };
  if (authoritative.softwareKeys.keys.length > 0) return keySlice.actions.addNewWallet(key);
  if (authenticationMode === 'biometric-only') {
    if (!platformUnlock) throw new Error('Biometric test setup requires platform unlock state');
    return keySlice.actions.createBiometricSoftwareWalletComplete({ key, platformUnlock });
  }
  if (!salt) throw new Error('Password test setup requires a salt');
  return keySlice.actions.createSoftwareWalletComplete({ key, salt });
}

async function persistWalletFromAuthoritativeState(frame: Frame, args: PersistWalletArgs) {
  const authoritative = await readAuthoritativeWalletTransactionState();
  frame.store.dispatch(hydrateSlicesFromStorage(authoritative.state));
  frame.store.dispatch(
    userAddsWallet({
      wallet: {
        createdOn: '2026-08-06T00:00:00.000Z',
        fingerprint: args.fingerprint,
        type: 'software',
      },
      accountKeychains: [],
    })
  );
  frame.store.dispatch(createSoftwareKeyAction(authoritative, args));
  frame.store.dispatch(walletKeyGenerated(args.fingerprint));
  await frame.settle();
}

describe('cross-frame persistence', () => {
  test('a stale frame writing another slice does not clobber a newly added network', async () => {
    const frameA = await bootFrame();
    const staleFrame = await bootFrame({ withSync: false });

    frameA.store.dispatch(networksSlice.actions.addNetwork(devnetNetwork));
    await frameA.settle();

    staleFrame.store.dispatch(settingsSlice.actions.setUserSelectedTheme('dark'));
    await staleFrame.settle();

    const root = await readStoredRoot();
    expect(root.networks).toMatchObject({ entities: { devnet: devnetNetwork } });
    expect(root.settings).toMatchObject({ userSelectedTheme: 'dark' });
  });

  test('other frames adopt a persisted network via storage sync', async () => {
    const frameA = await bootFrame();
    const frameB = await bootFrame();

    frameA.store.dispatch(networksSlice.actions.addNetwork(devnetNetwork));
    await frameA.settle();
    await frameB.settle();

    expect(frameB.store.getState().networks.entities.devnet).toEqual(devnetNetwork);
  });

  test('two live frames converge on a biometric-only to password transition', async () => {
    const frameA = await bootFrame();
    const frameB = await bootFrame();
    const key: SoftwareKeyConfig = {
      type: 'software',
      id: 'wallet',
      encryptedSecretKey: 'biometric-key',
    };
    const platformUnlock: PlatformUnlockConfig = {
      credentialId: base64urlnopad.encode(new Uint8Array([1, 2, 3])),
      iv: base64urlnopad.encode(new Uint8Array(12).fill(4)),
      prfInput: base64urlnopad.encode(new Uint8Array(32).fill(5)),
      registrationTag: 'ABC234',
      version: 1,
      wrappedEncryptionKey: base64urlnopad.encode(new Uint8Array(112).fill(6)),
    };

    frameA.store.dispatch(
      keySlice.actions.createBiometricSoftwareWalletComplete({ key, platformUnlock })
    );
    await frameA.settle();
    await frameB.settle();

    expect(frameB.store.getState().softwareKeys.authenticationMode).toBe('biometric-only');

    frameA.store.dispatch(
      keySlice.actions.biometricOnlyToPasswordTransitionComplete({
        keys: [{ ...key, encryptedSecretKey: 'password-key' }],
        platformUnlock: {
          ...platformUnlock,
          iv: base64urlnopad.encode(new Uint8Array(12).fill(9)),
        },
        salt: 'password-salt',
      })
    );
    await frameA.settle();
    await frameB.settle();

    expect(frameB.store.getState().softwareKeys).toMatchObject({
      authenticationMode: 'password',
      entities: { wallet: { encryptedSecretKey: 'password-key' } },
      salt: 'password-salt',
    });
  });

  test('a delayed password frame preserves every coupled slice from the first wallet write', async () => {
    const frameA = await bootFrame();
    const delayedFrame = await bootFrame({ withSync: false });

    await persistWalletFromAuthoritativeState(frameA, {
      authenticationMode: 'password',
      encryptedSecretKey: 'wallet-a-ciphertext',
      fingerprint: 'wallet-a',
      salt: 'password-salt',
    });
    await persistWalletFromAuthoritativeState(delayedFrame, {
      authenticationMode: 'password',
      encryptedSecretKey: 'wallet-b-ciphertext',
      fingerprint: 'wallet-b',
      salt: 'password-salt',
    });

    const root = await readStoredRoot();
    expect(root).toMatchObject({
      accounts: { ids: ['wallet-a/0', 'wallet-b/0'] },
      active: { account: { accountIndex: 0, fingerprint: 'wallet-b' } },
      chains: { stx: { 'wallet-a': {}, 'wallet-b': {} } },
      keychains: { ids: [] },
      softwareKeys: { ids: ['wallet-a', 'wallet-b'], authenticationMode: 'password' },
      wallets: { ids: ['wallet-a', 'wallet-b'] },
    });
  });

  test('a delayed biometric frame preserves every coupled slice from the first wallet write', async () => {
    const frameA = await bootFrame();
    const delayedFrame = await bootFrame({ withSync: false });
    const platformUnlock: PlatformUnlockConfig = {
      credentialId: base64urlnopad.encode(new Uint8Array([7, 8, 9])),
      iv: base64urlnopad.encode(new Uint8Array(12).fill(10)),
      prfInput: base64urlnopad.encode(new Uint8Array(32).fill(11)),
      registrationTag: 'DEF567',
      version: 1,
      wrappedEncryptionKey: base64urlnopad.encode(new Uint8Array(112).fill(12)),
    };

    await persistWalletFromAuthoritativeState(frameA, {
      authenticationMode: 'biometric-only',
      encryptedSecretKey: 'wallet-a-ciphertext',
      fingerprint: 'wallet-a',
      platformUnlock,
    });
    await persistWalletFromAuthoritativeState(delayedFrame, {
      authenticationMode: 'biometric-only',
      encryptedSecretKey: 'wallet-b-ciphertext',
      fingerprint: 'wallet-b',
      platformUnlock,
    });

    const root = await readStoredRoot();
    expect(root).toMatchObject({
      accounts: { ids: ['wallet-a/0', 'wallet-b/0'] },
      active: { account: { accountIndex: 0, fingerprint: 'wallet-b' } },
      chains: { stx: { 'wallet-a': {}, 'wallet-b': {} } },
      keychains: { ids: [] },
      softwareKeys: { ids: ['wallet-a', 'wallet-b'], authenticationMode: 'biometric-only' },
      wallets: { ids: ['wallet-a', 'wallet-b'] },
    });
  });

  test('a frame never hydrates from its own writes', async () => {
    const frameA = await bootFrame();
    const frameB = await bootFrame();

    frameA.store.dispatch(networksSlice.actions.addNetwork(devnetNetwork));
    await frameA.settle();
    await frameB.settle();

    expect(frameA.dispatchedActionTypes).not.toContain(hydrateSlicesFromStorage.type);
    expect(
      frameB.dispatchedActionTypes.filter(type => type === hydrateSlicesFromStorage.type)
    ).toHaveLength(1);
  });

  test('an un-flushed local edit survives an incoming sync and both changes persist', async () => {
    const frameA = await bootFrame();
    const frameB = await bootFrame();

    frameB.store.dispatch(
      manageTokensSlice.actions.userTogglesTokenVisibility({ id: 'token-x', enabled: false })
    );
    frameA.store.dispatch(networksSlice.actions.addNetwork(devnetNetwork));
    await frameA.settle();
    await frameB.settle();

    const frameBState = frameB.store.getState();
    expect(frameBState.networks.entities.devnet).toEqual(devnetNetwork);
    expect(frameBState.manageTokens.entities['token-x']).toEqual({
      id: 'token-x',
      enabled: false,
    });

    const root = await readStoredRoot();
    expect(root.networks).toMatchObject({ entities: { devnet: devnetNetwork } });
    expect(root.manageTokens).toMatchObject({
      entities: { 'token-x': { id: 'token-x', enabled: false } },
    });
  });

  test('a live frame leaves an externally seeded older-version root for migrations', async () => {
    const frame = await bootFrame();

    await chrome.storage.local.set({
      [persistRootKey]: {
        networks: {
          ids: ['devnet'],
          entities: { devnet: devnetNetwork },
          currentNetworkId: 'mainnet',
        },
        _persist: { version: 2, rehydrated: true },
      },
    });
    await frame.settle();

    expect(frame.dispatchedActionTypes).not.toContain(hydrateSlicesFromStorage.type);

    const root = await readStoredRoot();
    expect(root._persist).toMatchObject({ version: 2 });
    expect(root.networks).toMatchObject({ ids: ['devnet'] });
  });

  test('flush resolves with pending changes committed to storage', async () => {
    const frame = await bootFrame();

    frame.store.dispatch(networksSlice.actions.addNetwork(devnetNetwork));
    await frame.persistor.flush();

    const root = await readStoredRoot();
    expect(root.networks).toMatchObject({ entities: { devnet: devnetNetwork } });
  });

  test('a surviving frame cannot restore wallet storage cleared by sign-out', async () => {
    const frameA = await bootFrame();
    frameA.store.dispatch(networksSlice.actions.addNetwork(devnetNetwork));
    await frameA.settle();

    const staleFrame = await bootFrame({ withSync: false });
    staleFrame.store.dispatch(settingsSlice.actions.setUserSelectedTheme('dark'));
    await clearChromeStorage();
    await staleFrame.settle();

    const root = await readStoredRoot();
    expect(root.networks).toBeUndefined();
    expect(root.settings).toMatchObject({ userSelectedTheme: 'dark' });

    staleFrame.store.dispatch(
      manageTokensSlice.actions.userTogglesTokenVisibility({ id: 'token-x', enabled: false })
    );
    await staleFrame.settle();

    const rootAfterMergeWrite = await readStoredRoot();
    expect(rootAfterMergeWrite.networks).toBeUndefined();
    expect(rootAfterMergeWrite.manageTokens).toMatchObject({
      entities: { 'token-x': { id: 'token-x', enabled: false } },
    });
  });

  test('boot reconcile keeps defaults absent from a stored slice', async () => {
    await chrome.storage.local.set({
      [persistRootKey]: {
        settings: {
          userSelectedTheme: 'dark',
          dismissedMessages: [],
          dismissedPromoIndexes: [],
          seenFeatureIntros: [],
          discardedInscriptions: [],
        },
        _persist: { version: 4, rehydrated: true },
      },
    });

    const frame = await bootFrame();

    const { settings } = frame.store.getState();
    expect(settings.userSelectedTheme).toBe('dark');
    expect(settings.isNotificationsEnabled).toBe(true);
  });

  test('a peer write lacking a default keeps that default in live frames', async () => {
    const frameA = await bootFrame();
    const frameB = await bootFrame();

    const root = await readStoredRoot();
    await chrome.storage.local.set({
      [persistRootKey]: {
        ...root,
        settings: {
          userSelectedTheme: 'light',
          dismissedMessages: [],
          dismissedPromoIndexes: [],
          seenFeatureIntros: [],
          discardedInscriptions: [],
        },
      },
    });
    await frameA.settle();
    await frameB.settle();

    for (const frame of [frameA, frameB]) {
      const { settings } = frame.store.getState();
      expect(settings.userSelectedTheme).toBe('light');
      expect(settings.isNotificationsEnabled).toBe(true);
    }
  });

  test('a frame that never observed a stored root still persists wholesale', async () => {
    const frame = await bootFrame();

    frame.store.dispatch(networksSlice.actions.addNetwork(devnetNetwork));
    await frame.settle();

    const root = await readStoredRoot();
    expect(root.networks).toMatchObject({ entities: { devnet: devnetNetwork } });
    expect(root.settings).toBeDefined();
    expect(root.manageTokens).toBeDefined();
  });
});
