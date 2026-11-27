import { beforeEach, describe, expect, test, vi } from 'vitest';

import * as inMemoryStore from './in-memory-key/in-memory-storage';
import { restoreWalletSession } from './session-restore';

interface FakeState {
  _persist?: { rehydrated: boolean };
  keys: { id: string; encryptedSecretKey: string }[];
}

const fakeStore = vi.hoisted(() => {
  let state: FakeState = { keys: [] };
  const listeners = new Set<() => void>();
  return {
    getState: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setState(next: FakeState) {
      state = next;
      listeners.forEach(listener => listener());
    },
  };
});

vi.mock('@app/store/store', () => ({ store: fakeStore }));

vi.mock('@app/store/software-keys/software-key.selectors', () => ({
  selectSoftwareKeys: (state: FakeState) => state.keys,
}));

vi.mock('@stacks/encryption', () => ({
  decryptMnemonic: vi.fn((encrypted: string) => Promise.resolve(`decrypted ${encrypted}`)),
}));

vi.mock('./in-memory-key/in-memory-storage', () => ({ setKey: vi.fn() }));

const rehydrated: FakeState = {
  _persist: { rehydrated: true },
  keys: [{ id: 'e87a850b', encryptedSecretKey: 'secret' }],
};

describe(restoreWalletSession.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('chrome', {
      storage: { session: { get: vi.fn(() => Promise.resolve({ encryptionKey: 'key' })) } },
    });
  });

  test('restores the keys once the store has rehydrated', async () => {
    fakeStore.setState({ keys: [] });
    const restored = restoreWalletSession();
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(inMemoryStore.setKey).not.toHaveBeenCalled();

    fakeStore.setState(rehydrated);
    await restored;
    expect(inMemoryStore.setKey).toHaveBeenCalledWith('e87a850b', 'decrypted secret');
  });

  test('restores the keys right away when the store is already rehydrated', async () => {
    fakeStore.setState(rehydrated);
    await restoreWalletSession();
    expect(inMemoryStore.setKey).toHaveBeenCalledWith('e87a850b', 'decrypted secret');
  });
});
