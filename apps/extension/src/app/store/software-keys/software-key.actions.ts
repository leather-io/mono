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
  type BiometricSoftwareWalletPreparation,
  type PasswordAuthenticationTransition,
  type PlatformUnlockChange,
  authenticateWithPassword,
} from '@app/common/wallet-authentication/use-wallet-authentication';
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
import { selectAllWallets } from '../wallets/wallet.selectors';
import {
  type AuthoritativeWalletTransactionState,
  type SoftwareKeyStateSnapshot,
  type WalletTransactionState,
  createSoftwareKeyState,
  readAuthoritativeSoftwareKeyState,
  readAuthoritativeWalletTransactionState,
  readPersistedSoftwareKeyState,
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

const walletAuthenticationWriteLockName = 'leather:wallet-authentication-write';

const nextAccountProbeInFlight = new Set<string>();
const recursiveDiscoveryInFlight = new Set<string>();
const accountActivityRequestTimeoutMs = secondsInMs(5);

async function withWalletAuthenticationWriteLock<T>(operation: () => Promise<T>): Promise<T> {
  if (typeof navigator !== 'undefined' && 'locks' in navigator) {
    return navigator.locks.request(walletAuthenticationWriteLockName, operation);
  }
  return operation();
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

async function readPersistedSoftwareKeyStateAfterWrite() {
  const persisted = await readPersistedSoftwareKeyState();
  if (persisted.status !== 'valid') {
    throw new Error('Persisted software wallet authentication state is unavailable');
  }
  return persisted.value;
}

async function readPersistedWalletTransactionStateAfterWrite() {
  const persisted = await readPersistedWalletTransactionState();
  if (persisted.status !== 'valid') {
    throw new Error('Persisted wallet transaction state is unavailable');
  }
  return persisted.value;
}

function walletTransactionStatesMatch(
  before: WalletTransactionState,
  after: WalletTransactionState
) {
  return isDeepEqual(before, after);
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
  dispatch(action: ReturnType<typeof stxChainSlice.actions.restoreAccountIndex>): void;
  doesAddressHaveActivityFn: ReturnType<typeof createAccountActivityChecker>;
  fingerprint: string;
  fromAccountIndex: number;
}) {
  if (recursiveDiscoveryInFlight.has(fingerprint)) return;
  recursiveDiscoveryInFlight.add(fingerprint);

  logger.info('Initiating recursive account activity lookup');
  const start = performance.now();

  function persistDiscoveredAccountIndex(accountIndex: number) {
    dispatch(stxChainSlice.actions.restoreAccountIndex({ fingerprint, accountIndex }));
    void persistor.flush();
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
    await withWalletAuthenticationWriteLock(async () => {
      const authoritativeWallet = await readAuthoritativeWalletTransactionState();
      const authoritative = authoritativeWallet.softwareKeys;
      const capabilities = getSnapshotCapabilities(authoritative);
      const hasSoftwareKeys = authoritative.keys.length > 0;
      const existingSalt = authoritative.salt;
      if (
        !capabilities.valid ||
        authoritative.keys.some(key => key.id === fingerprint) ||
        (hasSoftwareKeys && (!capabilities.password || !existingSalt))
      ) {
        throw new Error("Can't authenticate this wallet with a password");
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
        throw new Error("The password doesn't match");
      }
      const existingEncryptionKey =
        existingAuthentication?.status === 'success' ? existingAuthentication.value : undefined;

      const { encryptedSecretKey, encryptionKey, salt } = await encryptMnemonic({
        secretKey: mnemonic,
        password,
        existingEncryptionKey,
        existingSalt,
      });
      const latestWallet = await readAuthoritativeWalletTransactionState();
      const latest = latestWallet.softwareKeys;
      if (!softwareKeyStateSnapshotsMatch(authoritative, latest)) {
        throw new Error('Software wallet state changed during authentication');
      }
      if (hasSoftwareKeys) await decryptAllSoftwareKeys(latest.keys, encryptionKey);
      adoptAuthoritativeWalletTransactionState(dispatch, latestWallet);
      const newKey: SoftwareKeyConfig = {
        type: 'software',
        id: fingerprint,
        encryptedSecretKey,
      };
      const softwareKeyAction = hasSoftwareKeys
        ? keySlice.actions.addNewWallet(newKey)
        : keySlice.actions.createSoftwareWalletComplete({ salt, key: newKey });
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
      const expectedTransaction = reduceWalletTransactionState(
        latestWallet.state,
        transactionActions
      );

      // Multi-wallet structure
      dispatch(addWalletAction);

      // Single wallet key slice structure
      dispatch(softwareKeyAction);
      dispatch(keyGeneratedAction);

      try {
        await persistor.flush();
      } catch (error) {
        adoptAuthoritativeWalletTransactionState(dispatch, latestWallet);
        try {
          await persistor.flush();
        } catch (rollbackError) {
          void rollbackError;
        }
        throw error;
      }
      const persisted = await readPersistedWalletTransactionStateAfterWrite();
      if (!walletTransactionStatesMatch(expectedTransaction, persisted.state)) {
        adoptAuthoritativeWalletTransactionState(dispatch, persisted);
        throw new Error('Software wallet did not persist under the authenticated key');
      }
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
    preparation: BiometricSoftwareWalletPreparation;
  } & AccountDiscoveryClients
): AppThunk {
  const { fingerprint, mnemonic, preparation, leatherApiClient, hiroClient, bnsClient } = args;
  return async dispatch => {
    await withWalletAuthenticationWriteLock(async () => {
      const authoritativeWallet = await readAuthoritativeWalletTransactionState();
      const authoritative = authoritativeWallet.softwareKeys;
      const capabilities = getSnapshotCapabilities(authoritative);
      if (
        authoritative.keys.length > 0 ||
        !capabilities.valid ||
        capabilities.biometrics ||
        capabilities.password ||
        preparation.key.id !== fingerprint
      ) {
        throw new Error('Software wallet state changed during biometric setup');
      }
      adoptAuthoritativeWalletTransactionState(dispatch, authoritativeWallet);
      if (authoritativeWallet.state.wallets.entities[fingerprint]) {
        throw new Error('A wallet with this fingerprint already exists');
      }
      const decrypted = await decryptAllSoftwareKeys([preparation.key], preparation.encryptionKey);
      if (decrypted[0]?.fingerprint !== fingerprint || decrypted[0].secretKey !== mnemonic) {
        throw new Error('Biometric wallet preparation is invalid');
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
          key: preparation.key,
          platformUnlock: preparation.platformUnlock,
        }),
        walletKeyGenerated(fingerprint),
      ];
      const expectedTransaction = reduceWalletTransactionState(
        authoritativeWallet.state,
        transactionActions
      );
      dispatchWalletTransaction(dispatch, transactionActions);

      try {
        await persistor.flush();
      } catch (error) {
        adoptAuthoritativeWalletTransactionState(dispatch, authoritativeWallet);
        try {
          await persistor.flush();
        } catch (rollbackError) {
          void rollbackError;
        }
        throw error;
      }
      const persisted = await readPersistedWalletTransactionStateAfterWrite();
      if (!walletTransactionStatesMatch(expectedTransaction, persisted.state)) {
        adoptAuthoritativeWalletTransactionState(dispatch, persisted);
        throw new Error('Biometric wallet setup did not persist');
      }
      const persistedSoftwareKeys = persisted.softwareKeys;
      const persistedCapabilities = getSnapshotCapabilities(persistedSoftwareKeys);
      if (
        persistedCapabilities.authenticationMode !== 'biometric-only' ||
        !softwareKeySnapshotsMatch([preparation.key], persistedSoftwareKeys.keys) ||
        !platformUnlockConfigsEqual(
          preparation.platformUnlock,
          persistedSoftwareKeys.platformUnlock
        )
      ) {
        adoptAuthoritativeWalletTransactionState(dispatch, persisted);
        throw new Error('Biometric wallet setup did not persist');
      }
      const persistedDecrypted = await decryptAllSoftwareKeys(
        persistedSoftwareKeys.keys,
        preparation.encryptionKey
      );
      await initializeWalletSessionWithSoftwareKeys(preparation.encryptionKey, persistedDecrypted);
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

function platformUnlockConfigsMatch(
  expected: PlatformUnlockConfig | undefined,
  actual: PlatformUnlockConfig | undefined
) {
  if (!expected) return true;
  if (!actual) return false;
  return (
    expected.credentialId === actual.credentialId &&
    expected.iv === actual.iv &&
    expected.prfInput === actual.prfInput &&
    expected.registrationTag === actual.registrationTag &&
    expected.version === actual.version &&
    expected.wrappedEncryptionKey === actual.wrappedEncryptionKey
  );
}

function platformUnlockConfigsEqual(
  left: PlatformUnlockConfig | undefined,
  right: PlatformUnlockConfig | undefined
) {
  if (!left || !right) return left === right;
  return platformUnlockConfigsMatch(left, right);
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
    await withWalletAuthenticationWriteLock(async () => {
      const authoritative = await readAuthoritativeSoftwareKeyState();
      const capabilities = getSnapshotCapabilities(authoritative);
      if (
        !capabilities.valid ||
        authoritative.keys.length === 0 ||
        !platformUnlockConfigsMatch(expectedPlatformUnlock, authoritative.platformUnlock)
      ) {
        throw new Error('Platform authentication state changed during authentication');
      }
      adoptAuthoritativeSoftwareKeyState(dispatch, authoritative);
      const decryptedSoftwareKeys = await decryptAllSoftwareKeys(authoritative.keys, encryptionKey);
      const latest = await readAuthoritativeSoftwareKeyState();
      if (
        !softwareKeyStateSnapshotsMatch(authoritative, latest) ||
        !platformUnlockConfigsMatch(expectedPlatformUnlock, latest.platformUnlock)
      ) {
        adoptAuthoritativeSoftwareKeyState(dispatch, latest);
        throw new Error('Software wallet state changed during authentication');
      }
      await initializeWalletSessionWithSoftwareKeys(encryptionKey, decryptedSoftwareKeys);
      identifyAuthenticatedWallet(decryptedSoftwareKeys);
    });
  };
}

function unlockWalletAction(password: string): AppThunk {
  return async (dispatch, getState) => {
    const authoritative = await readAuthoritativeSoftwareKeyState();
    const capabilities = getSnapshotCapabilities(authoritative);
    if (!capabilities.valid || !capabilities.password || authoritative.keys.length === 0) {
      throw new Error("Can't authenticate this wallet with a password");
    }
    adoptAuthoritativeSoftwareKeyState(dispatch, authoritative);
    const salt = authoritative.salt;
    if (salt) {
      const encryptionKey = await deriveEncryptionKey({ password, salt });
      await unlockWalletWithEncryptionKey({ encryptionKey })(dispatch, getState, undefined);
      return;
    }

    await withWalletAuthenticationWriteLock(async () => {
      const latestWallet = await readAuthoritativeWalletTransactionState();
      const latest = latestWallet.softwareKeys;
      if (!softwareKeyStateSnapshotsMatch(authoritative, latest)) {
        adoptAuthoritativeWalletTransactionState(dispatch, latestWallet);
        throw new Error('Software wallet state changed during authentication');
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
      );
      const firstDecryptedResult = decryptedResults[0];
      if (!firstDecryptedResult) throw new Error('Software wallet state is empty');

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
      // salt. Persist that salt and re-encrypted key here, otherwise selectWalletSalt
      // stays undefined and the add-wallet password check (useCheckPassword) can never
      // pass for these users.
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
      const expectedTransaction = reduceWalletTransactionState(
        latestWallet.state,
        transactionActions
      );
      dispatchWalletTransaction(dispatch, transactionActions);
      try {
        await persistor.flush();
      } catch (error) {
        adoptAuthoritativeWalletTransactionState(dispatch, latestWallet);
        try {
          await persistor.flush();
        } catch (rollbackError) {
          void rollbackError;
        }
        throw error;
      }
      const persisted = await readPersistedWalletTransactionStateAfterWrite();
      if (!isDeepEqual(expectedTransaction, persisted.state)) {
        adoptAuthoritativeWalletTransactionState(dispatch, persisted);
        throw new Error('Software wallet migration did not persist');
      }
      await initializeWalletSessionWithSoftwareKeys(reEncrypted.encryptionKey, decryptedResults);
      identifyAuthenticatedWallet(decryptedResults);
    });
  };
}

function addSoftwareWalletWithPassword(
  args: {
    fingerprint: string;
    mnemonic: string;
    password: string;
  } & AccountDiscoveryClients
): AppThunk {
  const { fingerprint, mnemonic, password, leatherApiClient, hiroClient, bnsClient } = args;

  return async dispatch => {
    await withWalletAuthenticationWriteLock(async () => {
      const authoritativeWallet = await readAuthoritativeWalletTransactionState();
      const authoritative = authoritativeWallet.softwareKeys;
      const capabilities = getSnapshotCapabilities(authoritative);
      adoptAuthoritativeWalletTransactionState(dispatch, authoritativeWallet);
      if (
        !capabilities.password ||
        typeof authoritative.salt !== 'string' ||
        authoritative.keys.some(key => key.id === fingerprint) ||
        !!authoritativeWallet.state.wallets.entities[fingerprint]
      ) {
        throw new Error("Can't authenticate this wallet with a password");
      }
      const authentication = await authenticateWithPassword({
        password,
        salt: authoritative.salt,
        softwareKeys: authoritative.keys,
      });
      if (authentication.status === 'failure') {
        throw new Error("The password doesn't match");
      }
      const { encryptedSecretKey } = await encryptMnemonicWithEncryptionKey({
        encryptionKey: authentication.value,
        secretKey: mnemonic,
      });
      const newKey: SoftwareKeyConfig = {
        type: 'software',
        id: fingerprint,
        encryptedSecretKey,
      };
      const latestWallet = await readAuthoritativeWalletTransactionState();
      const latest = latestWallet.softwareKeys;
      if (!softwareKeyStateSnapshotsMatch(authoritative, latest)) {
        adoptAuthoritativeWalletTransactionState(dispatch, latestWallet);
        throw new Error('Software wallet state changed during authentication');
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
      const expectedTransaction = reduceWalletTransactionState(
        latestWallet.state,
        transactionActions
      );
      dispatchWalletTransaction(dispatch, transactionActions);

      try {
        await persistor.flush();
      } catch (error) {
        adoptAuthoritativeWalletTransactionState(dispatch, latestWallet);
        try {
          await persistor.flush();
        } catch (rollbackError) {
          void rollbackError;
        }
        throw error;
      }
      const persisted = await readPersistedWalletTransactionStateAfterWrite();
      if (!walletTransactionStatesMatch(expectedTransaction, persisted.state)) {
        adoptAuthoritativeWalletTransactionState(dispatch, persisted);
        throw new Error('Software wallet did not persist under the authenticated key');
      }
      const decryptedSoftwareKeys = await decryptAllSoftwareKeys(
        persisted.softwareKeys.keys,
        authentication.value
      );
      await initializeWalletSessionWithSoftwareKeys(authentication.value, decryptedSoftwareKeys);
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

function addSoftwareWalletWithEncryptionKey(
  args: {
    encryptionKey: string;
    expectedPlatformUnlock?: PlatformUnlockConfig;
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
    await withWalletAuthenticationWriteLock(async () => {
      const authoritativeWallet = await readAuthoritativeWalletTransactionState();
      const authoritative = authoritativeWallet.softwareKeys;
      const capabilities = getSnapshotCapabilities(authoritative);
      adoptAuthoritativeWalletTransactionState(dispatch, authoritativeWallet);
      if (
        !capabilities.valid ||
        authoritative.keys.length === 0 ||
        authoritative.keys.some(key => key.id === fingerprint) ||
        !!authoritativeWallet.state.wallets.entities[fingerprint] ||
        !platformUnlockConfigsMatch(expectedPlatformUnlock, authoritative.platformUnlock)
      ) {
        throw new Error('Invalid wallet authentication state');
      }
      await decryptAllSoftwareKeys(authoritative.keys, encryptionKey);
      const { encryptedSecretKey } = await encryptMnemonicWithEncryptionKey({
        encryptionKey,
        secretKey: mnemonic,
      });
      const newKey: SoftwareKeyConfig = {
        type: 'software',
        id: fingerprint,
        encryptedSecretKey,
      };
      const latestWallet = await readAuthoritativeWalletTransactionState();
      const latest = latestWallet.softwareKeys;
      if (!softwareKeyStateSnapshotsMatch(authoritative, latest)) {
        adoptAuthoritativeWalletTransactionState(dispatch, latestWallet);
        throw new Error('Software wallet state changed during authentication');
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
      const expectedTransaction = reduceWalletTransactionState(
        latestWallet.state,
        transactionActions
      );
      dispatchWalletTransaction(dispatch, transactionActions);

      try {
        await persistor.flush();
      } catch (error) {
        adoptAuthoritativeWalletTransactionState(dispatch, latestWallet);
        try {
          await persistor.flush();
        } catch (rollbackError) {
          void rollbackError;
        }
        throw error;
      }
      const persisted = await readPersistedWalletTransactionStateAfterWrite();
      if (!walletTransactionStatesMatch(expectedTransaction, persisted.state)) {
        adoptAuthoritativeWalletTransactionState(dispatch, persisted);
        throw new Error('Software wallet did not persist under the authenticated key');
      }
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

function commitBiometricOnlyToPasswordTransition(
  transition: PasswordAuthenticationTransition
): AppThunk {
  return async dispatch => {
    await withWalletAuthenticationWriteLock(async () => {
      const authoritative = await readAuthoritativeSoftwareKeyState();
      const capabilities = getSnapshotCapabilities(authoritative);
      if (
        capabilities.authenticationMode !== 'biometric-only' ||
        !platformUnlockConfigsMatch(
          transition.sourcePlatformUnlock,
          authoritative.platformUnlock
        ) ||
        !softwareKeySnapshotsMatch(transition.sourceKeys, authoritative.keys)
      ) {
        throw new Error('Software wallet state changed during authentication');
      }
      adoptAuthoritativeSoftwareKeyState(dispatch, authoritative);

      dispatch(
        keySlice.actions.biometricOnlyToPasswordTransitionComplete({
          keys: transition.keys,
          platformUnlock: transition.platformUnlock,
          salt: transition.salt,
        })
      );
      try {
        await persistor.flush();
      } catch (error) {
        dispatch(
          keySlice.actions.biometricOnlyToPasswordTransitionRolledBack({
            keys: transition.sourceKeys,
            platformUnlock: transition.sourcePlatformUnlock,
          })
        );
        try {
          await persistor.flush();
        } catch (rollbackError) {
          void rollbackError;
        }
        throw error;
      }

      const persisted = await readPersistedSoftwareKeyStateAfterWrite();
      const persistedCapabilities = getSnapshotCapabilities(persisted);
      if (
        persistedCapabilities.authenticationMode !== 'password' ||
        persisted.salt !== transition.salt ||
        !softwareKeySnapshotsMatch(transition.keys, persisted.keys) ||
        !platformUnlockConfigsMatch(transition.platformUnlock, persisted.platformUnlock)
      ) {
        adoptAuthoritativeSoftwareKeyState(dispatch, persisted);
        throw new Error('Password authentication transition did not persist');
      }
      const decryptedSoftwareKeys = await decryptAllSoftwareKeys(
        persisted.keys,
        transition.encryptionKey
      );
      await initializeWalletSessionWithSoftwareKeys(
        transition.encryptionKey,
        decryptedSoftwareKeys
      );
    });
  };
}

function commitPlatformUnlockChange(change: PlatformUnlockChange): AppThunk {
  return async dispatch => {
    await withWalletAuthenticationWriteLock(async () => {
      const authoritative = await readAuthoritativeSoftwareKeyState();
      const source: SoftwareKeyStateSnapshot = {
        authenticationMode: change.sourceAuthenticationMode,
        keys: change.sourceKeys,
        platformUnlock: change.sourcePlatformUnlock,
        salt: change.sourceSalt,
      };
      if (!softwareKeyStateSnapshotsMatch(source, authoritative)) {
        throw new Error('Software wallet state changed during authentication');
      }
      adoptAuthoritativeSoftwareKeyState(dispatch, authoritative);

      dispatch(keySlice.actions.platformUnlockConfigSaved(change.platformUnlock));
      try {
        await persistor.flush();
      } catch (error) {
        const sourceAuthenticationMode =
          change.sourceAuthenticationMode === 'password' ||
          change.sourceAuthenticationMode === 'biometric-only'
            ? change.sourceAuthenticationMode
            : undefined;
        dispatch(
          keySlice.actions.platformUnlockChangeRolledBack({
            authenticationMode: sourceAuthenticationMode,
            platformUnlock: change.sourcePlatformUnlock,
          })
        );
        try {
          await persistor.flush();
        } catch (rollbackError) {
          void rollbackError;
        }
        throw error;
      }

      const persisted = await readPersistedSoftwareKeyStateAfterWrite();
      const expected = { ...authoritative, platformUnlock: change.platformUnlock };
      if (!softwareKeyStateSnapshotsMatch(expected, persisted)) {
        adoptAuthoritativeSoftwareKeyState(dispatch, persisted);
        throw new Error('Biometric unlock configuration did not persist');
      }
    });
  };
}

function disablePlatformUnlock(): AppThunk {
  return async dispatch => {
    await withWalletAuthenticationWriteLock(async () => {
      const authoritative = await readAuthoritativeSoftwareKeyState();
      const capabilities = getSnapshotCapabilities(authoritative);
      if (
        capabilities.authenticationMode !== 'password' ||
        !capabilities.biometrics ||
        typeof authoritative.salt !== 'string'
      ) {
        throw new Error("Can't disable the only wallet authenticator");
      }
      adoptAuthoritativeSoftwareKeyState(dispatch, authoritative);
      dispatch(keySlice.actions.platformUnlockConfigRemoved());
      try {
        await persistor.flush();
      } catch (error) {
        if (authoritative.platformUnlock) {
          dispatch(keySlice.actions.platformUnlockConfigSaved(authoritative.platformUnlock));
        }
        try {
          await persistor.flush();
        } catch (rollbackError) {
          void rollbackError;
        }
        throw error;
      }
      const persisted = await readPersistedSoftwareKeyStateAfterWrite();
      const expected = { ...authoritative, platformUnlock: undefined };
      if (!softwareKeyStateSnapshotsMatch(expected, persisted)) {
        adoptAuthoritativeSoftwareKeyState(dispatch, persisted);
        throw new Error('Biometric unlock configuration was not removed');
      }
    });
  };
}

export const keyActions = {
  ...keySlice.actions,
  addSoftwareWalletWithEncryptionKey,
  addSoftwareWalletWithPassword,
  commitBiometricOnlyToPasswordTransition,
  commitPlatformUnlockChange,
  createBiometricSoftwareWallet,
  disablePlatformUnlock,
  probeNextAccountAndDiscoverAccounts,
  setWalletEncryptionPassword,
  unlockWalletAction,
  unlockWalletWithEncryptionKey,
};
