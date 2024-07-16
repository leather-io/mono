import { useMemo } from 'react';

import { create } from 'zustand';

import {
  deriveBip39SeedFromMnemonic,
  deriveRootBip32Keychain,
  generateMnemonic,
  getMnemonicRootKeyFingerprint,
} from '@leather.io/crypto';

import { PersistedStore, createPersistedStore } from './persisted';
import { ProtectedStore, createProtectedStore } from './protected';
import { SessionStore, createSessionStore } from './session';

export const usePersistedStore = create<PersistedStore>()(createPersistedStore);
export const useProtectedStore = create<ProtectedStore>()(createProtectedStore);
export const useSessionStore = create<SessionStore>()(createSessionStore);

export function useKeyStore() {
  const protectedStore = useProtectedStore();
  const persisted = usePersistedStore();

  return useMemo(
    () => ({
      generateNewMnemonicPhrase() {
        const mnemonic = generateMnemonic();
        const fingerprint = getMnemonicRootKeyFingerprint(mnemonic);
        protectedStore.mnemonic.addOne({ id: fingerprint, mnemonic });
      },
      createNewAccountForKeychain(fingerprint: string) {
        const { mnemonic } = protectedStore.mnemonic.entities[fingerprint];
        const path = `m/84'/0'/2'`;
        const id = `${fingerprint}/${path.replace('m/', '')}`;
        const keychain = deriveRootBip32Keychain(deriveBip39SeedFromMnemonic(mnemonic));
        const keyInfo = `[${id}]${keychain.publicExtendedKey}`;
        persisted.accounts.bitcoin.addOne({ id, policy: keyInfo, type: 'mnemonic' });
      },
    }),
    [protectedStore, persisted]
  );
}
