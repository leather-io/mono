import { base64urlnopad } from '@scure/base';

import { resetWallet } from '@leather.io/state';
import { userRemovesWallet } from '@leather.io/state/wallet';

import type { PlatformUnlockConfig } from '@shared/crypto/platform-unlock';

import { type SoftwareKeyConfig, keySlice } from './software-key.slice';

const firstKey: SoftwareKeyConfig = {
  encryptedSecretKey: 'first-ciphertext',
  id: 'first',
  type: 'software',
};
const secondKey: SoftwareKeyConfig = {
  encryptedSecretKey: 'second-ciphertext',
  id: 'second',
  type: 'software',
};
const platformUnlock: PlatformUnlockConfig = {
  credentialId: base64urlnopad.encode(new Uint8Array([1, 2, 3])),
  iv: base64urlnopad.encode(new Uint8Array(12).fill(4)),
  prfInput: base64urlnopad.encode(new Uint8Array(32).fill(5)),
  registrationTag: 'ABC234',
  version: 1,
  wrappedEncryptionKey: base64urlnopad.encode(new Uint8Array(112).fill(6)),
};

describe('software key authentication state', () => {
  test('saves a first biometric-only wallet and complete config atomically', () => {
    const state = keySlice.reducer(
      undefined,
      keySlice.actions.createBiometricSoftwareWalletComplete({ key: firstKey, platformUnlock })
    );

    expect(state).toMatchObject({
      authenticationMode: 'biometric-only',
      ids: ['first'],
      platformUnlock,
    });
    expect(state.salt).toBeUndefined();
  });

  test('creates password-only state even when stale platform metadata is present', () => {
    const state = { ...keySlice.getInitialState(), platformUnlock };

    const result = keySlice.reducer(
      state,
      keySlice.actions.createSoftwareWalletComplete({ key: firstKey, salt: 'salt' })
    );

    expect(result.authenticationMode).toBe('password');
    expect(result.salt).toBe('salt');
    expect(result.platformUnlock).toBeUndefined();
  });

  test('does not create biometric-only state over stale authentication metadata', () => {
    const state = { ...keySlice.getInitialState(), salt: 'stale-salt' };

    const result = keySlice.reducer(
      state,
      keySlice.actions.createBiometricSoftwareWalletComplete({ key: firstKey, platformUnlock })
    );

    expect(result).toEqual(state);
  });

  test('preserves authentication state until the last software wallet is removed', () => {
    const firstState = keySlice.reducer(
      undefined,
      keySlice.actions.createSoftwareWalletComplete({ key: firstKey, salt: 'salt' })
    );
    const withSecond = keySlice.reducer(firstState, keySlice.actions.addNewWallet(secondKey));
    const oneRemaining = keySlice.reducer(withSecond, userRemovesWallet({ fingerprint: 'first' }));

    expect(oneRemaining).toMatchObject({
      authenticationMode: 'password',
      ids: ['second'],
      salt: 'salt',
    });

    const empty = keySlice.reducer(oneRemaining, userRemovesWallet({ fingerprint: 'second' }));
    expect(empty.ids).toEqual([]);
    expect(empty.authenticationMode).toBeUndefined();
    expect(empty.platformUnlock).toBeUndefined();
    expect(empty.salt).toBeUndefined();
  });

  test('clears authentication metadata when the wallet resets', () => {
    const state = keySlice.reducer(
      undefined,
      keySlice.actions.createBiometricSoftwareWalletComplete({ key: firstKey, platformUnlock })
    );

    const result = keySlice.reducer(state, resetWallet());

    expect(result.ids).toEqual([]);
    expect(result.authenticationMode).toBeUndefined();
    expect(result.platformUnlock).toBeUndefined();
    expect(result.salt).toBeUndefined();
  });
});
