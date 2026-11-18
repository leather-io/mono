import { LocalStorageMock } from '@tests/unit/local-storage-mock';
import { vi } from 'vitest';

import { assumedZeroFingerprint } from '@shared/utils';

import type { initialKeysState } from '../software-keys/software-key.slice';
import { migrateVaultReducerStoreToNewStateStructure } from './vault-reducer-migration';

Reflect.set(globalThis, 'localStorage', new LocalStorageMock());

function createEmptyKeysState(): typeof initialKeysState {
  return { ids: [], entities: {} };
}

describe(migrateVaultReducerStoreToNewStateStructure.name, () => {
  describe('no migration needed scenario', () => {
    test('nothing happens when no localStorage values are detected', () => {
      const emptyKeysState = createEmptyKeysState();
      const returnedValue = migrateVaultReducerStoreToNewStateStructure(emptyKeysState);
      expect(returnedValue).toEqual(emptyKeysState);
    });
  });

  describe('migration scenario', () => {
    beforeEach(() => {
      localStorage.setItem('stacks-wallet-salt', 'test-salt');
      localStorage.setItem('stacks-wallet-encrypted-key', 'test-encrypted-key');
    });

    test('that it reads localstorage wallet values', () => {
      const getItemSpy = vi.spyOn(LocalStorageMock.prototype, 'getItem');

      migrateVaultReducerStoreToNewStateStructure(createEmptyKeysState());

      expect(getItemSpy).toHaveBeenCalledWith('stacks-wallet-salt');
      expect(getItemSpy).toHaveBeenCalledWith('stacks-wallet-encrypted-key');
    });

    test('that it returns a migrated state object when wallet values are detected', () => {
      const returnedValue = migrateVaultReducerStoreToNewStateStructure(createEmptyKeysState());
      expect(returnedValue).toEqual({
        ids: [assumedZeroFingerprint],
        entities: {
          [assumedZeroFingerprint]: {
            type: 'software',
            id: assumedZeroFingerprint,
            encryptedSecretKey: 'test-encrypted-key',
            salt: 'test-salt',
          },
        },
      });
    });

    test('it removes the existing localStorage values', () => {
      const removeItemSpy = vi.spyOn(LocalStorageMock.prototype, 'removeItem');
      migrateVaultReducerStoreToNewStateStructure(createEmptyKeysState());
      expect(removeItemSpy).toHaveBeenCalledWith('stacks-wallet-salt');
      expect(removeItemSpy).toHaveBeenCalledWith('stacks-wallet-encrypted-key');
    });
  });
});
