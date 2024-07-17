import { useMemo } from 'react';

import {
  makeNativeSegwitAccountDerivationPath,
  makeTaprootAccountDerivationPath,
} from '@leather.io/bitcoin';
import {
  createKeyOriginPath,
  deriveBip39SeedFromMnemonic,
  deriveRootBip32Keychain,
  generateMnemonic,
  getMnemonicRootKeyFingerprint,
} from '@leather.io/crypto';

import { usePersistedStore, useProtectedStore } from '..';
import { findHighestAccountIndexOfFingerprint } from './bitcoin-state-helpers';

export function useKeyStore() {
  const protectedStore = useProtectedStore();
  const persisted = usePersistedStore();

  return useMemo(
    () => ({
      bitcoinAccounts: Object.values(persisted.accounts.bitcoin),
      async generateNewMnemonicPhrase() {
        const mnemonic = generateMnemonic();
        const fingerprint = await getMnemonicRootKeyFingerprint(mnemonic);
        protectedStore.mnemonic.addOne({ id: fingerprint, mnemonic });
      },

      async createNewSoftwareAccountForKeychain(fingerprint: string) {
        const { mnemonic } = protectedStore.mnemonic.entities[fingerprint];
        const rootKeychain = deriveRootBip32Keychain(await deriveBip39SeedFromMnemonic(mnemonic));

        const highestAccountIndex = findHighestAccountIndexOfFingerprint(
          persisted.accounts.bitcoin.entities,
          fingerprint
        );

        const nextAccountIndex = highestAccountIndex + 1;

        //    __       __            _             _
        //   /__\ ___ / _| __ _  ___| |_ ___  _ __(_)_ __   __ _
        //  / \/// _ \ |_ / _` |/ __| __/ _ \| '__| | '_ \ / _` |
        // / _  \  __/  _| (_| | (__| || (_) | |  | | | | | (_| |
        // \/ \_/\___|_|  \__,_|\___|\__\___/|_|  |_|_| |_|\__, |
        //                                                 |___/
        // To support testnet accounts as well

        const nativeSegwitPath = makeNativeSegwitAccountDerivationPath('mainnet', nextAccountIndex);
        const nativeSegwitKeyInfo = createKeyOriginPath(fingerprint, nativeSegwitPath);
        const nativeSegwitKeychain = rootKeychain.derive(nativeSegwitPath);
        const nativeSegwitDescriptor = `[${nativeSegwitKeyInfo}]${nativeSegwitKeychain.publicExtendedKey}`;
        persisted.accounts.bitcoin.addOne({
          type: 'mnemonic',
          id: nativeSegwitKeyInfo,
          descriptor: nativeSegwitDescriptor,
        });

        // use helper fn to get path
        const taprootPath = makeTaprootAccountDerivationPath('mainnet', nextAccountIndex);
        const taprootKeyInfo = createKeyOriginPath(fingerprint, taprootPath);
        const taprootKeychain = rootKeychain.derive(taprootPath);
        const taprootDescriptor = `[${taprootKeyInfo}]${taprootKeychain.publicExtendedKey}`;
        persisted.accounts.bitcoin.addOne({
          type: 'mnemonic',
          id: taprootKeyInfo,
          descriptor: taprootDescriptor,
        });
      },

      removeAccount(fingerprint: string, accountIndex: number) {
        const nativeSegwitAccount =
          persisted.accounts.bitcoin.entities[
            createKeyOriginPath(
              fingerprint,
              makeNativeSegwitAccountDerivationPath('mainnet', accountIndex)
            )
          ];
        persisted.accounts.bitcoin.removeOne(nativeSegwitAccount);
        const taprootAccount =
          persisted.accounts.bitcoin.entities[
            createKeyOriginPath(
              fingerprint,
              makeTaprootAccountDerivationPath('mainnet', accountIndex)
            )
          ];
        persisted.accounts.bitcoin.removeOne(taprootAccount);
      },
    }),
    [protectedStore, persisted]
  );
}
