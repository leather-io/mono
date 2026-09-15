import { decryptMnemonic as decrypt } from '@stacks/encryption';

import { encryptMnemonicWithEncryptionKey } from './mnemonic-encryption';

vi.mock('./generate-encryption-key', () => ({ deriveEncryptionKey: vi.fn() }));

describe(encryptMnemonicWithEncryptionKey.name, () => {
  test('encrypts with an explicit validated wallet encryption key', async () => {
    const secretKey =
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    const encryptionKey = 'ab'.repeat(48);

    const result = await encryptMnemonicWithEncryptionKey({ encryptionKey, secretKey });

    await expect(decrypt(result.encryptedSecretKey, encryptionKey)).resolves.toBe(secretKey);
  });

  test('rejects an invalid wallet encryption key', async () => {
    await expect(
      encryptMnemonicWithEncryptionKey({ encryptionKey: 'short', secretKey: 'secret' })
    ).rejects.toThrow('Invalid wallet encryption key');
  });
});
