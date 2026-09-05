import type { SoftwareKeyConfig } from '@app/store/software-keys/software-key.slice';

import {
  WalletAuthenticationError,
  authenticateWithPassword,
  authenticateWithPlatformCredential,
  prepareBiometricSoftwareWallet,
  walletAuthenticationFailureFromError,
} from './wallet-authentication';

const mocks = vi.hoisted(() => ({
  createPlatformCredential: vi.fn(),
  decryptAllSoftwareKeys: vi.fn(),
  deriveEncryptionKey: vi.fn(),
  encryptMnemonicWithEncryptionKey: vi.fn(),
  evaluatePlatformCredential: vi.fn(),
  generateWalletEncryptionKey: vi.fn(),
  isPlatformUnlockConfig: vi.fn(),
  unwrapWalletEncryptionKey: vi.fn(),
  wrapWalletEncryptionKey: vi.fn(),
}));

vi.mock('@shared/crypto/generate-encryption-key', () => ({
  deriveEncryptionKey: mocks.deriveEncryptionKey,
}));

vi.mock('@shared/crypto/mnemonic-encryption', () => ({
  encryptMnemonicWithEncryptionKey: mocks.encryptMnemonicWithEncryptionKey,
}));

vi.mock('@shared/crypto/platform-unlock', () => ({
  generateWalletEncryptionKey: mocks.generateWalletEncryptionKey,
  isPlatformUnlockConfig: mocks.isPlatformUnlockConfig,
  unwrapWalletEncryptionKey: mocks.unwrapWalletEncryptionKey,
  wrapWalletEncryptionKey: mocks.wrapWalletEncryptionKey,
}));

vi.mock('@app/store/software-keys/utils', () => ({
  decryptAllSoftwareKeys: mocks.decryptAllSoftwareKeys,
}));

vi.mock('./platform-authenticator', () => ({
  createPlatformCredential: mocks.createPlatformCredential,
  evaluatePlatformCredential: mocks.evaluatePlatformCredential,
}));

const softwareKeys: SoftwareKeyConfig[] = [
  { encryptedSecretKey: 'ciphertext', id: 'wallet', type: 'software' },
];
const platformUnlock = {
  credentialId: 'credential',
  iv: 'iv',
  prfInput: 'input',
  registrationTag: 'ABC234',
  version: 1,
  wrappedEncryptionKey: 'wrapped',
};

describe(authenticateWithPassword.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('returns a derived key only after it decrypts every current wallet', async () => {
    mocks.deriveEncryptionKey.mockResolvedValue('ab'.repeat(48));
    mocks.decryptAllSoftwareKeys.mockResolvedValue([
      { fingerprint: 'wallet', secretKey: 'secret' },
    ]);

    await expect(
      authenticateWithPassword({ password: 'password', salt: 'salt', softwareKeys })
    ).resolves.toEqual({ status: 'success', value: 'ab'.repeat(48) });
    expect(mocks.decryptAllSoftwareKeys).toHaveBeenCalledWith(softwareKeys, 'ab'.repeat(48));
  });

  test('does not return an encryption key when wallet validation fails', async () => {
    mocks.deriveEncryptionKey.mockResolvedValue('ab'.repeat(48));
    mocks.decryptAllSoftwareKeys.mockRejectedValue(new Error('authentication failed'));

    await expect(
      authenticateWithPassword({ password: 'wrong', salt: 'salt', softwareKeys })
    ).resolves.toEqual({ status: 'failure', code: 'invalid-password' });
  });
});

describe(authenticateWithPlatformCredential.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isPlatformUnlockConfig.mockReturnValue(true);
  });

  test('returns a key only after pinned PRF evaluation, unwrap, and wallet validation', async () => {
    const prfOutput = new Uint8Array(32).fill(7);
    mocks.evaluatePlatformCredential.mockResolvedValue({
      status: 'success',
      value: { prfOutput },
    });
    mocks.unwrapWalletEncryptionKey.mockResolvedValue({
      status: 'success',
      value: 'ab'.repeat(48),
    });
    mocks.decryptAllSoftwareKeys.mockResolvedValue([
      { fingerprint: 'wallet', secretKey: 'secret' },
    ]);

    await expect(
      authenticateWithPlatformCredential({ platformUnlock, softwareKeys })
    ).resolves.toEqual({
      status: 'success',
      value: { encryptionKey: 'ab'.repeat(48), platformUnlock },
    });
    expect(prfOutput).toEqual(new Uint8Array(32));
  });

  test('preserves ceremony failures without attempting unwrap', async () => {
    mocks.evaluatePlatformCredential.mockResolvedValue({
      status: 'failure',
      code: 'cancelled-or-timeout',
    });

    await expect(
      authenticateWithPlatformCredential({ platformUnlock, softwareKeys })
    ).resolves.toEqual({ status: 'failure', code: 'cancelled-or-timeout' });
    expect(mocks.unwrapWalletEncryptionKey).not.toHaveBeenCalled();
  });

  test('rejects a wrapper that cannot decrypt every software wallet', async () => {
    mocks.evaluatePlatformCredential.mockResolvedValue({
      status: 'success',
      value: { prfOutput: new Uint8Array(32).fill(7) },
    });
    mocks.unwrapWalletEncryptionKey.mockResolvedValue({
      status: 'success',
      value: 'ab'.repeat(48),
    });
    mocks.decryptAllSoftwareKeys.mockRejectedValue(new Error('authentication failed'));

    await expect(
      authenticateWithPlatformCredential({ platformUnlock, softwareKeys })
    ).resolves.toEqual({ status: 'failure', code: 'wallet-validation-failed' });
  });

  test('clears PRF output when wrapper decryption throws unexpectedly', async () => {
    const prfOutput = new Uint8Array(32).fill(7);
    mocks.evaluatePlatformCredential.mockResolvedValue({
      status: 'success',
      value: { prfOutput },
    });
    mocks.unwrapWalletEncryptionKey.mockRejectedValue(new Error('unexpected unwrap failure'));

    await expect(
      authenticateWithPlatformCredential({ platformUnlock, softwareKeys })
    ).rejects.toThrowError('unexpected unwrap failure');
    expect(prfOutput).toEqual(new Uint8Array(32));
    expect(mocks.decryptAllSoftwareKeys).not.toHaveBeenCalled();
  });
});

describe(prepareBiometricSoftwareWallet.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.generateWalletEncryptionKey.mockReturnValue('ab'.repeat(48));
  });

  test('encrypts the first wallet and clears the PRF output after wrapping', async () => {
    const prfOutput = new Uint8Array(32).fill(7);
    const callOrder: string[] = [];
    mocks.createPlatformCredential.mockImplementation(() => {
      callOrder.push('create-credential');
      return Promise.resolve({
        status: 'success',
        value: {
          credential: platformUnlock,
          followUpRequired: false,
          prfOutput,
        },
      });
    });
    mocks.wrapWalletEncryptionKey.mockResolvedValue({
      status: 'success',
      value: platformUnlock,
    });
    mocks.encryptMnemonicWithEncryptionKey.mockImplementation(() => {
      callOrder.push('encrypt-mnemonic');
      return Promise.resolve({ encryptedSecretKey: 'ciphertext' });
    });

    await expect(
      prepareBiometricSoftwareWallet({ fingerprint: 'wallet', mnemonic: 'secret' })
    ).resolves.toEqual({
      status: 'success',
      value: {
        encryptionKey: 'ab'.repeat(48),
        key: { encryptedSecretKey: 'ciphertext', id: 'wallet', type: 'software' },
        platformUnlock,
      },
    });
    expect(callOrder).toEqual(['encrypt-mnemonic', 'create-credential']);
    expect(prfOutput).toEqual(new Uint8Array(32));
  });

  test('does not create a credential when local mnemonic encryption fails', async () => {
    mocks.encryptMnemonicWithEncryptionKey.mockRejectedValue(new Error('local encryption failed'));

    await expect(
      prepareBiometricSoftwareWallet({ fingerprint: 'wallet', mnemonic: 'secret' })
    ).resolves.toEqual({ status: 'failure', code: 'authentication-failed' });
    expect(mocks.createPlatformCredential).not.toHaveBeenCalled();
    expect(mocks.wrapWalletEncryptionKey).not.toHaveBeenCalled();
  });
});

describe(walletAuthenticationFailureFromError.name, () => {
  test('preserves expected codes and hides unexpected errors', () => {
    expect(
      walletAuthenticationFailureFromError(new WalletAuthenticationError('state-changed'))
    ).toEqual({ status: 'failure', code: 'state-changed' });
    expect(walletAuthenticationFailureFromError(new Error('sensitive detail'))).toEqual({
      status: 'failure',
      code: 'unavailable',
    });
  });
});
