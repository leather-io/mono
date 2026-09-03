import { bytesToHex } from '@stacks/common';
import { encryptMnemonic } from '@stacks/encryption';

import type { SoftwareKeyConfig } from './software-key.slice';
import { decryptAllSoftwareKeys } from './utils';

const encryptionKey = 'ab'.repeat(48);

async function encrypt(secretKey: string) {
  return bytesToHex(await encryptMnemonic(secretKey, encryptionKey));
}

describe(decryptAllSoftwareKeys.name, () => {
  test('decrypts every software key and preserves its fingerprint', async () => {
    const firstSecretKey =
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    const secondSecretKey =
      'legal winner thank year wave sausage worth useful legal winner thank yellow';
    const softwareKeys: SoftwareKeyConfig[] = [
      { encryptedSecretKey: await encrypt(firstSecretKey), id: 'first', type: 'software' },
      { encryptedSecretKey: await encrypt(secondSecretKey), id: 'second', type: 'software' },
    ];

    await expect(decryptAllSoftwareKeys(softwareKeys, encryptionKey)).resolves.toEqual([
      { fingerprint: 'first', secretKey: firstSecretKey },
      { fingerprint: 'second', secretKey: secondSecretKey },
    ]);
  });

  test('rejects a wrong key without returning a partial result', async () => {
    const softwareKeys: SoftwareKeyConfig[] = [
      {
        encryptedSecretKey: await encrypt(
          'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
        ),
        id: 'first',
        type: 'software',
      },
      {
        encryptedSecretKey: await encrypt(
          'legal winner thank year wave sausage worth useful legal winner thank yellow'
        ),
        id: 'second',
        type: 'software',
      },
    ];

    await expect(decryptAllSoftwareKeys(softwareKeys, 'cd'.repeat(48))).rejects.toThrow();
  });
});
