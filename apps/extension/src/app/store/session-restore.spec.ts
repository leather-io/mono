import { restoreWalletSession } from './session-restore';

const mocks = vi.hoisted(() => ({
  clearAll: vi.fn(),
  decryptAllSoftwareKeys: vi.fn(),
  getState: vi.fn(),
  selectSoftwareKeys: vi.fn(),
  setKey: vi.fn(),
}));

vi.mock('@app/store', () => ({ store: { getState: mocks.getState } }));
vi.mock('@app/store/software-keys/software-key.selectors', () => ({
  selectSoftwareKeys: mocks.selectSoftwareKeys,
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
    mocks.selectSoftwareKeys.mockReturnValue([
      { encryptedSecretKey: 'ciphertext', id: 'wallet', type: 'software' },
    ]);
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
});
