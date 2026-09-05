import { type UnknownAction } from '@reduxjs/toolkit';
import { AddressVersion } from '@stacks/transactions';
import { isDeepEqual } from 'remeda';

import { deriveRootKeychainFromMnemonicSync } from '@leather.io/crypto';
import {
  getBnsV2ApiClient,
  getHiroStacksApiClient,
  getLeatherApiClient,
} from '@leather.io/services';
import { keychainSlice } from '@leather.io/state/keychains';
import {
  fingerprintMigration,
  userAddsWallet,
  userRemovesWallet,
  walletSlice,
} from '@leather.io/state/wallet';
import { secondsInMs } from '@leather.io/utils';

import { deriveEncryptionKey } from '@shared/crypto/generate-encryption-key';
import {
  decryptMnemonic,
  encryptMnemonic,
  encryptMnemonicWithEncryptionKey,
} from '@shared/crypto/mnemonic-encryption';
import { type PlatformUnlockConfig } from '@shared/crypto/platform-unlock';
import { logger } from '@shared/logger';
import { broadcastWalletListChanged } from '@shared/messages';
import { assumedZeroFingerprint } from '@shared/utils';
import { identifyUser } from '@shared/utils/analytics';

import { recurseAccountsForActivity } from '@app/common/account-restoration/account-restore';
import {
  WalletAuthenticationError,
  authenticateWithPassword,
  prepareBiometricSoftwareWallet,
} from '@app/common/wallet-authentication/wallet-authentication';
import { AppThunk, persistor } from '@app/store';
import { initializeWalletSessionWithSoftwareKeys } from '@app/store/session-restore';
import { hydrateSlicesFromStorage } from '@app/store/utils/storage-sync';

import { accountsSlice } from '../accounts/accounts.slice';
import { getNativeSegwitMainnetAddressFromRootKeychain } from '../accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { getTaprootMainnetAddressFromRootKeychain } from '../accounts/blockchain/bitcoin/taproot-account.hooks';
import { getStacksAddressByIndex } from '../accounts/blockchain/stacks/stacks-keychain';
import { activeSlice, walletKeyGenerated } from '../active/active.slice';
import { selectStacksChain } from '../chains/stx-chain.selectors';
import { stxChainSlice } from '../chains/stx-chain.slice';
import * as inMemoryStore from '../in-memory-key/in-memory-storage';
import { withWalletWriteLock } from '../wallets/wallet-write-lock';
import { selectAllWallets } from '../wallets/wallet.selectors';
import {
  type AuthoritativeWalletTransactionState,
  type SoftwareKeyStateSnapshot,
  type WalletTransactionState,
  createSoftwareKeyState,
  createSoftwareKeyStateSnapshot,
  readAuthoritativeSoftwareKeyState,
  readAuthoritativeWalletTransactionState,
  readPersistedWalletTransactionState,
} from './software-key-state';
import { selectWalletAuthenticationCapabilities } from './software-key.selectors';
import { type SoftwareKeyConfig, keySlice } from './software-key.slice';
import { decryptAllSoftwareKeys } from './utils';

interface AccountDiscoveryClients {
  leatherApiClient: ReturnType<typeof getLeatherApiClient>;
  hiroClient: ReturnType<typeof getHiroStacksApiClient>;
  bnsClient: ReturnType<typeof getBnsV2ApiClient>;
}

interface AccountActivityCheckerArgs extends AccountDiscoveryClients {
  mnemonic: string;
}

interface UnlockWalletWithEncryptionKeyArgs {
  encryptionKey: string;
  expectedPlatformUnlock?: PlatformUnlockConfig;
}

const nextAccountProbeInFlight = new Set<string>();
const recursiveDiscoveryInFlight = new Set<string>();
const accountActivityRequestTimeoutMs = secondsInMs(5);

async function getAuthoritativeSoftwareKeyState() {
  try {
    return await readAuthoritativeSoftwareKeyState();
  } catch {
    throw new WalletAuthenticationError('invalid-config');
  }
}

async function getAuthoritativeWalletTransactionState() {
  try {
    return await readAuthoritativeWalletTransactionState();
  } catch {
    throw new WalletAuthenticationError('invalid-config');
  }
}

function getSnapshotCapabilities(snapshot: SoftwareKeyStateSnapshot) {
  return selectWalletAuthenticationCapabilities.resultFunc({
    authenticationMode: snapshot.authenticationMode,
    ids: snapshot.keys.map(key => key.id),
    platformUnlock: snapshot.platformUnlock,
    salt: snapshot.salt,
  });
}

function adoptAuthoritativeSoftwareKeyState(
  dispatch: Parameters<AppThunk>[0],
  snapshot: SoftwareKeyStateSnapshot
) {
  dispatch(hydrateSlicesFromStorage({ softwareKeys: createSoftwareKeyState(snapshot) }));
}

function adoptAuthoritativeWalletTransactionState(
  dispatch: Parameters<AppThunk>[0],
  snapshot: AuthoritativeWalletTransactionState
) {
  dispatch(hydrateSlicesFromStorage(snapshot.state));
}

function reduceWalletTransactionState(
  state: WalletTransactionState,
  actions: UnknownAction[]
): WalletTransactionState {
  return actions.reduce(
    (current, action) => ({
      accounts: accountsSlice.reducer(current.accounts, action),
      active: activeSlice.reducer(current.active, action),
      chains: { stx: stxChainSlice.reducer(current.chains.stx, action) },
      keychains: keychainSlice.reducer(current.keychains, action),
      softwareKeys: keySlice.reducer(current.softwareKeys, action),
      wallets: walletSlice.reducer(current.wallets, action),
    }),
    state
  );
}

function dispatchWalletTransaction(dispatch: Parameters<AppThunk>[0], actions: UnknownAction[]) {
  for (const action of actions) dispatch(action);
}

async function readPersistedWalletTransactionStateAfterWrite() {
  const persisted = await readPersistedWalletTransactionState();
  if (persisted.status !== 'valid') {
    throw new Error('Persisted wallet transaction state is unavailable');
  }
  return persisted.value;
}

function selectAccountsForFingerprint(state: WalletTransactionState, fingerprint: string) {
  const prefix = `${fingerprint}/`;
  return state.accounts.ids
    .filter(id => String(id).startsWith(prefix))
    .map(id => state.accounts.entities[id]);
}

function walletTransactionPostconditionMatches({
  affectedFingerprints,
  expected,
  persisted,
}: {
  affectedFingerprints: string[];
  expected: WalletTransactionState;
  persisted: AuthoritativeWalletTransactionState;
}) {
  if (
    !softwareKeyStateSnapshotsMatch(
      createSoftwareKeyStateSnapshot(expected.softwareKeys),
      persisted.softwareKeys
    ) ||
    !isDeepEqual(expected.active, persisted.state.active) ||
    !isDeepEqual(expected.keychains, persisted.state.keychains)
  ) {
    return false;
  }
  return affectedFingerprints.every(
    fingerprint =>
      expected.wallets.ids.includes(fingerprint) ===
        persisted.state.wallets.ids.includes(fingerprint) &&
      isDeepEqual(
        expected.wallets.entities[fingerprint],
        persisted.state.wallets.entities[fingerprint]
      ) &&
      isDeepEqual(expected.chains.stx[fingerprint], persisted.state.chains.stx[fingerprint]) &&
      isDeepEqual(
        selectAccountsForFingerprint(expected, fingerprint),
        selectAccountsForFingerprint(persisted.state, fingerprint)
      )
  );
}

async function resynchronizeWalletTransactionState(
  dispatch: Parameters<AppThunk>[0],
  fallback: AuthoritativeWalletTransactionState
) {
  try {
    adoptAuthoritativeWalletTransactionState(
      dispatch,
      await readAuthoritativeWalletTransactionState()
    );
  } catch {
    adoptAuthoritativeWalletTransactionState(dispatch, fallback);
  }
}

async function persistWalletTransaction({
  actions,
  affectedFingerprints,
  dispatch,
  source,
}: {
  actions: UnknownAction[];
  affectedFingerprints: string[];
  dispatch: Parameters<AppThunk>[0];
  source: AuthoritativeWalletTransactionState;
}) {
  const expected = reduceWalletTransactionState(source.state, actions);
  dispatchWalletTransaction(dispatch, actions);
  try {
    await persistor.flush();
  } catch {
    await resynchronizeWalletTransactionState(dispatch, source);
    throw new WalletAuthenticationError('persistence-failed');
  }
  try {
    const persisted = await readPersistedWalletTransactionStateAfterWrite();
    if (!walletTransactionPostconditionMatches({ affectedFingerprints, expected, persisted })) {
      adoptAuthoritativeWalletTransactionState(dispatch, persisted);
      throw new WalletAuthenticationError('persistence-failed');
    }
    return persisted;
  } catch (error) {
    if (error instanceof WalletAuthenticationError) throw error;
    await resynchronizeWalletTransactionState(dispatch, source);
    throw new WalletAuthenticationError('persistence-failed');
  }
}

function validHighestAccountIndex(index: number | undefined) {
  return typeof index === 'number' && Number.isInteger(index) && index >= 0 ? index : 0;
}

function createAccountActivityChecker({
  bnsClient,
  hiroClient,
  leatherApiClient,
  mnemonic,
}: AccountActivityCheckerArgs) {
  const rootKeychain = deriveRootKeychainFromMnemonicSync(mnemonic);
  const deriveStacksAddress = getStacksAddressByIndex(
    rootKeychain,
    AddressVersion.MainnetSingleSig
  );
  const deriveNativeSegwitAddress = getNativeSegwitMainnetAddressFromRootKeychain(rootKeychain);
  const deriveTaprootAddress = getTaprootMainnetAddressFromRootKeychain(rootKeychain);

  async function doesStacksAddressHaveBalance(address: string, signal: AbortSignal) {
    const resp = await hiroClient.getAddressStxBalance(address, { signal });
    return Number(resp.balance) > 0;
  }

  async function doesStacksAddressHaveBnsName(address: string, signal: AbortSignal) {
    const resp = await bnsClient.fetchAddressBnsNames(address, { signal });
    return resp.names.length > 0;
  }

  async function doesStacksAddressHaveTransactionHistory(address: string, signal: AbortSignal) {
    const resp = await hiroClient.getAddressTransactions(address, { pages: 1 }, { signal });
    return resp.length > 0;
  }

  async function doesBitcoinAddressHaveBalance(address: string, signal: AbortSignal) {
    const resp = await leatherApiClient.fetchUtxosByAddress(address, { signal });
    return resp.length > 0;
  }

  async function doesBitcoinAddressHaveTransactionHistory(address: string, signal: AbortSignal) {
    const resp = await leatherApiClient.fetchBitcoinTransactionsByAddress(
      address,
      { page: 1, pageSize: 1 },
      { signal }
    );
    return resp.data.length > 0;
  }

  return async function doesAccountHaveActivity(index: number) {
    const signal = AbortSignal.timeout(accountActivityRequestTimeoutMs);
    const stxAddress = deriveStacksAddress(index);
    const btcAddresses = [deriveNativeSegwitAddress(index), deriveTaprootAddress(index)].filter(
      (address): address is string => !!address
    );

    const results = await Promise.allSettled([
      doesStacksAddressHaveBalance(stxAddress, signal),
      doesStacksAddressHaveBnsName(stxAddress, signal),
      doesStacksAddressHaveTransactionHistory(stxAddress, signal),
      ...btcAddresses.flatMap(address => [
        doesBitcoinAddressHaveBalance(address, signal),
        doesBitcoinAddressHaveTransactionHistory(address, signal),
      ]),
    ]);

    const rejectedCount = results.filter(result => result.status === 'rejected').length;
    if (rejectedCount) {
      logger.warn('Account activity lookup checks failed', {
        accountIndex: index,
        rejectedCount,
      });
    }

    if (results.every(result => result.status === 'rejected')) {
      throw new Error('All account activity lookup checks failed');
    }

    return results.some(result => result.status === 'fulfilled' && result.value);
  };
}

function startRecursiveAccountDiscovery({
  dispatch,
  doesAddressHaveActivityFn,
  fingerprint,
  fromAccountIndex,
}: {
  dispatch: Parameters<AppThunk>[0];
  doesAddressHaveActivityFn: ReturnType<typeof createAccountActivityChecker>;
  fingerprint: string;
  fromAccountIndex: number;
}) {
  if (recursiveDiscoveryInFlight.has(fingerprint)) return;
  recursiveDiscoveryInFlight.add(fingerprint);

  logger.info('Initiating recursive account activity lookup');
  const start = performance.now();

  async function persistDiscoveredAccountIndex(accountIndex: number) {
    await withWalletWriteLock(async () => {
      const authoritative = await getAuthoritativeWalletTransactionState();
      if (!authoritative.state.wallets.entities[fingerprint]) return;
      const currentIndex = validHighestAccountIndex(
        authoritative.state.chains.stx[fingerprint]?.highestAccountIndex
      );
      if (accountIndex <= currentIndex) return;
      adoptAuthoritativeWalletTransactionState(dispatch, authoritative);
      dispatch(stxChainSlice.actions.restoreAccountIndex({ fingerprint, accountIndex }));
      await persistor.flush();
      const persisted = await getAuthoritativeWalletTransactionState();
      const persistedIndex = validHighestAccountIndex(
        persisted.state.chains.stx[fingerprint]?.highestAccountIndex
      );
      if (persistedIndex >= accountIndex) return;
      adoptAuthoritativeWalletTransactionState(dispatch, persisted);
      throw new WalletAuthenticationError('persistence-failed');
    });
  }

  void recurseAccountsForActivity({
    doesAddressHaveActivityFn,
    fromAccountIndex,
    onActivityFound: persistDiscoveredAccountIndex,
  })
    .then(recursiveActivityIndex => {
      const end = performance.now();
      logger.info('Found account activity at higher index', {
        recursiveActivityIndex,
        time: (end - start) / 1000 + ' seconds',
      });
    })
    .catch(error => {
      logger.warn('Account activity lookup failed', { error });
    })
    .finally(() => {
      recursiveDiscoveryInFlight.delete(fingerprint);
    });
}

function probeNextAccountAndDiscoverAccounts(clients: AccountDiscoveryClients): AppThunk {
  return async (dispatch, getState) => {
    const state = getState();
    const stxChain = selectStacksChain(state);
    const softwareWallets = selectAllWallets(state).filter(wallet => wallet.type === 'software');

    await Promise.all(
      softwareWallets.map(async wallet => {
        const { fingerprint } = wallet;
        if (nextAccountProbeInFlight.has(fingerprint)) return;
        if (recursiveDiscoveryInFlight.has(fingerprint)) return;

        const mnemonic = inMemoryStore.getKey(fingerprint);
        if (!mnemonic) return;

        nextAccountProbeInFlight.add(fingerprint);
        try {
          const highestAccountIndex = validHighestAccountIndex(
            stxChain[fingerprint]?.highestAccountIndex
          );
          const nextAccountIndex = highestAccountIndex + 1;
          const doesAddressHaveActivityFn = createAccountActivityChecker({ ...clients, mnemonic });
          const hasActivity = await doesAddressHaveActivityFn(nextAccountIndex);

          if (!hasActivity) return;

          startRecursiveAccountDiscovery({
            dispatch,
            doesAddressHaveActivityFn,
            fingerprint,
            fromAccountIndex: highestAccountIndex,
          });
        } catch (error) {
          logger.warn('Next account activity probe failed', { error, fingerprint });
        } finally {
          nextAccountProbeInFlight.delete(fingerprint);
        }
      })
    );
  };
}

function setWalletEncryptionPassword(
  args: {
    password: string;
    mnemonic: string;
    fingerprint: string;
  } & AccountDiscoveryClients
): AppThunk {
  const { password, mnemonic, fingerprint, leatherApiClient, hiroClient, bnsClient } = args;

  return async dispatch => {
    await withWalletWriteLock(async () => {
      const authoritativeWallet = await getAuthoritativeWalletTransactionState();
      const authoritative = authoritativeWallet.softwareKeys;
      const capabilities = getSnapshotCapabilities(authoritative);
      const hasSoftwareKeys = authoritative.keys.length > 0;
      const existingSalt = authoritative.salt;
      if (!capabilities.valid || (hasSoftwareKeys && (!capabilities.password || !existingSalt))) {
        throw new WalletAuthenticationError('invalid-config');
      }
      if (
        authoritative.keys.some(key => key.id === fingerprint) ||
        authoritativeWallet.state.wallets.entities[fingerprint]
      ) {
        throw new WalletAuthenticationError('wallet-already-exists');
      }
      const existingAuthentication =
        hasSoftwareKeys && existingSalt
          ? await authenticateWithPassword({
              password,
              salt: existingSalt,
              softwareKeys: authoritative.keys,
            })
          : undefined;
      if (existingAuthentication?.status === 'failure') {
        throw new WalletAuthenticationError(existingAuthentication.code);
      }
      const existingEncryptionKey =
        existingAuthentication?.status === 'success' ? existingAuthentication.value : undefined;

      const { encryptedSecretKey, encryptionKey, salt } = await encryptMnemonic({
        secretKey: mnemonic,
        password,
        existingEncryptionKey,
        existingSalt,
      });
      const latestWallet = await getAuthoritativeWalletTransactionState();
      const latest = latestWallet.softwareKeys;
      if (!softwareKeyStateSnapshotsMatch(authoritative, latest)) {
        throw new WalletAuthenticationError('state-changed');
      }
      if (latestWallet.state.wallets.entities[fingerprint]) {
        throw new WalletAuthenticationError('wallet-already-exists');
      }
      if (hasSoftwareKeys) {
        try {
          await decryptAllSoftwareKeys(latest.keys, encryptionKey);
        } catch {
          throw new WalletAuthenticationError('wallet-validation-failed');
        }
      }
      adoptAuthoritativeWalletTransactionState(dispatch, latestWallet);
      const newKey: SoftwareKeyConfig = {
        type: 'software',
        id: fingerprint,
        encryptedSecretKey,
      };
      // Single wallet key slice structure
      const softwareKeyAction = hasSoftwareKeys
        ? keySlice.actions.addNewWallet(newKey)
        : keySlice.actions.createSoftwareWalletComplete({ salt, key: newKey });
      // Multi-wallet structure
      const addWalletAction = userAddsWallet({
        wallet: {
          createdOn: new Date().toISOString(),
          fingerprint,
          type: 'software',
        },
        accountKeychains: [],
      });
      const keyGeneratedAction = walletKeyGenerated(fingerprint);
      const transactionActions: UnknownAction[] = [
        addWalletAction,
        softwareKeyAction,
        keyGeneratedAction,
      ];
      const persisted = await persistWalletTransaction({
        actions: transactionActions,
        affectedFingerprints: [fingerprint],
        dispatch,
        source: latestWallet,
      });
      const decryptedSoftwareKeys = await decryptAllSoftwareKeys(
        persisted.softwareKeys.keys,
        encryptionKey
      );
      await initializeWalletSessionWithSoftwareKeys(encryptionKey, decryptedSoftwareKeys);
      void broadcastWalletListChanged({});

      // Performs a recursive check for account activity. When activity is found
      // at a higher index than what is found on Gaia (long-term wallet users), we
      // update the highest known account index that the wallet generates. This
      // action is performed outside this Promise's execution, as it may be slow,
      // and the user shouldn't have to wait before being directed to homepage.
      startRecursiveAccountDiscovery({
        dispatch,
        doesAddressHaveActivityFn: createAccountActivityChecker({
          bnsClient,
          hiroClient,
          leatherApiClient,
          mnemonic,
        }),
        fingerprint,
        fromAccountIndex: 0,
      });
    });
  };
}

function createBiometricSoftwareWallet(
  args: {
    fingerprint: string;
    mnemonic: string;
  } & AccountDiscoveryClients
): AppThunk {
  const { fingerprint, mnemonic, leatherApiClient, hiroClient, bnsClient } = args;
  return async dispatch => {
    await withWalletWriteLock(async () => {
      const authoritativeWallet = await getAuthoritativeWalletTransactionState();
      const authoritative = authoritativeWallet.softwareKeys;
      const capabilities = getSnapshotCapabilities(authoritative);
      if (!capabilities.valid) {
        throw new WalletAuthenticationError('invalid-config');
      }
      if (authoritative.keys.length > 0 || capabilities.biometrics || capabilities.password) {
        throw new WalletAuthenticationError('state-changed');
      }
      if (authoritativeWallet.state.wallets.entities[fingerprint]) {
        throw new WalletAuthenticationError('wallet-already-exists');
      }
      const preparation = await prepareBiometricSoftwareWallet({ fingerprint, mnemonic });
      if (preparation.status === 'failure') {
        throw new WalletAuthenticationError(preparation.code);
      }
      if (preparation.value.key.id !== fingerprint) {
        throw new WalletAuthenticationError('wallet-validation-failed');
      }
      const latestWallet = await getAuthoritativeWalletTransactionState();
      if (!softwareKeyStateSnapshotsMatch(authoritative, latestWallet.softwareKeys)) {
        throw new WalletAuthenticationError('state-changed');
      }
      if (latestWallet.state.wallets.entities[fingerprint]) {
        throw new WalletAuthenticationError('wallet-already-exists');
      }
      adoptAuthoritativeWalletTransactionState(dispatch, latestWallet);
      const decrypted = await decryptAllSoftwareKeys(
        [preparation.value.key],
        preparation.value.encryptionKey
      ).catch(() => {
        throw new WalletAuthenticationError('wallet-validation-failed');
      });
      if (decrypted[0]?.fingerprint !== fingerprint || decrypted[0].secretKey !== mnemonic) {
        throw new WalletAuthenticationError('wallet-validation-failed');
      }

      const transactionActions: UnknownAction[] = [
        userAddsWallet({
          wallet: {
            createdOn: new Date().toISOString(),
            fingerprint,
            type: 'software',
          },
          accountKeychains: [],
        }),
        keySlice.actions.createBiometricSoftwareWalletComplete({
          key: preparation.value.key,
          platformUnlock: preparation.value.platformUnlock,
        }),
        walletKeyGenerated(fingerprint),
      ];
      const persisted = await persistWalletTransaction({
        actions: transactionActions,
        affectedFingerprints: [fingerprint],
        dispatch,
        source: latestWallet,
      });
      const persistedSoftwareKeys = persisted.softwareKeys;
      const persistedDecrypted = await decryptAllSoftwareKeys(
        persistedSoftwareKeys.keys,
        preparation.value.encryptionKey
      );
      await initializeWalletSessionWithSoftwareKeys(
        preparation.value.encryptionKey,
        persistedDecrypted
      );
      void broadcastWalletListChanged({});
      startRecursiveAccountDiscovery({
        dispatch,
        doesAddressHaveActivityFn: createAccountActivityChecker({
          bnsClient,
          hiroClient,
          leatherApiClient,
          mnemonic,
        }),
        fingerprint,
        fromAccountIndex: 0,
      });
    });
  };
}

function softwareKeySnapshotsMatch(before: SoftwareKeyConfig[], after: SoftwareKeyConfig[]) {
  if (before.length !== after.length) return false;
  const afterById = new Map(after.map(key => [key.id, key.encryptedSecretKey]));
  return before.every(key => afterById.get(key.id) === key.encryptedSecretKey);
}

function platformUnlockConfigsEqual(
  left: PlatformUnlockConfig | undefined,
  right: PlatformUnlockConfig | undefined
) {
  if (!left || !right) return left === right;
  return (
    left.credentialId === right.credentialId &&
    left.iv === right.iv &&
    left.prfInput === right.prfInput &&
    left.registrationTag === right.registrationTag &&
    left.version === right.version &&
    left.wrappedEncryptionKey === right.wrappedEncryptionKey
  );
}

function softwareKeyStateSnapshotsMatch(
  before: SoftwareKeyStateSnapshot,
  after: SoftwareKeyStateSnapshot
) {
  return (
    before.authenticationMode === after.authenticationMode &&
    before.salt === after.salt &&
    softwareKeySnapshotsMatch(before.keys, after.keys) &&
    platformUnlockConfigsEqual(before.platformUnlock, after.platformUnlock)
  );
}

function identifyAuthenticatedWallet(
  decryptedSoftwareKeys: Awaited<ReturnType<typeof decryptAllSoftwareKeys>>
) {
  const firstDecryptedResult = decryptedSoftwareKeys[0];
  if (!firstDecryptedResult) return;
  const rootKey = deriveRootKeychainFromMnemonicSync(firstDecryptedResult.secretKey);
  if (!rootKey.publicKey) throw new Error('Could not derive root key from mnemonic');
  void identifyUser(rootKey.publicKey);
}

function unlockWalletWithEncryptionKey({
  encryptionKey,
  expectedPlatformUnlock,
}: UnlockWalletWithEncryptionKeyArgs): AppThunk {
  return async dispatch => {
    await withWalletWriteLock(async () => {
      const authoritative = await getAuthoritativeSoftwareKeyState();
      const capabilities = getSnapshotCapabilities(authoritative);
      if (
        !capabilities.valid ||
        authoritative.keys.length === 0 ||
        !platformUnlockConfigsEqual(expectedPlatformUnlock, authoritative.platformUnlock)
      ) {
        throw new WalletAuthenticationError('invalid-config');
      }
      adoptAuthoritativeSoftwareKeyState(dispatch, authoritative);
      const decryptedSoftwareKeys = await decryptAllSoftwareKeys(
        authoritative.keys,
        encryptionKey
      ).catch(() => {
        const code = capabilities.password ? 'invalid-password' : 'wallet-validation-failed';
        throw new WalletAuthenticationError(code);
      });
      const latest = await getAuthoritativeSoftwareKeyState();
      if (
        !softwareKeyStateSnapshotsMatch(authoritative, latest) ||
        !platformUnlockConfigsEqual(expectedPlatformUnlock, latest.platformUnlock)
      ) {
        adoptAuthoritativeSoftwareKeyState(dispatch, latest);
        throw new WalletAuthenticationError('state-changed');
      }
      await initializeWalletSessionWithSoftwareKeys(encryptionKey, decryptedSoftwareKeys);
      identifyAuthenticatedWallet(decryptedSoftwareKeys);
    });
  };
}

function unlockWalletAction(password: string): AppThunk {
  return async (dispatch, getState) => {
    const authoritative = await getAuthoritativeSoftwareKeyState();
    const capabilities = getSnapshotCapabilities(authoritative);
    if (!capabilities.valid || !capabilities.password || authoritative.keys.length === 0) {
      throw new WalletAuthenticationError('invalid-config');
    }
    adoptAuthoritativeSoftwareKeyState(dispatch, authoritative);
    const salt = authoritative.salt;
    if (salt) {
      const encryptionKey = await deriveEncryptionKey({ password, salt });
      await unlockWalletWithEncryptionKey({ encryptionKey })(dispatch, getState, undefined);
      return;
    }

    await withWalletWriteLock(async () => {
      const latestWallet = await getAuthoritativeWalletTransactionState();
      const latest = latestWallet.softwareKeys;
      if (!softwareKeyStateSnapshotsMatch(authoritative, latest)) {
        adoptAuthoritativeWalletTransactionState(dispatch, latestWallet);
        throw new WalletAuthenticationError('state-changed');
      }
      adoptAuthoritativeWalletTransactionState(dispatch, latestWallet);
      const softwareKeys = latest.keys;
      const decryptedResults = await Promise.all(
        softwareKeys.map(key =>
          decryptMnemonic({
            password,
            encryptedSecretKey: key.encryptedSecretKey,
            salt,
          })
        )
      ).catch(() => {
        throw new WalletAuthenticationError('invalid-password');
      });
      const firstDecryptedResult = decryptedResults[0];
      if (!firstDecryptedResult) throw new WalletAuthenticationError('invalid-config');

      function requiresFingerprintMigration() {
        return softwareKeys.length === 1 && softwareKeys[0].id === assumedZeroFingerprint;
      }

      const transactionActions: UnknownAction[] = [];
      if (requiresFingerprintMigration()) {
        const { fingerprint } = firstDecryptedResult;

        transactionActions.push(fingerprintMigration(fingerprint));

        const oldWallet = latestWallet.state.wallets.entities[assumedZeroFingerprint];

        if (oldWallet) {
          transactionActions.push(userRemovesWallet({ fingerprint: assumedZeroFingerprint }));
          transactionActions.push(
            userAddsWallet({
              wallet: { ...oldWallet, fingerprint },
              accountKeychains: [],
            })
          );
        }
      }

      // Pre-Argon2 / vault-migrated wallets have no top-level salt, so decryptMnemonic
      // took its legacy path and re-encrypted the key with a freshly generated Argon2
      // salt. Persist that salt and re-encrypted key here so future password
      // authentication uses the durable Argon2 parameters.
      const reEncrypted = firstDecryptedResult;
      transactionActions.push(
        keySlice.actions.softwareKeyReEncrypted({
          salt: reEncrypted.salt,
          key: {
            type: 'software',
            id: reEncrypted.fingerprint,
            encryptedSecretKey: reEncrypted.encryptedSecretKey,
          },
        })
      );
      await persistWalletTransaction({
        actions: transactionActions,
        affectedFingerprints: [assumedZeroFingerprint, reEncrypted.fingerprint],
        dispatch,
        source: latestWallet,
      });
      await initializeWalletSessionWithSoftwareKeys(reEncrypted.encryptionKey, decryptedResults);
      identifyAuthenticatedWallet(decryptedResults);
    });
  };
}

function addSoftwareWalletWithEncryptionKey(
  args: {
    encryptionKey: string;
    expectedPlatformUnlock: PlatformUnlockConfig;
    fingerprint: string;
    mnemonic: string;
  } & AccountDiscoveryClients
): AppThunk {
  const {
    encryptionKey,
    expectedPlatformUnlock,
    fingerprint,
    mnemonic,
    leatherApiClient,
    hiroClient,
    bnsClient,
  } = args;

  return async dispatch => {
    await withWalletWriteLock(async () => {
      const authoritativeWallet = await getAuthoritativeWalletTransactionState();
      const authoritative = authoritativeWallet.softwareKeys;
      const capabilities = getSnapshotCapabilities(authoritative);
      adoptAuthoritativeWalletTransactionState(dispatch, authoritativeWallet);
      if (
        !capabilities.valid ||
        capabilities.authenticationMode !== 'biometric-only' ||
        authoritative.keys.length === 0 ||
        !platformUnlockConfigsEqual(expectedPlatformUnlock, authoritative.platformUnlock)
      ) {
        throw new WalletAuthenticationError('invalid-config');
      }
      if (
        authoritative.keys.some(key => key.id === fingerprint) ||
        authoritativeWallet.state.wallets.entities[fingerprint]
      ) {
        throw new WalletAuthenticationError('wallet-already-exists');
      }
      await decryptAllSoftwareKeys(authoritative.keys, encryptionKey).catch(() => {
        throw new WalletAuthenticationError('wallet-validation-failed');
      });
      const { encryptedSecretKey } = await encryptMnemonicWithEncryptionKey({
        encryptionKey,
        secretKey: mnemonic,
      });
      const newKey: SoftwareKeyConfig = {
        type: 'software',
        id: fingerprint,
        encryptedSecretKey,
      };
      const latestWallet = await getAuthoritativeWalletTransactionState();
      const latest = latestWallet.softwareKeys;
      if (!softwareKeyStateSnapshotsMatch(authoritative, latest)) {
        adoptAuthoritativeWalletTransactionState(dispatch, latestWallet);
        throw new WalletAuthenticationError('state-changed');
      }
      if (latestWallet.state.wallets.entities[fingerprint]) {
        throw new WalletAuthenticationError('wallet-already-exists');
      }
      adoptAuthoritativeWalletTransactionState(dispatch, latestWallet);

      const transactionActions: UnknownAction[] = [
        userAddsWallet({
          wallet: {
            createdOn: new Date().toISOString(),
            fingerprint,
            type: 'software',
          },
          accountKeychains: [],
        }),
        keySlice.actions.addNewWallet(newKey),
        walletKeyGenerated(fingerprint),
      ];
      const persisted = await persistWalletTransaction({
        actions: transactionActions,
        affectedFingerprints: [fingerprint],
        dispatch,
        source: latestWallet,
      });
      const decryptedSoftwareKeys = await decryptAllSoftwareKeys(
        persisted.softwareKeys.keys,
        encryptionKey
      );
      await initializeWalletSessionWithSoftwareKeys(encryptionKey, decryptedSoftwareKeys);
      void broadcastWalletListChanged({});
      startRecursiveAccountDiscovery({
        dispatch,
        doesAddressHaveActivityFn: createAccountActivityChecker({
          bnsClient,
          hiroClient,
          leatherApiClient,
          mnemonic,
        }),
        fingerprint,
        fromAccountIndex: 0,
      });
    });
  };
}

export const keyActions = {
  ...keySlice.actions,
  addSoftwareWalletWithEncryptionKey,
  createBiometricSoftwareWallet,
  probeNextAccountAndDiscoverAccounts,
  setWalletEncryptionPassword,
  unlockWalletAction,
  unlockWalletWithEncryptionKey,
};
