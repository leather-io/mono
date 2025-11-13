import { AddressVersion } from '@stacks/transactions';

import {
  makeNativeSegwitAccountDerivationPath,
  makeTaprootAccountDerivationPath,
} from '@leather.io/bitcoin';
import {
  deriveKeychainExtendedPublicKeyDescriptor,
  deriveRootKeychainFromMnemonicSync,
  getMnemonicRootKeyFingerprint,
} from '@leather.io/crypto';
import {
  type BitcoinClient,
  type BnsV2Client,
  BnsV2QueryPrefixes,
  type StacksClient,
  fetchNamesForAddress,
} from '@leather.io/query';
import { stacksRootKeychainToAccountDescriptor } from '@leather.io/stacks';
import { userAddsWallet } from '@leather.io/state/wallet';

import { decryptMnemonic, encryptMnemonic } from '@shared/crypto/mnemonic-encryption';
import { logger } from '@shared/logger';
import { defaultWalletKeyId } from '@shared/utils';
import { identifyUser } from '@shared/utils/analytics';

import { recurseAccountsForActivity } from '@app/common/account-restoration/account-restore';
import { queryClient } from '@app/common/persistence';
import { AppThunk } from '@app/store';
import { initalizeWalletSession } from '@app/store/session-restore';

import { getNativeSegwitMainnetAddressFromMnemonic } from '../accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { getStacksAddressByIndex } from '../accounts/blockchain/stacks/stacks-keychain';
import { userSwitchesAccount } from '../active/active.slice';
import { stxChainSlice } from '../chains/stx-chain.slice';
import { selectActiveWalletKey } from '../in-memory-key/in-memory-key.selectors';
import { inMemoryKeySlice } from '../in-memory-key/in-memory-key.slice';
import { selectActiveSoftwareKey, selectWalletSalt } from './software-key.selectors';
import { keySlice } from './software-key.slice';

function setWalletEncryptionPassword(args: {
  password: string;
  stxClient: StacksClient;
  btcClient: BitcoinClient;
  bnsV2Client: BnsV2Client;
}): AppThunk {
  const { password, stxClient, btcClient, bnsV2Client } = args;

  return async (dispatch, getState) => {
    const secretKey = selectActiveWalletKey(getState());
    if (!secretKey) throw new Error('Cannot generate wallet without first having generated a key');

    const { encryptedSecretKey, encryptionKey } = await encryptMnemonic({
      secretKey,
      password,
    });

    await initalizeWalletSession(encryptionKey);

    //
    // Recursive account activity lookup functions
    // -------------------------------------------
    async function doesStacksAddressHaveBalance(address: string) {
      const controller = new AbortController();
      const resp = await stxClient.getStxAddressBalance(address, controller.signal);
      return Number(resp.balance) > 0;
    }

    async function doesStacksAddressHaveBnsName(address: string) {
      const controller = new AbortController();
      const resp = await fetchNamesForAddress({
        client: bnsV2Client,
        address: address,
        network: 'mainnet',
        signal: controller.signal,
      });
      queryClient.setQueryData([BnsV2QueryPrefixes.GetBnsNamesByAddress, address], resp);
      return resp.names.length > 0;
    }

    async function doesBitcoinAddressHaveBalance(address: string) {
      const resp = await btcClient.addressApi.getUtxosByAddress(address);
      return resp.length > 0;
    }

    // Performs a recursive check for account activity. When activity is found
    // at a higher index than what is found on Gaia (long-term wallet users), we
    // update the highest known account index that the wallet generates. This
    // action is performed outside this Promise's execution, as it may be slow,
    // and the user shouldn't have to wait before being directed to homepage.
    logger.info('Initiating recursive account activity lookup');
    try {
      const start = performance.now();

      void recurseAccountsForActivity({
        async doesAddressHaveActivityFn(index) {
          const stxAddress = getStacksAddressByIndex(
            secretKey,
            AddressVersion.MainnetSingleSig
          )(index);
          const hasStxBalance = await doesStacksAddressHaveBalance(stxAddress);
          const hasNames = await doesStacksAddressHaveBnsName(stxAddress);

          const btcAddress = getNativeSegwitMainnetAddressFromMnemonic(secretKey)(index);
          const hasBtcBalance = await doesBitcoinAddressHaveBalance(btcAddress.address!);
          // TODO: add inscription check here also?
          return hasStxBalance || hasNames || hasBtcBalance;
        },
      }).then(recursiveActivityIndex => {
        dispatch(stxChainSlice.actions.restoreAccountIndex(recursiveActivityIndex));
        const end = performance.now();
        logger.info('Found account activity at higher index', {
          recursiveActivityIndex,
          time: (end - start) / 1000 + ' seconds',
        });
      });
    } catch {
      // Errors during account restore are non-critical and can fail silently
    }

    //
    // Derive new wallet accounts for store
    // ------------------------------------
    const rootKeychain = deriveRootKeychainFromMnemonicSync(secretKey);

    const firstStacksAccount = {
      descriptor: stacksRootKeychainToAccountDescriptor(rootKeychain, 0),
      chain: 'stacks',
    } as const;

    const bitcoinKeychainDescriptors = [
      makeNativeSegwitAccountDerivationPath('mainnet', 0),
      makeNativeSegwitAccountDerivationPath('testnet', 0),
      makeTaprootAccountDerivationPath('mainnet', 0),
      makeTaprootAccountDerivationPath('testnet', 0),
    ].map(path => ({
      descriptor: deriveKeychainExtendedPublicKeyDescriptor(rootKeychain, path),
      chain: 'bitcoin' as const,
    }));

    // Multi-wallet structure
    dispatch(
      userAddsWallet({
        wallet: {
          createdOn: new Date().toISOString(),
          fingerprint: getMnemonicRootKeyFingerprint(secretKey),
          type: 'software',
        },
        accountKeychains: [firstStacksAccount, ...bitcoinKeychainDescriptors],
      })
    );

    // Single wallet key slice structure
    dispatch(
      keySlice.actions.createSoftwareWalletComplete({
        type: 'software',
        id: defaultWalletKeyId,
        encryptedSecretKey,
      })
    );
  };
}

function unlockWalletAction(password: string): AppThunk {
  return async (dispatch, getState) => {
    const currentKey = selectActiveSoftwareKey(getState());
    const salt = selectWalletSalt(getState());
    if (!currentKey) return;
    if (currentKey.type !== 'software') return;
    const { secretKey, encryptionKey } = await decryptMnemonic({
      password,
      encryptedSecretKey: currentKey.encryptedSecretKey,
      salt,
    });
    await initalizeWalletSession(encryptionKey);

    const rootKey = deriveRootKeychainFromMnemonicSync(secretKey);
    if (!rootKey.publicKey) throw new Error('Could not derive root key from mnemonic');
    void identifyUser(rootKey.publicKey);

    //
    // MIGRATION AT SIGN IN CODE
    const state = getState();
    const fingerprint = getMnemonicRootKeyFingerprint(secretKey);
    if (!state.active.account) dispatch(userSwitchesAccount({ fingerprint, accountIndex: 0 }));

    dispatch(inMemoryKeySlice.actions.setWalletKeys({ [fingerprint]: secretKey }));
  };
}

export const keyActions = { ...keySlice.actions, setWalletEncryptionPassword, unlockWalletAction };
