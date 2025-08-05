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
import { match } from '@leather.io/utils';

import { useAccounts } from './accounts/accounts.read';
import { userTogglesHideAccount } from './accounts/accounts.write';
import { useBitcoinAccounts } from './keychains/bitcoin/bitcoin-keychains.read';
import { userAddsBitcoinKeychain } from './keychains/bitcoin/bitcoin-keychains.write';
import {
  findHighestAccountIndexOfFingerprint,
  findHighestStacksAccountOfFingerprint,
} from './keychains/keychains';
import { useStacksSigners } from './keychains/stacks/stacks-keychains.read';
import { userAddsStacksKeychain } from './keychains/stacks/stacks-keychains.write';
import { mnemonicStore } from './storage-persistors';
import { makeAccountIdentifer, useAppDispatch } from './utils';
import { useWallets } from './wallets/wallets.read';

export type KeychainCreationType = 'stx-only' | 'btc-only' | 'stx-and-btc';

enum KEYCHAIN_ERROR {
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
  const accounts = useAccounts();
  const bitcoinKeychains = useBitcoinAccounts();
  const stacksSigners = useStacksSigners();

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
      const { bitcoinKeychains, stacksKeychains } = await this.deriveAccountKeychains({
        mnemonic,
        passphrase,
      });

      wallets.add({
        action: {
          wallet: { type: 'software', fingerprint, createdOn: new Date().toISOString() },
          withKeychains: {
            bitcoin: bitcoinKeychains,
            stacks: stacksKeychains,
          },
        },
      });
    },

    async createNewAccountOfWallet(fingerprint: string) {
      const { accountIndex, bitcoinKeychains, stacksKeychains } = await this.deriveAccountKeychains(
        { fingerprint }
      );

      accounts.add({
        action: {
          account: { id: makeAccountIdentifer(fingerprint, accountIndex) },
          withKeychains: {
            bitcoin: bitcoinKeychains,
            stacks: stacksKeychains,
          },
        },
      });
    },

    async restoreReadonlyWalletFromMnemonic({
      biometrics,
      mnemonic,
      passphrase,
      type,
    }: {
      mnemonic: string;
      biometrics: boolean;
      passphrase?: string;
      type: KeychainCreationType;
    }) {
      const fingerprint = await getMnemonicRootKeyFingerprint(mnemonic, passphrase);
      if (this.isWalletInKeychain({ fingerprint })) {
        keychainErrorHandlers.throwKeyExistsError();
        return;
      }
      await mnemonicStore(fingerprint).setMnemonic({ mnemonic, biometrics, passphrase });
      const { bitcoinKeychains, stacksKeychains } = await this.deriveAccountKeychains({
        mnemonic,
        passphrase,
      });

      const matchType = match<typeof type>();
      const withKeychains = matchType(type, {
        'btc-only': {
          bitcoin: bitcoinKeychains,
          stacks: stacksKeychains,
        },
        'stx-only': {
          stacks: stacksKeychains,
        },
        'stx-and-btc': {
          bitcoin: bitcoinKeychains,
          stacks: stacksKeychains,
        },
      });

      wallets.addReadonly({
        action: {
          wallet: { type: 'software', fingerprint, createdOn: new Date().toISOString() },
          withKeychains,
        },
      });
    },

    async createNewReadonlyAccountOfWallet(fingerprint: string, type: KeychainCreationType) {
      const { accountIndex, stacksKeychains, bitcoinKeychains } = await this.deriveAccountKeychains(
        {
          fingerprint,
        }
      );

      const matchType = match<typeof type>();
      const withKeychains = matchType(type, {
        'btc-only': {
          bitcoin: bitcoinKeychains,
        },
        'stx-only': {
          stacks: stacksKeychains,
        },
        'stx-and-btc': {
          bitcoin: bitcoinKeychains,
          stacks: stacksKeychains,
        },
      });

      accounts.addReadonly({
        action: {
          account: { id: makeAccountIdentifer(fingerprint, accountIndex) },
          withKeychains,
        },
      });
    },

    async createReadonlyKeychainAtIndex(
      fingerprint: string,
      type: KeychainCreationType,
      atIndex: number
    ) {
      const { stacksKeychains, bitcoinKeychains } = await this.deriveAccountKeychains({
        fingerprint,
        atIndex,
      });

      const matchType = match<typeof type>();

      matchType(type, {
        'btc-only': () => {
          dispatch(userAddsBitcoinKeychain({ bitcoinKeychains }));
          return;
        },
        'stx-only': () => {
          dispatch(userAddsStacksKeychain({ stacksKeychains }));
          return;
        },
        'stx-and-btc': () => {
          dispatch(userAddsBitcoinKeychain({ bitcoinKeychains }));
          dispatch(userAddsStacksKeychain({ stacksKeychains }));
          return;
        },
      })();
    },

    async deriveAccountKeychains(
      props:
        | {
            fingerprint: string;
            atIndex?: number;
          }
        | {
            mnemonic: string;
            passphrase?: string;
            atIndex?: number;
          }
    ) {
      if ('fingerprint' in props) {
        const { mnemonic, passphrase } = await mnemonicStore(props.fingerprint).getMnemonic();
        if (props.atIndex) {
          return this._deriveAccountKeychainsAtIndex({
            mnemonic,
            passphrase,
            atIndex: props.atIndex,
          });
        }
        return this._deriveNextAccountKeychains({
          fingerprint: props.fingerprint,
          mnemonic,
          passphrase,
        });
      }

      if ('mnemonic' in props) {
        if (props.atIndex) {
          return this._deriveAccountKeychainsAtIndex({
            mnemonic: props.mnemonic,
            passphrase: props.passphrase,
            atIndex: props.atIndex,
          });
        }
        return this._deriveNextAccountKeychains({
          fingerprint: await getMnemonicRootKeyFingerprint(props.mnemonic, props.passphrase),
          mnemonic: props.mnemonic,
          passphrase: props.passphrase,
        });
      }
      throw new Error(
        'deriveNextAccountKeychainsFrom have received neither mnemonic nor fingerprint'
      );
    },

    async _deriveNextAccountKeychains({
      fingerprint,
      mnemonic,
      passphrase,
    }: {
      fingerprint: string;
      mnemonic: string;
      passphrase?: string;
    }) {
      const fingerprintAccounts = [
        ...stacksSigners.fromFingerprint(fingerprint),
        ...bitcoinKeychains.fromFingerprint(fingerprint),
      ];

      const highestStacksAccountIndex = findHighestStacksAccountOfFingerprint(
        stacksSigners.list,
        fingerprint
      );
      const highestBitcoinAccountIndex = findHighestAccountIndexOfFingerprint(
        bitcoinKeychains.list,
        fingerprint
      );

      const nextAccountIndex =
        fingerprintAccounts.length === 0
          ? 0
          : Math.max(highestStacksAccountIndex, highestBitcoinAccountIndex) + 1;

      return this._deriveAccountKeychainsAtIndex({
        mnemonic,
        passphrase,
        atIndex: nextAccountIndex,
      });
    },

    async _deriveAccountKeychainsAtIndex({
      mnemonic,
      passphrase,
      atIndex,
    }: {
      mnemonic: string;
      passphrase?: string;
      atIndex: number;
    }) {
      const rootKeychain = deriveRootBip32Keychain(
        await deriveBip39SeedFromMnemonic(mnemonic, passphrase)
      );

      const stacksKeychainDescriptors = [
        { descriptor: stacksRootKeychainToAccountDescriptor(rootKeychain, atIndex) },
      ];

      const bitcoinKeychainDescriptors = [
        makeNativeSegwitAccountDerivationPath('mainnet', atIndex),
        makeNativeSegwitAccountDerivationPath('testnet', atIndex),
        makeTaprootAccountDerivationPath('mainnet', atIndex),
        makeTaprootAccountDerivationPath('testnet', atIndex),
      ].map(path => ({
        descriptor: deriveKeychainExtendedPublicKeyDescriptor(rootKeychain, path),
      }));

      return {
        accountIndex: atIndex,
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
