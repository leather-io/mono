import {
  makeNativeSegwitAccountDerivationPath,
  makeTaprootAccountDerivationPath,
} from '@leather.io/bitcoin';
import {
  deriveBip39SeedFromMnemonic,
  deriveKeychainExtendedPublicKeyDescriptor,
  deriveRootBip32Keychain,
  generateMnemonic,
  getMnemonicRootKeyFingerprint,
} from '@leather.io/crypto';
import { stacksRootKeychainToAccountDescriptor } from '@leather.io/stacks';

import { userAddsAccount, userTogglesHideAccount } from './accounts/accounts.write';
import { useBitcoinAccounts } from './keychains/bitcoin/bitcoin-keychains.read';
import { findHighestAccountIndexOfFingerprint } from './keychains/keychains';
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

  return {
    createTemporarySoftwareWallet() {
      const mnemonic = generateMnemonic();
      return mnemonic;
    },

    createNewSoftwareWallet() {
      const mnemonic = generateMnemonic();
      return this.restoreWalletFromMnemonic({ mnemonic, biometrics: true });
    },

    isWalletInKeychain({ fingerprint }: { fingerprint: string }) {
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
      if (this.isWalletInKeychain({ fingerprint })) {
        keychainErrorHandlers.throwKeyExistsError();
        return;
      }
      await mnemonicStore(fingerprint).setMnemonic({ mnemonic, biometrics, passphrase });
      const { bitcoinKeychains, stacksKeychains } = await this.deriveNextAccountKeychainsFrom({
        mnemonic,
        passphrase,
      });

      wallets.add({
        wallet: { type: 'software', fingerprint, createdOn: new Date().toISOString() },
        withKeychains: { bitcoin: bitcoinKeychains, stacks: stacksKeychains },
      });
    },

    async createNewAccountOfWallet(fingerprint: string) {
      const { accountIndex, bitcoinKeychains, stacksKeychains } =
        await this.deriveNextAccountKeychainsFrom({ fingerprint });

      dispatch(
        userAddsAccount({
          account: { id: makeAccountIdentifer(fingerprint, accountIndex) },
          withKeychains: {
            bitcoin: bitcoinKeychains,
            stacks: stacksKeychains,
          },
        })
      );
    },

    async deriveNextAccountKeychainsFrom(
      props:
        | {
            fingerprint: string;
          }
        | {
            mnemonic: string;
            passphrase?: string;
          }
    ) {
      if ('fingerprint' in props) {
        const { mnemonic, passphrase } = await mnemonicStore(props.fingerprint).getMnemonic();
        return this.deriveNextAccountKeychainsImpl({
          fingerprint: props.fingerprint,
          mnemonic,
          passphrase,
        });
      }
      if ('mnemonic' in props) {
        return this.deriveNextAccountKeychainsImpl({
          fingerprint: await getMnemonicRootKeyFingerprint(props.mnemonic, props.passphrase),
          mnemonic: props.mnemonic,
          passphrase: props.passphrase,
        });
      }
      throw new Error(
        'deriveNextAccountKeychainsFrom have received neither mnemonic nor fingerprint'
      );
    },

    async deriveNextAccountKeychainsImpl({
      fingerprint,
      mnemonic,
      passphrase,
    }: {
      fingerprint: string;
      mnemonic: string;
      passphrase?: string;
    }) {
      const rootKeychain = deriveRootBip32Keychain(
        await deriveBip39SeedFromMnemonic(mnemonic, passphrase)
      );

      const fingerprintAccounts = bitcoinKeychains.fromFingerprint(fingerprint);

      const highestKeychainAccountIndex = findHighestAccountIndexOfFingerprint(
        bitcoinKeychains.list,
        fingerprint
      );

      const nextAccountIndex =
        fingerprintAccounts.length === 0 ? 0 : highestKeychainAccountIndex + 1;

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
