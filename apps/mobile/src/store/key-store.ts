// useStacksClient should be in the query package
import { useStacksClient } from '@/hooks/api-clients.hooks';
import { AddressVersion } from '@stacks/transactions';

import {
  deriveAddressIndexZeroFromAccount,
  deriveNativeSegwitAccountFromRootKeychain,
  getNativeSegwitPaymentFromAddressIndex,
  makeNativeSegwitAccountDerivationPath,
  makeTaprootAccountDerivationPath,
} from '@leather.io/bitcoin';
import {
  deriveBip39SeedFromMnemonic,
  deriveKeychainExtendedPublicKeyDescriptor,
  deriveRootBip32Keychain,
  generateMnemonic,
  getMnemonicRootKeyFingerprint,
  recurseAccountsForActivity,
} from '@leather.io/crypto';
import { useBitcoinClient } from '@leather.io/query';
import { stacksRootKeychainToAccountDescriptor } from '@leather.io/stacks';

import { userAddsAccounts, userTogglesHideAccount } from './accounts/accounts.write';
import { useBitcoinAccounts } from './keychains/bitcoin/bitcoin-keychains.read';
import { findHighestAccountIndexOfFingerprint } from './keychains/keychains';
import { getStacksAddressByIndex } from './keychains/stacks/utils';
import { mnemonicStore } from './storage-persistors';
import { makeAccountIdentifer, useAppDispatch } from './utils';
import { useWallets } from './wallets/wallets.read';

export enum KEYCHAIN_ERROR {
  WALLET_ALREADY_EXISTS = 'WALLET_ALREADY_EXISTS',
}

export const keychainErrorHandlers = {
  throwKeyExistsError() {
    throw new Error(KEYCHAIN_ERROR.WALLET_ALREADY_EXISTS);
  },
  isKeyExistsError(e: unknown) {
    return e instanceof Error && e.message === KEYCHAIN_ERROR.WALLET_ALREADY_EXISTS;
  },
};

export function useKeyStore() {
  const dispatch = useAppDispatch();
  const wallets = useWallets();
  const bitcoinKeychains = useBitcoinAccounts();

  const stxClient = useStacksClient();
  const btcClient = useBitcoinClient();

  return {
    async createTemporarySoftwareWallet() {
      const mnemonic = generateMnemonic();
      return mnemonic;
    },

    async createNewSoftwareWallet() {
      const mnemonic = generateMnemonic();
      return this.restoreWalletFromMnemonic({ mnemonic, biometrics: true });
    },

    async isWalletInKeychain({ fingerprint }: { fingerprint: string }) {
      return !!wallets.list.find(wallet => wallet.fingerprint === fingerprint);
    },
    async restoreWalletFromMnemonic({
      biometrics,
      mnemonic,
      passphrase,
    }: {
      mnemonic: string;
      biometrics: boolean;
      passphrase?: string;
    }) {
      const fingerprint = await getMnemonicRootKeyFingerprint(mnemonic, passphrase);

      if (await this.isWalletInKeychain({ fingerprint })) {
        keychainErrorHandlers.throwKeyExistsError();
        return;
      }
      await mnemonicStore(fingerprint).setMnemonic({ mnemonic, biometrics, passphrase });
      const { bitcoinKeychains, stacksKeychains } =
        await this.deriveNextAccountKeychainsFrom(fingerprint);

      wallets.add({
        wallet: { type: 'software', fingerprint, createdOn: new Date().toISOString() },
        withKeychains: { bitcoin: bitcoinKeychains, stacks: stacksKeychains },
      });
    },
    async createNewAccountOfWallet(fingerprint: string) {
      const { accountIndex, bitcoinKeychains, stacksKeychains } =
        await this.deriveNextAccountKeychainsFrom(fingerprint);

      dispatch(
        userAddsAccounts([
          {
            account: { id: makeAccountIdentifer(fingerprint, accountIndex) },
            withKeychains: {
              bitcoin: bitcoinKeychains,
              stacks: stacksKeychains,
            },
          },
        ])
      );
    },
    async deriveKeychainsForNextAccount(fingerprint: string, nextAccountIndex: number) {
      const { bitcoinKeychains, stacksKeychains } = await this.deriveNextAccountKeychainsFrom(
        fingerprint,
        nextAccountIndex
      );
      return {
        bitcoin: bitcoinKeychains,
        stacks: stacksKeychains,
      };
    },
    async createNewAccountsOfWallet(fingerprint: string, activeAccounts: number) {
      const accountsWithKeychains = await Promise.all(
        Array.from({ length: activeAccounts }, async (_, i) => ({
          account: {
            id: makeAccountIdentifer(fingerprint, i),
          },
          withKeychains: await this.deriveKeychainsForNextAccount(fingerprint, i),
        }))
      );

      dispatch(userAddsAccounts(accountsWithKeychains));
    },

    async deriveNextAccountKeychainsFrom(fingerprint: string, nextAccountInd?: number) {
      const { mnemonic, passphrase } = await mnemonicStore(fingerprint).getMnemonic();

      if (!mnemonic) throw new Error('No mnemonic found for fingerprint ' + fingerprint);

      const rootKeychain = deriveRootBip32Keychain(
        await deriveBip39SeedFromMnemonic(mnemonic, passphrase)
      );

      const fingerprintAccounts = bitcoinKeychains.fromFingerprint(fingerprint);

      const highestKeychainAccountIndex = findHighestAccountIndexOfFingerprint(
        bitcoinKeychains.list,
        fingerprint
      );

      const nextAccountIndex =
        nextAccountInd ?? (fingerprintAccounts.length === 0 ? 0 : highestKeychainAccountIndex + 1);

      // in extension secretKey is the mnemonic
      const secretKey = mnemonic;
      // FIXME move these to queries and get them out of this function which is called often
      async function doesStacksAddressHaveBalance(address: string) {
        const controller = new AbortController();
        const resp = await stxClient.getAccountBalance(address, controller.signal);
        return Number(resp.stx.balance) > 0;
      }
      async function doesBitcoinAddressHaveBalance(address: string) {
        const resp = await btcClient.addressApi.getUtxosByAddress(address);
        return resp.length > 0;
      }

      function getNativeSegwitMainnetAddressFromMnemonic() {
        return (accountIndex: number) => {
          const account = deriveNativeSegwitAccountFromRootKeychain(
            rootKeychain,
            'mainnet'
          )(accountIndex);

          return getNativeSegwitPaymentFromAddressIndex(
            deriveAddressIndexZeroFromAccount(account.keychain),
            'mainnet'
          );
        };
      }
      // FIXME This should be run in restoreWalletFromMnemonic instead as we often need to call deriveNextAccountKeychainsFrom
      try {
        console.log('START: recurseAccountsForActivity', new Date().toISOString());
        void recurseAccountsForActivity({
          async doesAddressHaveActivityFn(index: number) {
            console.log('doesAddressHaveActivityFn', index, new Date().toISOString());
            // seems like it could be better to do this with useQueries for batches of accountIndexes
            const stxAddress = getStacksAddressByIndex(
              secretKey,
              AddressVersion.MainnetSingleSig
            )(index);
            // FIXME: we call doesStacksAddressHaveBalance which calls stacks client directly not using react query
            const hasStxBalance = await doesStacksAddressHaveBalance(stxAddress);
            // PETE - roll this back then apply stash and leave it run again to see if it does update

            // leave for like 10 minutes
            // FIXME: - refactor this to use new queries
            const btcAddress = getNativeSegwitMainnetAddressFromMnemonic()(index);
            const hasBtcBalance = await doesBitcoinAddressHaveBalance(btcAddress.address!);
            return hasStxBalance || hasBtcBalance;
          },
        }).then((activeAccounts: number) => {
          console.log('End: recurseAccountsForActivity', new Date().toISOString());

          return void this.createNewAccountsOfWallet(fingerprint, activeAccounts);
        });
      } catch {}

      const stacksKeychainDescriptors = [
        { descriptor: stacksRootKeychainToAccountDescriptor(rootKeychain, nextAccountIndex) },
      ];

      const bitcoinKeychainDescriptors = [
        makeNativeSegwitAccountDerivationPath('mainnet', nextAccountIndex),
        makeNativeSegwitAccountDerivationPath('testnet', nextAccountIndex),
        makeTaprootAccountDerivationPath('mainnet', nextAccountIndex),
        makeTaprootAccountDerivationPath('testnet', nextAccountIndex),
      ].map(path => ({
        descriptor: deriveKeychainExtendedPublicKeyDescriptor(rootKeychain, path),
      }));

      return {
        accountIndex: nextAccountIndex,
        bitcoinKeychains: bitcoinKeychainDescriptors,
        stacksKeychains: stacksKeychainDescriptors,
      };
    },

    hideAccount(fingerprint: string, accountIndex: number) {
      dispatch(
        userTogglesHideAccount({ accountId: makeAccountIdentifer(fingerprint, accountIndex) })
      );
    },
  };
}
