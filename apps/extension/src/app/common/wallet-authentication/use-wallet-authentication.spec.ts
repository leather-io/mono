import { createElement } from 'react';
import { renderToString } from 'react-dom/server';

import type { SoftwareKeyConfig } from '@app/store/software-keys/software-key.slice';

import { authenticateWithPassword, useWalletAuthentication } from './use-wallet-authentication';

const mocks = vi.hoisted(() => ({
  decryptAllSoftwareKeys: vi.fn(),
  deriveEncryptionKey: vi.fn(),
  encryptMnemonicWithEncryptionKey: vi.fn(),
  evaluatePlatformCredential: vi.fn(),
  generateRandomHexString: vi.fn(),
  dispatch: vi.fn(),
  useSelector: vi.fn(),
  unwrapWalletEncryptionKey: vi.fn(),
  wrapWalletEncryptionKey: vi.fn(),
}));

vi.mock('@shared/crypto/generate-encryption-key', () => ({
  deriveEncryptionKey: mocks.deriveEncryptionKey,
}));
vi.mock('@shared/crypto/platform-unlock', () => ({
  isPlatformUnlockConfig: vi.fn(() => true),
  unwrapWalletEncryptionKey: mocks.unwrapWalletEncryptionKey,
  wrapWalletEncryptionKey: mocks.wrapWalletEncryptionKey,
}));
vi.mock('@shared/crypto/generate-random-hex', () => ({
  generateRandomHexString: mocks.generateRandomHexString,
}));
vi.mock('@shared/crypto/mnemonic-encryption', () => ({
  encryptMnemonicWithEncryptionKey: mocks.encryptMnemonicWithEncryptionKey,
}));
vi.mock('./platform-authenticator', () => ({
  createPlatformCredential: vi.fn(),
  evaluatePlatformCredential: mocks.evaluatePlatformCredential,
}));
vi.mock('@app/store/software-keys/utils', () => ({
  decryptAllSoftwareKeys: mocks.decryptAllSoftwareKeys,
}));
vi.mock('react-redux', () => ({
  useDispatch: () => mocks.dispatch,
  useSelector: mocks.useSelector,
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

function renderBiometricOnlyWalletAuthentication() {
  let walletAuthentication: ReturnType<typeof useWalletAuthentication> | undefined;
  mocks.useSelector.mockReturnValueOnce({
    authenticationMode: 'biometric-only',
    biometrics: true,
    password: false,
    valid: true,
  });

  function WalletAuthenticationHarness() {
    walletAuthentication = useWalletAuthentication();
    return null;
  }

  renderToString(createElement(WalletAuthenticationHarness));
  if (!walletAuthentication) throw new Error('Wallet authentication hook did not render');
  return walletAuthentication;
}

async function persistBiometricOnlyState(
  currentPlatformUnlock = platformUnlock,
  currentSoftwareKeys = softwareKeys
) {
  await chrome.storage.local.set({
    'persist:root': {
      softwareKeys: {
        authenticationMode: 'biometric-only',
        ids: currentSoftwareKeys.map(key => key.id),
        entities: Object.fromEntries(currentSoftwareKeys.map(key => [key.id, key])),
        platformUnlock: currentPlatformUnlock,
      },
    },
  });
}

describe(authenticateWithPassword.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('returns a derived key only after it decrypts every current wallet', async () => {
    mocks.deriveEncryptionKey.mockResolvedValue('ab'.repeat(48));
    mocks.decryptAllSoftwareKeys.mockResolvedValue([
      { fingerprint: 'wallet', secretKey: 'secret' },
    ]);

    const result = await authenticateWithPassword({
      password: 'password',
      salt: 'salt',
      softwareKeys: [...softwareKeys],
    });

    expect(result).toEqual({ status: 'success', value: 'ab'.repeat(48) });
    expect(mocks.decryptAllSoftwareKeys).toHaveBeenCalledWith([...softwareKeys], 'ab'.repeat(48));
  });

  test('does not return an encryption key when wallet validation fails', async () => {
    mocks.deriveEncryptionKey.mockResolvedValue('ab'.repeat(48));
    mocks.decryptAllSoftwareKeys.mockRejectedValue(new Error('authentication failed'));

    await expect(
      authenticateWithPassword({ password: 'wrong', salt: 'salt', softwareKeys: [...softwareKeys] })
    ).resolves.toEqual({ status: 'failure', code: 'invalid-password' });
  });
});

describe('biometric wallet authentication', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await chrome.storage.local.clear();
    await persistBiometricOnlyState();
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

    const result =
      await renderBiometricOnlyWalletAuthentication().authenticateWithPlatformCredential();

    expect(result).toEqual({
      status: 'success',
      value: { encryptionKey: 'ab'.repeat(48), platformUnlock },
    });
    expect(mocks.evaluatePlatformCredential).toHaveBeenCalledWith(platformUnlock);
    expect(mocks.unwrapWalletEncryptionKey).toHaveBeenCalledWith(platformUnlock, prfOutput);
    expect(mocks.decryptAllSoftwareKeys).toHaveBeenCalledWith([...softwareKeys], 'ab'.repeat(48));
    expect(prfOutput).toEqual(new Uint8Array(32));
  });

  test('preserves expected ceremony failure results without attempting unwrap', async () => {
    mocks.evaluatePlatformCredential.mockResolvedValue({
      status: 'failure',
      code: 'cancelled-or-timeout',
    });

    await expect(
      renderBiometricOnlyWalletAuthentication().authenticateWithPlatformCredential()
    ).resolves.toEqual({ status: 'failure', code: 'cancelled-or-timeout' });
    expect(mocks.unwrapWalletEncryptionKey).not.toHaveBeenCalled();
  });

  test('rejects a wrapper that cannot decrypt the current software-wallet state', async () => {
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
      renderBiometricOnlyWalletAuthentication().authenticateWithPlatformCredential()
    ).resolves.toEqual({ status: 'failure', code: 'wallet-validation-failed' });
  });

  test('repairs a stale frame from the persisted credential before starting a ceremony', async () => {
    const currentPlatformUnlock = { ...platformUnlock, iv: 'current-iv' };
    const currentSoftwareKeys: SoftwareKeyConfig[] = [
      { encryptedSecretKey: 'current-ciphertext', id: 'wallet', type: 'software' },
    ];
    await persistBiometricOnlyState(currentPlatformUnlock, currentSoftwareKeys);
    const prfOutput = new Uint8Array(32).fill(7);
    mocks.evaluatePlatformCredential.mockResolvedValue({ status: 'success', value: { prfOutput } });
    mocks.unwrapWalletEncryptionKey.mockResolvedValue({
      status: 'success',
      value: 'ab'.repeat(48),
    });
    mocks.decryptAllSoftwareKeys.mockResolvedValue([
      { fingerprint: 'wallet', secretKey: 'secret' },
    ]);

    await renderBiometricOnlyWalletAuthentication().authenticateWithPlatformCredential();

    expect(mocks.evaluatePlatformCredential).toHaveBeenCalledWith(currentPlatformUnlock);
    expect(mocks.decryptAllSoftwareKeys).toHaveBeenCalledWith(currentSoftwareKeys, 'ab'.repeat(48));
    expect(mocks.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'storageSync/hydrateSlicesFromStorage' })
    );
  });
});

describe('biometric-only to password transition', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await chrome.storage.local.clear();
    await persistBiometricOnlyState();
  });

  test('prepares all ciphertext, password metadata, and a biometric rewrap before commit', async () => {
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
      { fingerprint: 'first', secretKey: 'first secret' },
      { fingerprint: 'second', secretKey: 'second secret' },
    ]);
    mocks.generateRandomHexString.mockReturnValue('salt');
    mocks.deriveEncryptionKey.mockResolvedValue('cd'.repeat(48));
    mocks.encryptMnemonicWithEncryptionKey
      .mockResolvedValueOnce({ encryptedSecretKey: 'first ciphertext' })
      .mockResolvedValueOnce({ encryptedSecretKey: 'second ciphertext' });
    const replacementConfig = { ...platformUnlock, iv: 'replacement iv' };
    mocks.wrapWalletEncryptionKey.mockResolvedValue({
      status: 'success',
      value: replacementConfig,
    });

    const result =
      await renderBiometricOnlyWalletAuthentication().prepareBiometricOnlyToPasswordTransition(
        'new password'
      );

    expect(result).toEqual({
      status: 'success',
      value: {
        encryptionKey: 'cd'.repeat(48),
        keys: [
          { encryptedSecretKey: 'first ciphertext', id: 'first', type: 'software' },
          { encryptedSecretKey: 'second ciphertext', id: 'second', type: 'software' },
        ],
        platformUnlock: replacementConfig,
        salt: 'salt',
        sourceKeys: softwareKeys,
        sourcePlatformUnlock: platformUnlock,
      },
    });
    expect(mocks.wrapWalletEncryptionKey).toHaveBeenCalledWith({
      credential: {
        credentialId: platformUnlock.credentialId,
        prfInput: platformUnlock.prfInput,
        registrationTag: platformUnlock.registrationTag,
      },
      encryptionKey: 'cd'.repeat(48),
      prfOutput,
    });
    expect(prfOutput).toEqual(new Uint8Array(32));
  });

  test('does not derive or encrypt when current biometric proof cannot validate every wallet', async () => {
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
      renderBiometricOnlyWalletAuthentication().prepareBiometricOnlyToPasswordTransition(
        'new password'
      )
    ).resolves.toEqual({ status: 'failure', code: 'wallet-validation-failed' });
    expect(mocks.deriveEncryptionKey).not.toHaveBeenCalled();
    expect(mocks.encryptMnemonicWithEncryptionKey).not.toHaveBeenCalled();
  });

  test('starts a fresh biometric ceremony when a failed password transition is retried', async () => {
    const prfOutput = new Uint8Array(32).fill(7);
    mocks.evaluatePlatformCredential
      .mockResolvedValueOnce({ status: 'failure', code: 'cancelled-or-timeout' })
      .mockResolvedValueOnce({ status: 'success', value: { prfOutput } });
    mocks.unwrapWalletEncryptionKey.mockResolvedValue({
      status: 'success',
      value: 'ab'.repeat(48),
    });
    mocks.decryptAllSoftwareKeys.mockResolvedValue([
      { fingerprint: 'wallet', secretKey: 'secret' },
    ]);
    mocks.generateRandomHexString.mockReturnValue('salt');
    mocks.deriveEncryptionKey.mockResolvedValue('cd'.repeat(48));
    mocks.encryptMnemonicWithEncryptionKey.mockResolvedValue({
      encryptedSecretKey: 'password-ciphertext',
    });
    mocks.wrapWalletEncryptionKey.mockResolvedValue({
      status: 'success',
      value: { ...platformUnlock, iv: 'replacement-iv' },
    });
    const walletAuthentication = renderBiometricOnlyWalletAuthentication();

    await expect(
      walletAuthentication.prepareBiometricOnlyToPasswordTransition('new password')
    ).resolves.toEqual({ status: 'failure', code: 'cancelled-or-timeout' });
    await expect(
      walletAuthentication.prepareBiometricOnlyToPasswordTransition('new password')
    ).resolves.toMatchObject({ status: 'success' });

    expect(mocks.evaluatePlatformCredential).toHaveBeenCalledTimes(2);
    expect(prfOutput).toEqual(new Uint8Array(32));
  });
});
