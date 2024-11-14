import { useStxBalance } from '@/queries/balance/stacks-balance.query';
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
      void this.checkForActivityAndCreateAccounts(fingerprint, mnemonic, passphrase);
    },
    async checkForActivityAndCreateAccounts(
      fingerprint: string,
      mnemonic: string,
      passphrase?: string
    ) {
      async function doesStacksAddressHaveBalance(address: string) {
        const { availableBalance } = useStxBalance([address]);
        return Number(availableBalance) > 0;
      }
      async function doesBitcoinAddressHaveBalance(address: string) {
        const resp = await btcClient.addressApi.getUtxosByAddress(address);
        return resp.length > 0;
      }

      const rootKeychain = deriveRootBip32Keychain(
        await deriveBip39SeedFromMnemonic(mnemonic, passphrase)
      );

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
      try {
        void recurseAccountsForActivity({
          async doesAddressHaveActivityFn(index: number) {
            // seems like it could be better to do this with useQueries for batches of accountIndexes
            const rootKeychain = deriveRootBip32Keychain(
              await deriveBip39SeedFromMnemonic(mnemonic, passphrase)
            );

            const stxAddress = getStacksAddressByIndex(
              rootKeychain,
              AddressVersion.MainnetSingleSig
            )(index);

            const hasStxBalance = await doesStacksAddressHaveBalance(stxAddress);
            // FIXME: new BTC balance query works off account not address
            const btcAddress = getNativeSegwitMainnetAddressFromMnemonic()(index);
            const hasBtcBalance = await doesBitcoinAddressHaveBalance(btcAddress.address!);
            // TODO: add new BNS checks here
            return hasStxBalance || hasBtcBalance;
          },
        }).then(
          // TODO: Actual account creation is slow so maybe we can limit it to 10 accounts at a time?
          (activeAccounts: number) =>
            void this.createNewAccountsOfWallet(fingerprint, activeAccounts)
        );
      } catch {}
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
      // console.log('createNewAccountsOfWallet', new Date().toISOString());
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
