import {
  makeNativeSegwitAccountDerivationPath,
  makeTaprootAccountDerivationPath,
} from '@leather.io/bitcoin';
import {
  deriveBip39SeedFromMnemonic,
  deriveAccountDescriptor as deriveKeychainDescriptor,
  deriveRootBip32Keychain,
  extractKeyOriginPathFromDescriptor,
  generateMnemonic,
  getMnemonicRootKeyFingerprint,
} from '@leather.io/crypto';

import { removesAccount, userAddsAccount } from './accounts/accounts.slice';
import { useBitcoinKeychains } from './keychains/bitcoin/bitcoin-keychains.slice';
import { findHighestAccountIndexOfFingerprint } from './keychains/keychain-state-helpers';
import { mnemonicStore } from './storage-persistors';
import { makeAccountIdentifer, useAppDispatch } from './utils';
import { useWallets } from './wallets/wallets.slice';

export function useKeyStore() {
  const dispatch = useAppDispatch();
  const wallets = useWallets();
  const bitcoinKeychains = useBitcoinKeychains();

  return {
    async createNewSoftwareWallet() {
      const mnemonic = generateMnemonic();
      return this.restoreWalletFromMnemonic(mnemonic);
    },

    async restoreWalletFromMnemonic(mnemonic: string) {
      const fingerprint = await getMnemonicRootKeyFingerprint(mnemonic);
      await mnemonicStore(fingerprint).setMnemonic(mnemonic);
      const { keychains: bitcoin } = await this.deriveNextAccountBitcoinKeychainsFrom(fingerprint);

      wallets.add({
        wallet: { type: 'software', fingerprint },
        withKeychains: { bitcoin },
      });
    },

    async createNewAccountOfWallet(fingerprint: string) {
      const { accountIndex, keychains: bitcoin } =
        await this.deriveNextAccountBitcoinKeychainsFrom(fingerprint);

      dispatch(
        userAddsAccount({
          account: {
            id: makeAccountIdentifer(fingerprint, accountIndex),
            ofKeychains: bitcoin.map(keychain =>
              extractKeyOriginPathFromDescriptor(keychain.descriptor)
            ),
          },
          withKeychains: { bitcoin },
        })
      );
    },

    async deriveNextAccountBitcoinKeychainsFrom(fingerprint: string) {
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
        fingerprintAccounts.length === 0 ? 0 : highestKeychainAccountIndex + 1;

      const bitcoinKeychainPaths = [
        makeNativeSegwitAccountDerivationPath('mainnet', nextAccountIndex),
        makeNativeSegwitAccountDerivationPath('testnet', nextAccountIndex),
        makeTaprootAccountDerivationPath('mainnet', nextAccountIndex),
        makeTaprootAccountDerivationPath('testnet', nextAccountIndex),
      ];

      return {
        accountIndex: nextAccountIndex,
        keychains: bitcoinKeychainPaths
          .map(path => deriveKeychainDescriptor(rootKeychain, path))
          .map(descriptor => ({ descriptor })),
      };
    },

    removeAccount(fingerprint: string, accountIndex: number) {
      dispatch(removesAccount({ fingerprint, accountIndex }));
    },
  };
}
