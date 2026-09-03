import { createElement } from 'react';
import { renderToString } from 'react-dom/server';

import { base64urlnopad } from '@scure/base';

import type { SoftwareKeyConfig } from '@app/store/software-keys/software-key.slice';

import { useWalletAuthentication } from './use-wallet-authentication';

const mocks = vi.hoisted(() => ({
  authenticateWithPlatformCredential: vi.fn(),
  dispatch: vi.fn(),
  useSelector: vi.fn(),
}));

vi.mock('./wallet-authentication', () => ({
  authenticateWithPlatformCredential: mocks.authenticateWithPlatformCredential,
}));

vi.mock('react-redux', () => ({
  useDispatch: () => mocks.dispatch,
  useSelector: mocks.useSelector,
}));

const softwareKeys: SoftwareKeyConfig[] = [
  { encryptedSecretKey: 'ciphertext', id: 'wallet', type: 'software' },
];
const platformUnlock = {
  credentialId: base64urlnopad.encode(new Uint8Array([1, 2, 3])),
  iv: base64urlnopad.encode(new Uint8Array(12).fill(4)),
  prfInput: base64urlnopad.encode(new Uint8Array(32).fill(5)),
  registrationTag: 'ABC234',
  version: 1,
  wrappedEncryptionKey: base64urlnopad.encode(new Uint8Array(112).fill(6)),
};

function renderWalletAuthentication() {
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

describe(useWalletAuthentication.name, () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await chrome.storage.local.clear();
    await persistBiometricOnlyState();
  });

  test('authenticates with the current persisted credential and repairs a stale frame', async () => {
    const currentPlatformUnlock = {
      ...platformUnlock,
      iv: base64urlnopad.encode(new Uint8Array(12).fill(7)),
    };
    const currentSoftwareKeys: SoftwareKeyConfig[] = [
      { encryptedSecretKey: 'current-ciphertext', id: 'wallet', type: 'software' },
    ];
    await persistBiometricOnlyState(currentPlatformUnlock, currentSoftwareKeys);
    mocks.authenticateWithPlatformCredential.mockResolvedValue({
      status: 'success',
      value: { encryptionKey: 'ab'.repeat(48), platformUnlock: currentPlatformUnlock },
    });

    const result = await renderWalletAuthentication().authenticateWithPlatformCredential();

    expect(result).toMatchObject({ status: 'success' });
    expect(mocks.authenticateWithPlatformCredential).toHaveBeenCalledWith({
      platformUnlock: currentPlatformUnlock,
      softwareKeys: currentSoftwareKeys,
    });
    expect(mocks.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'storageSync/hydrateSlicesFromStorage' })
    );
  });

  test('fails closed before a ceremony when persisted authentication state is invalid', async () => {
    await chrome.storage.local.set({
      'persist:root': {
        softwareKeys: {
          authenticationMode: 'biometric-only',
          ids: softwareKeys.map(key => key.id),
          entities: Object.fromEntries(softwareKeys.map(key => [key.id, key])),
        },
      },
    });

    await expect(
      renderWalletAuthentication().authenticateWithPlatformCredential()
    ).resolves.toEqual({ status: 'failure', code: 'invalid-config' });
    expect(mocks.authenticateWithPlatformCredential).not.toHaveBeenCalled();
  });
});
