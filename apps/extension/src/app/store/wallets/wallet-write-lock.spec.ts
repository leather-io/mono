import { withWalletWriteLock } from './wallet-write-lock';

describe(withWalletWriteLock.name, () => {
  test('uses the existing cross-context wallet authentication lock', async () => {
    const operation = vi.fn().mockResolvedValue('result');
    const request = vi.fn(async (_name: string, callback: () => Promise<string>) => callback());
    vi.stubGlobal('navigator', { locks: { request } });

    try {
      await expect(withWalletWriteLock(operation)).resolves.toBe('result');
    } finally {
      vi.unstubAllGlobals();
    }

    expect(request).toHaveBeenCalledWith('leather:wallet-authentication-write', operation);
  });
});
