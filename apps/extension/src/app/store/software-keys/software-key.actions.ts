import { AddressVersion } from '@stacks/transactions';

import { deriveRootKeychainFromMnemonicSync } from '@leather.io/crypto';
import {
  type BitcoinClient,
  type BnsV2Client,
  BnsV2QueryPrefixes,
  type StacksClient,
  fetchNamesForAddress,
} from '@leather.io/query';
import { fingerprintMigration, userAddsWallet, userRemovesWallet } from '@leather.io/state/wallet';
import { secondsInMs } from '@leather.io/utils';

import { decryptMnemonic, encryptMnemonic } from '@shared/crypto/mnemonic-encryption';
import { logger } from '@shared/logger';
import { broadcastReplayAction, broadcastWalletListChanged } from '@shared/messages';
import { assumedZeroFingerprint } from '@shared/utils';
import { identifyUser } from '@shared/utils/analytics';

import { recurseAccountsForActivity } from '@app/common/account-restoration/account-restore';
import { queryClient } from '@app/common/persistence';
import { AppThunk, persistor } from '@app/store';
import { getWalletSessionKey, initalizeWalletSession } from '@app/store/session-restore';

import { getNativeSegwitMainnetAddressFromRootKeychain } from '../accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { getTaprootMainnetAddressFromRootKeychain } from '../accounts/blockchain/bitcoin/taproot-account.hooks';
import { getStacksAddressByIndex } from '../accounts/blockchain/stacks/stacks-keychain';
import { walletKeyGenerated } from '../active/active.slice';
import { selectStacksChain } from '../chains/stx-chain.selectors';
import { stxChainSlice } from '../chains/stx-chain.slice';
import * as inMemoryStore from '../in-memory-key/in-memory-storage';
import { selectAllWallets, selectWalletEntities } from '../wallets/wallet.selectors';
import { selectSoftwareKeys, selectWalletSalt } from './software-key.selectors';
import { keySlice } from './software-key.slice';
import { checkPassword } from './utils';

interface AccountDiscoveryClients {
  stxClient: StacksClient;
  btcClient: BitcoinClient;
  bnsV2Client: BnsV2Client;
}

interface AccountActivityCheckerArgs extends AccountDiscoveryClients {
  mnemonic: string;
}

const nextAccountProbeInFlight = new Set<string>();
const recursiveDiscoveryInFlight = new Set<string>();
const accountActivityRequestTimeoutMs = secondsInMs(5);

function validHighestAccountIndex(index: number | undefined) {
  return typeof index === 'number' && Number.isInteger(index) && index >= 0 ? index : 0;
}

function createAccountActivityChecker({
  bnsV2Client,
  btcClient,
  mnemonic,
  stxClient,
}: AccountActivityCheckerArgs) {
  const rootKeychain = deriveRootKeychainFromMnemonicSync(mnemonic);
  const deriveStacksAddress = getStacksAddressByIndex(
    rootKeychain,
    AddressVersion.MainnetSingleSig
  );
  const deriveNativeSegwitAddress = getNativeSegwitMainnetAddressFromRootKeychain(rootKeychain);
  const deriveTaprootAddress = getTaprootMainnetAddressFromRootKeychain(rootKeychain);

  async function doesStacksAddressHaveBalance(address: string, signal: AbortSignal) {
    const resp = await stxClient.getStxAddressBalance(address, signal);
    return Number(resp.balance) > 0;
  }

  async function doesStacksAddressHaveBnsName(address: string, signal: AbortSignal) {
    const resp = await fetchNamesForAddress({
      client: bnsV2Client,
      address: address,
      network: 'mainnet',
      signal,
    });
    queryClient.setQueryData([BnsV2QueryPrefixes.GetBnsNamesByAddress, address], resp);
    return resp.names.length > 0;
  }

  async function doesStacksAddressHaveTransactionHistory(address: string, signal: AbortSignal) {
    const resp = await stxClient.getAccountTransactionsWithTransfers(address, signal);
    return resp.total > 0 || resp.results.length > 0;
  }

  async function doesBitcoinAddressHaveBalance(address: string, signal: AbortSignal) {
    const resp = await btcClient.addressApi.getUtxosByAddress(address, signal);
    return resp.length > 0;
  }

  async function doesBitcoinAddressHaveTransactionHistory(address: string, signal: AbortSignal) {
    const resp = await btcClient.addressApi.getTransactionsByAddress(address, signal);
    return resp.length > 0;
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
    const action = stxChainSlice.actions.restoreAccountIndex({ fingerprint, accountIndex });
    dispatch(action);
    void persistor.flush();
    void broadcastReplayAction(action);
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

function setWalletEncryptionPassword(args: {
  password: string;
  mnemonic: string;
  fingerprint: string;
  stxClient: StacksClient;
  btcClient: BitcoinClient;
  bnsV2Client: BnsV2Client;
}): AppThunk {
  const { password, mnemonic, fingerprint, stxClient, btcClient, bnsV2Client } = args;

  return async (dispatch, getState) => {
    const softwareKeys = selectSoftwareKeys(getState());
    const hasSoftwareKeys = softwareKeys.length > 0;

    const existingSalt = hasSoftwareKeys ? selectWalletSalt(getState()) : undefined;

    const existingEncryptionKey = hasSoftwareKeys ? (await getWalletSessionKey()).data : undefined;

    if (hasSoftwareKeys) {
      if (!existingSalt || !existingEncryptionKey)
        throw new Error("Can't find salt or encryption key");

      const isCorrectPassword = await checkPassword({
        password,
        salt: existingSalt,
        encryptionKey: existingEncryptionKey,
      });

      if (!isCorrectPassword) {
        throw new Error("The password doesn't match");
      }
    }

    const { encryptedSecretKey, encryptionKey, salt } = await encryptMnemonic({
      secretKey: mnemonic,
      password,
      existingEncryptionKey,
      existingSalt,
    });

    await initalizeWalletSession(encryptionKey);

    inMemoryStore.setKey(fingerprint, mnemonic);

    // Multi-wallet structure
    dispatch(
      userAddsWallet({
        wallet: {
          createdOn: new Date().toISOString(),
          fingerprint,
          type: 'software',
        },
        accountKeychains: [],
      })
    );

    // Single wallet key slice structure
    dispatch(
      keySlice.actions.createSoftwareWalletComplete({
        salt,
        key: {
          type: 'software',
          id: fingerprint,
          encryptedSecretKey,
        },
      })
    );

    dispatch(walletKeyGenerated(fingerprint));

    await persistor.flush();
    void broadcastWalletListChanged({});

    // Performs a recursive check for account activity. When activity is found
    // at a higher index than what is found on Gaia (long-term wallet users), we
    // update the highest known account index that the wallet generates. This
    // action is performed outside this Promise's execution, as it may be slow,
    // and the user shouldn't have to wait before being directed to homepage.
    startRecursiveAccountDiscovery({
      dispatch,
      doesAddressHaveActivityFn: createAccountActivityChecker({
        bnsV2Client,
        btcClient,
        mnemonic,
        stxClient,
      }),
      fingerprint,
      fromAccountIndex: 0,
    });
  };
}

function unlockWalletAction(password: string): AppThunk {
  return async (dispatch, getState) => {
    const state = getState();
    const salt = selectWalletSalt(state);
    const softwareKeys = selectSoftwareKeys(state);

    const decryptedResults = await Promise.all(
      softwareKeys.map(key =>
        decryptMnemonic({
          password,
          encryptedSecretKey: key.encryptedSecretKey,
          salt,
        })
      )
    );

    function requiresFingerprintMigration() {
      return softwareKeys.length === 1 && softwareKeys[0].id === assumedZeroFingerprint;
    }

    if (requiresFingerprintMigration()) {
      const { fingerprint } = decryptedResults[0];

      dispatch(fingerprintMigration(fingerprint));

      const walletEntities = selectWalletEntities(state);
      const oldWallet = walletEntities[assumedZeroFingerprint];

      if (oldWallet) {
        dispatch(userRemovesWallet({ fingerprint: assumedZeroFingerprint }));
        dispatch(
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
    if (!salt) {
      const reEncrypted = decryptedResults[0];
      dispatch(
        keySlice.actions.softwareKeyReEncrypted({
          salt: reEncrypted.salt,
          key: {
            type: 'software',
            id: reEncrypted.fingerprint,
            encryptedSecretKey: reEncrypted.encryptedSecretKey,
          },
        })
      );
      await persistor.flush();
    }

    await initalizeWalletSession(decryptedResults[0].encryptionKey);

    for (const { fingerprint, secretKey } of decryptedResults) {
      inMemoryStore.setKey(fingerprint, secretKey);
    }

    const firstDecryptedResult = decryptedResults[0];

    if (firstDecryptedResult) {
      const rootKey = deriveRootKeychainFromMnemonicSync(firstDecryptedResult.secretKey);
      if (!rootKey.publicKey) throw new Error('Could not derive root key from mnemonic');
      void identifyUser(rootKey.publicKey);
    }
  };
}

export const keyActions = {
  ...keySlice.actions,
  probeNextAccountAndDiscoverAccounts,
  setWalletEncryptionPassword,
  unlockWalletAction,
};
