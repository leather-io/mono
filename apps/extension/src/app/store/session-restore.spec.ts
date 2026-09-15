import { restoreWalletSession } from './session-restore';

const mocks = vi.hoisted(() => ({
  bootstrapped: true,
  clearAll: vi.fn(),
  decryptAllSoftwareKeys: vi.fn(),
  getState: vi.fn(),
  persistorSubscribe: vi.fn(),
  selectSoftwareKeys: vi.fn(),
  selectWalletAuthenticationCapabilities: vi.fn(),
  setKey: vi.fn(),
}));

vi.mock('@app/store', () => ({
  persistor: {
    getState: () => ({ bootstrapped: mocks.bootstrapped }),
    subscribe: mocks.persistorSubscribe,
  },
  store: { getState: mocks.getState },
}));
vi.mock('@app/store/software-keys/software-key.selectors', () => ({
  selectSoftwareKeys: mocks.selectSoftwareKeys,
  selectWalletAuthenticationCapabilities: mocks.selectWalletAuthenticationCapabilities,
}));
vi.mock('@app/store/software-keys/utils', () => ({
  decryptAllSoftwareKeys: mocks.decryptAllSoftwareKeys,
}));
vi.mock('./in-memory-key/in-memory-storage', () => ({
  clearAll: mocks.clearAll,
  setKey: mocks.setKey,
}));
vi.mock('@shared/logger', () => ({
  logger: { error: vi.fn() },
}));

describe(restoreWalletSession.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.bootstrapped = true;
    mocks.selectWalletAuthenticationCapabilities.mockReturnValue({
      authenticationMode: 'password',
      biometrics: false,
      password: true,
      valid: true,
    });
    mocks.selectSoftwareKeys.mockReturnValue([
      { encryptedSecretKey: 'ciphertext', id: 'wallet', type: 'software' },
    ]);
  });

  test('waits for persisted state to rehydrate before restoring the session', async () => {
    mocks.bootstrapped = false;
    const persistorListeners: (() => void)[] = [];
    const unsubscribe = vi.fn();
    mocks.persistorSubscribe.mockImplementation(callback => {
      persistorListeners.push(callback);
      return unsubscribe;
    });
    await chrome.storage.session.set({ encryptionKey: 'ef'.repeat(48) });
    mocks.decryptAllSoftwareKeys.mockResolvedValue([
      { fingerprint: 'wallet', secretKey: 'secret' },
    ]);

    const restoration = restoreWalletSession();
    await Promise.resolve();
    await Promise.resolve();

    expect(mocks.selectSoftwareKeys).not.toHaveBeenCalled();
    expect(mocks.decryptAllSoftwareKeys).not.toHaveBeenCalled();
    expect(mocks.clearAll).not.toHaveBeenCalled();

    mocks.bootstrapped = true;
    persistorListeners[0]?.();
    await restoration;

    expect(unsubscribe).toHaveBeenCalledTimes(1);
    expect(mocks.decryptAllSoftwareKeys).toHaveBeenCalledTimes(1);
    expect(mocks.setKey).toHaveBeenCalledWith('wallet', 'secret');
  });

  test('restores in-memory keys only after every wallet decrypts', async () => {
    await chrome.storage.session.set({ encryptionKey: 'ab'.repeat(48) });
    mocks.decryptAllSoftwareKeys.mockResolvedValue([
      { fingerprint: 'first', secretKey: 'first secret' },
      { fingerprint: 'second', secretKey: 'second secret' },
    ]);

    await restoreWalletSession();

    expect(mocks.setKey).toHaveBeenCalledTimes(2);
    expect(mocks.setKey).toHaveBeenNthCalledWith(1, 'first', 'first secret');
    expect(mocks.setKey).toHaveBeenNthCalledWith(2, 'second', 'second secret');
    expect((await chrome.storage.session.get('encryptionKey')).encryptionKey).toBe('ab'.repeat(48));
  });

  test('clears a stale session key without partially restoring memory', async () => {
    await chrome.storage.session.set({ encryptionKey: 'cd'.repeat(48) });
    mocks.decryptAllSoftwareKeys.mockRejectedValue(new Error('authentication failed'));

    await restoreWalletSession();

    expect(mocks.setKey).not.toHaveBeenCalled();
    expect(mocks.clearAll).toHaveBeenCalledTimes(1);
    expect((await chrome.storage.session.get('encryptionKey')).encryptionKey).toBeUndefined();
  });

  test('clears the session when persisted authentication state is invalid', async () => {
    await chrome.storage.session.set({ encryptionKey: 'cd'.repeat(48) });
    mocks.selectWalletAuthenticationCapabilities.mockReturnValue({
      authenticationMode: null,
      biometrics: false,
      password: false,
      valid: false,
    });

    await restoreWalletSession();

    expect(mocks.decryptAllSoftwareKeys).not.toHaveBeenCalled();
    expect(mocks.setKey).not.toHaveBeenCalled();
    expect(mocks.clearAll).toHaveBeenCalledTimes(1);
    expect((await chrome.storage.session.get('encryptionKey')).encryptionKey).toBeUndefined();
  });
});
