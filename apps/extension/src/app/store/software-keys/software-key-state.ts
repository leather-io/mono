import { keys as getKeys, isPlainObject } from 'remeda';

import { keychainSlice } from '@leather.io/state/keychains';
import { walletSlice } from '@leather.io/state/wallet';

import { type PlatformUnlockConfig, isPlatformUnlockConfig } from '@shared/crypto/platform-unlock';

import { accountsSlice } from '../accounts/accounts.slice';
import { activeSlice } from '../active/active.slice';
import { stxChainSlice } from '../chains/stx-chain.slice';
import {
  type SoftwareKeyConfig,
  type WalletAuthenticationMode,
  keyAdapter,
  keySlice,
} from './software-key.slice';

export interface SoftwareKeyStateSnapshot {
  authenticationMode?: WalletAuthenticationMode;
  keys: SoftwareKeyConfig[];
  platformUnlock?: PlatformUnlockConfig;
  salt?: string;
}

export interface WalletTransactionState {
  accounts: ReturnType<typeof accountsSlice.reducer>;
  active: ReturnType<typeof activeSlice.reducer>;
  chains: { stx: ReturnType<typeof stxChainSlice.reducer> };
  keychains: ReturnType<typeof keychainSlice.reducer>;
  softwareKeys: ReturnType<typeof keySlice.reducer>;
  wallets: ReturnType<typeof walletSlice.reducer>;
}

export interface AuthoritativeWalletTransactionState {
  softwareKeys: SoftwareKeyStateSnapshot;
  state: WalletTransactionState;
}

type PersistedSoftwareKeyStateResult =
  | { status: 'absent' }
  | { status: 'invalid' }
  | { status: 'valid'; value: SoftwareKeyStateSnapshot };

type PersistedWalletTransactionStateResult =
  | { status: 'absent' }
  | { status: 'invalid' }
  | { status: 'valid'; value: AuthoritativeWalletTransactionState };

const persistRootStorageKey = 'persist:root';

const emptySoftwareKeyStateSnapshot: SoftwareKeyStateSnapshot = { keys: [] };
const initialStateProbeAction = { type: 'walletTransaction/initialStateProbe' };

function createEmptyWalletTransactionState(): WalletTransactionState {
  return {
    accounts: accountsSlice.reducer(undefined, initialStateProbeAction),
    active: activeSlice.reducer(undefined, initialStateProbeAction),
    chains: { stx: stxChainSlice.reducer(undefined, initialStateProbeAction) },
    keychains: keychainSlice.reducer(undefined, initialStateProbeAction),
    softwareKeys: keySlice.reducer(undefined, initialStateProbeAction),
    wallets: walletSlice.reducer(undefined, initialStateProbeAction),
  };
}

function hasEntityStateShape(value: unknown) {
  if (!isPlainObject(value) || !Array.isArray(value.ids) || !isPlainObject(value.entities)) {
    return false;
  }
  const uniqueIds = new Set<string>();
  for (const id of value.ids) {
    if (typeof id !== 'string' && typeof id !== 'number') return false;
    const normalizedId = String(id);
    if (uniqueIds.has(normalizedId) || !(normalizedId in value.entities)) return false;
    if (!isPlainObject(value.entities[normalizedId])) return false;
    uniqueIds.add(normalizedId);
  }
  const entityIds = getKeys(value.entities);
  return entityIds.length === uniqueIds.size && entityIds.every(id => uniqueIds.has(id));
}

function isWalletTransactionState(value: unknown): value is WalletTransactionState {
  if (!isPlainObject(value)) return false;
  if (!hasEntityStateShape(value.accounts)) return false;
  if (!isPlainObject(value.active)) return false;
  if (value.active.account !== null) {
    if (!isPlainObject(value.active.account)) return false;
    if (typeof value.active.account.fingerprint !== 'string') return false;
    if (
      typeof value.active.account.accountIndex !== 'number' ||
      !Number.isInteger(value.active.account.accountIndex) ||
      value.active.account.accountIndex < 0
    ) {
      return false;
    }
  }
  if (value.active.activePolicyId !== null && typeof value.active.activePolicyId !== 'string') {
    return false;
  }
  if (!isPlainObject(value.chains) || !isPlainObject(value.chains.stx)) return false;
  for (const chainState of Object.values(value.chains.stx)) {
    if (!isPlainObject(chainState)) return false;
    if (
      typeof chainState.highestAccountIndex !== 'number' ||
      !Number.isInteger(chainState.highestAccountIndex) ||
      chainState.highestAccountIndex < 0 ||
      typeof chainState.currentAccountStacksDescriptor !== 'string'
    ) {
      return false;
    }
  }
  if (!hasEntityStateShape(value.keychains)) return false;
  if (!hasEntityStateShape(value.softwareKeys)) return false;
  return hasEntityStateShape(value.wallets);
}

function readSoftwareKeyConfig(value: unknown): SoftwareKeyConfig | undefined {
  if (!isPlainObject(value)) return;
  if (
    value.type !== 'software' ||
    typeof value.id !== 'string' ||
    typeof value.encryptedSecretKey !== 'string'
  ) {
    return;
  }
  return { encryptedSecretKey: value.encryptedSecretKey, id: value.id, type: 'software' };
}

function readAuthenticationMode(value: unknown): WalletAuthenticationMode | undefined | null {
  if (value === undefined) return;
  if (value === 'biometric-only' || value === 'password') return value;
  return null;
}

function isValidAuthenticationState(snapshot: SoftwareKeyStateSnapshot) {
  if (snapshot.keys.length === 0) {
    return (
      snapshot.authenticationMode === undefined &&
      snapshot.platformUnlock === undefined &&
      snapshot.salt === undefined
    );
  }
  if (snapshot.authenticationMode === undefined) {
    return (
      snapshot.platformUnlock === undefined &&
      (snapshot.salt === undefined || snapshot.salt.length > 0)
    );
  }
  if (snapshot.authenticationMode === 'password') {
    return (
      snapshot.platformUnlock === undefined &&
      typeof snapshot.salt === 'string' &&
      snapshot.salt.length > 0
    );
  }
  return snapshot.salt === undefined && isPlatformUnlockConfig(snapshot.platformUnlock);
}

function parsePersistedSoftwareKeyState(root: unknown): PersistedSoftwareKeyStateResult {
  if (root === undefined) return { status: 'absent' };
  if (!isPlainObject(root)) return { status: 'invalid' };
  if (!('softwareKeys' in root)) return { status: 'absent' };
  if (!isPlainObject(root.softwareKeys)) return { status: 'invalid' };
  const softwareKeyState = root.softwareKeys;
  if (!Array.isArray(softwareKeyState.ids) || !isPlainObject(softwareKeyState.entities)) {
    return { status: 'invalid' };
  }
  const authenticationMode = readAuthenticationMode(softwareKeyState.authenticationMode);
  if (authenticationMode === null) return { status: 'invalid' };
  if (softwareKeyState.salt !== undefined && typeof softwareKeyState.salt !== 'string') {
    return { status: 'invalid' };
  }
  if (
    softwareKeyState.platformUnlock !== undefined &&
    !isPlatformUnlockConfig(softwareKeyState.platformUnlock)
  ) {
    return { status: 'invalid' };
  }
  const keys: SoftwareKeyConfig[] = [];
  const uniqueIds = new Set<string>();
  for (const id of softwareKeyState.ids) {
    if (typeof id !== 'string' || uniqueIds.has(id)) return { status: 'invalid' };
    const key = readSoftwareKeyConfig(softwareKeyState.entities[id]);
    if (!key || key.id !== id) return { status: 'invalid' };
    uniqueIds.add(id);
    keys.push(key);
  }
  const entityIds = getKeys(softwareKeyState.entities);
  if (entityIds.length !== uniqueIds.size || entityIds.some(id => !uniqueIds.has(id))) {
    return { status: 'invalid' };
  }
  const value = {
    authenticationMode,
    keys,
    platformUnlock: softwareKeyState.platformUnlock,
    salt: softwareKeyState.salt,
  };
  if (!isValidAuthenticationState(value)) return { status: 'invalid' };
  return { status: 'valid', value };
}

export async function readPersistedSoftwareKeyState(): Promise<PersistedSoftwareKeyStateResult> {
  const stored = await chrome.storage.local.get(persistRootStorageKey);
  return parsePersistedSoftwareKeyState(stored[persistRootStorageKey]);
}

export async function readAuthoritativeSoftwareKeyState(): Promise<SoftwareKeyStateSnapshot> {
  const persisted = await readPersistedSoftwareKeyState();
  if (persisted.status === 'invalid') {
    throw new Error('Persisted software wallet authentication state is invalid');
  }
  return persisted.status === 'absent' ? emptySoftwareKeyStateSnapshot : persisted.value;
}

export async function readPersistedWalletTransactionState(): Promise<PersistedWalletTransactionStateResult> {
  const stored = await chrome.storage.local.get(persistRootStorageKey);
  const root = stored[persistRootStorageKey];
  if (root === undefined) return { status: 'absent' };
  if (!isPlainObject(root)) return { status: 'invalid' };
  const persistedSoftwareKeys = parsePersistedSoftwareKeyState(root);
  if (persistedSoftwareKeys.status === 'invalid') return { status: 'invalid' };
  const softwareKeys =
    persistedSoftwareKeys.status === 'absent'
      ? emptySoftwareKeyStateSnapshot
      : persistedSoftwareKeys.value;
  const state = {
    accounts: root.accounts,
    active: root.active,
    chains: root.chains,
    keychains: root.keychains,
    softwareKeys: createSoftwareKeyState(softwareKeys),
    wallets: root.wallets,
  };
  if (!isWalletTransactionState(state)) return { status: 'invalid' };
  const softwareKeyIds = new Set(softwareKeys.keys.map(key => key.id));
  const softwareWalletIds = state.wallets.ids.filter(
    id => state.wallets.entities[id]?.type === 'software'
  );
  if (
    softwareWalletIds.length !== softwareKeyIds.size ||
    softwareWalletIds.some(id => !softwareKeyIds.has(id))
  ) {
    return { status: 'invalid' };
  }
  return { status: 'valid', value: { softwareKeys, state } };
}

export async function readAuthoritativeWalletTransactionState(): Promise<AuthoritativeWalletTransactionState> {
  const persisted = await readPersistedWalletTransactionState();
  if (persisted.status === 'invalid') {
    throw new Error('Persisted wallet transaction state is invalid');
  }
  if (persisted.status === 'valid') return persisted.value;
  return {
    softwareKeys: emptySoftwareKeyStateSnapshot,
    state: createEmptyWalletTransactionState(),
  };
}

export function createSoftwareKeyState(snapshot: SoftwareKeyStateSnapshot) {
  const state = keyAdapter.setAll(keySlice.getInitialState(), snapshot.keys);
  return {
    ids: state.ids,
    entities: state.entities,
    ...(snapshot.authenticationMode === undefined
      ? {}
      : { authenticationMode: snapshot.authenticationMode }),
    ...(snapshot.platformUnlock === undefined ? {} : { platformUnlock: snapshot.platformUnlock }),
    ...(snapshot.salt === undefined ? {} : { salt: snapshot.salt }),
  };
}

export function createSoftwareKeyStateSnapshot(
  state: ReturnType<typeof createSoftwareKeyState>
): SoftwareKeyStateSnapshot {
  return {
    authenticationMode: state.authenticationMode,
    keys: keyAdapter.getSelectors().selectAll(state),
    platformUnlock: state.platformUnlock,
    salt: state.salt,
  };
}
