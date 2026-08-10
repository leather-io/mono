import { base64urlnopad } from '@scure/base';

import {
  type PlatformUnlockConfig,
  generateWalletEncryptionKey,
  unwrapWalletEncryptionKey,
  wrapWalletEncryptionKey,
} from './platform-unlock';

const credential = {
  credentialId: base64urlnopad.encode(new Uint8Array([1, 2, 3, 4])),
  prfInput: base64urlnopad.encode(new Uint8Array(32).fill(5)),
  registrationTag: 'ABC234',
};
const encryptionKey = 'ab'.repeat(48);
const prfOutput = new Uint8Array(32).fill(7);

afterEach(() => {
  vi.restoreAllMocks();
});

async function createConfig() {
  const wrapped = await wrapWalletEncryptionKey({ credential, encryptionKey, prfOutput });
  if (wrapped.status === 'failure') throw new Error('Expected wrapped key');
  return wrapped.value;
}

function mutateEncodedByte(value: string) {
  const bytes = base64urlnopad.decode(value);
  bytes[0] ^= 1;
  return base64urlnopad.encode(bytes);
}

describe(wrapWalletEncryptionKey.name, () => {
  test('generates independent random biometric-only wallet keys', () => {
    const first = generateWalletEncryptionKey();
    const second = generateWalletEncryptionKey();

    expect(first).toMatch(/^[0-9a-f]{96}$/);
    expect(second).toMatch(/^[0-9a-f]{96}$/);
    expect(first).not.toBe(second);
  });

  test('round trips the exact wallet encryption key', async () => {
    const config = await createConfig();

    await expect(unwrapWalletEncryptionKey(config, prfOutput)).resolves.toEqual({
      status: 'success',
      value: encryptionKey,
    });
  });

  test('uses a fresh IV for every wrapper', async () => {
    const first = await createConfig();
    const second = await createConfig();

    expect(first.iv).not.toBe(second.iv);
    expect(first.wrappedEncryptionKey).not.toBe(second.wrappedEncryptionKey);
  });

  test('rejects invalid enrollment material before Web Crypto', async () => {
    await expect(
      wrapWalletEncryptionKey({
        credential: { ...credential, prfInput: '*' },
        encryptionKey,
        prfOutput,
      })
    ).resolves.toEqual({ status: 'failure', code: 'invalid-config' });
    await expect(
      wrapWalletEncryptionKey({ credential, encryptionKey: 'short', prfOutput })
    ).resolves.toEqual({ status: 'failure', code: 'invalid-config' });
  });

  test('reports encryption failures as unavailable rather than authentication failures', async () => {
    vi.spyOn(crypto.subtle, 'encrypt').mockRejectedValue(new Error('Encryption unavailable'));

    await expect(
      wrapWalletEncryptionKey({ credential, encryptionKey, prfOutput })
    ).resolves.toEqual({ status: 'failure', code: 'unavailable' });
  });
});

describe(unwrapWalletEncryptionKey.name, () => {
  test('authenticates ciphertext, IV, credential ID, registration tag, and PRF output', async () => {
    const config = await createConfig();
    const cases: PlatformUnlockConfig[] = [
      { ...config, wrappedEncryptionKey: mutateEncodedByte(config.wrappedEncryptionKey) },
      { ...config, iv: mutateEncodedByte(config.iv) },
      {
        ...config,
        credentialId: base64urlnopad.encode(new Uint8Array([9, 9, 9, 9])),
      },
      { ...config, registrationTag: 'XYZ789' },
    ];

    for (const tampered of cases) {
      await expect(unwrapWalletEncryptionKey(tampered, prfOutput)).resolves.toEqual({
        status: 'failure',
        code: 'authentication-failed',
      });
    }
    await expect(unwrapWalletEncryptionKey(config, new Uint8Array(32).fill(8))).resolves.toEqual({
      status: 'failure',
      code: 'authentication-failed',
    });
  });

  test.each([
    { name: 'invalid base64url', update: { iv: '*' } },
    { name: 'incorrect IV length', update: { iv: base64urlnopad.encode(new Uint8Array(11)) } },
    {
      name: 'incorrect PRF input length',
      update: { prfInput: base64urlnopad.encode(new Uint8Array(31)) },
    },
    { name: 'unknown version', update: { version: 2 } },
  ])('returns invalid config for $name', async ({ update }) => {
    const config = await createConfig();

    await expect(unwrapWalletEncryptionKey({ ...config, ...update }, prfOutput)).resolves.toEqual({
      status: 'failure',
      code: 'invalid-config',
    });
  });
});
