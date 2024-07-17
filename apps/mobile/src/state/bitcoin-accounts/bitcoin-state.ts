import { useMemo } from 'react';

import {
  makeNativeSegwitAccountDerivationPath,
  makeTaprootAccountDerivationPath,
} from '@leather.io/bitcoin';
import {
  createKeyOriginFromPath,
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

        const nativeSegwitPath = makeNativeSegwitAccountDerivationPath('mainnet', nextAccountIndex);
        const nativeSegwitKeyInfo = createKeyOriginFromPath(nativeSegwitPath, fingerprint);
        const nativeSegwitKeychain = rootKeychain.derive(nativeSegwitPath);
        const nativeSegwitPolicy = `[${nativeSegwitKeyInfo}]${nativeSegwitKeychain.publicExtendedKey}`;
        persisted.accounts.bitcoin.addOne({
          type: 'mnemonic',
          id: nativeSegwitKeyInfo,
          policy: nativeSegwitPolicy,
        });

        // use helper fn to get path
        const taprootPath = makeTaprootAccountDerivationPath('mainnet', nextAccountIndex);
        const taprootKeyInfo = createKeyOriginFromPath(taprootPath, fingerprint);
        const taprootKeychain = rootKeychain.derive(taprootPath);
        const taprootPolicy = `[${taprootKeyInfo}]${taprootKeychain.publicExtendedKey}`;
        persisted.accounts.bitcoin.addOne({
          type: 'mnemonic',
          id: taprootKeyInfo,
          policy: taprootPolicy,
        });
      },
    }),
    [protectedStore, persisted]
  );
}
