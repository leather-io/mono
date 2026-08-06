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

  test('normalizes password wallet creation and preserves a replaceable biometric config', () => {
    const passwordState = keySlice.reducer(
      undefined,
      keySlice.actions.createSoftwareWalletComplete({ key: firstKey, salt: 'salt' })
    );
    const withBiometrics = keySlice.reducer(
      passwordState,
      keySlice.actions.platformUnlockConfigSaved(platformUnlock)
    );
    const replacement = { ...platformUnlock, registrationTag: 'XYZ789' };
    const replaced = keySlice.reducer(
      withBiometrics,
      keySlice.actions.platformUnlockConfigSaved(replacement)
    );

    expect(replaced.authenticationMode).toBe('password');
    expect(replaced.salt).toBe('salt');
    expect(replaced.platformUnlock).toEqual(replacement);
    const removed = keySlice.reducer(replaced, keySlice.actions.platformUnlockConfigRemoved());
    expect(removed.platformUnlock).toBeUndefined();
  });

  test('does not remove the only authenticator from biometric-only state', () => {
    const state = keySlice.reducer(
      undefined,
      keySlice.actions.createBiometricSoftwareWalletComplete({ key: firstKey, platformUnlock })
    );

    const result = keySlice.reducer(state, keySlice.actions.platformUnlockConfigRemoved());

    expect(result).toEqual(state);
  });

  test('restores an absent legacy mode when platform enrollment rolls back', () => {
    const legacyState = keySlice.reducer(
      undefined,
      keySlice.actions.createSoftwareWalletComplete({ key: firstKey, salt: 'salt' })
    );
    const state = { ...legacyState, authenticationMode: undefined };
    const withBiometrics = keySlice.reducer(
      state,
      keySlice.actions.platformUnlockConfigSaved(platformUnlock)
    );

    const result = keySlice.reducer(
      withBiometrics,
      keySlice.actions.platformUnlockChangeRolledBack({ authenticationMode: undefined })
    );

    expect(result.authenticationMode).toBeUndefined();
    expect(result.platformUnlock).toBeUndefined();
    expect(result.salt).toBe('salt');
  });

  test('does not create biometric-only state over stale authentication metadata', () => {
    const state = { ...keySlice.getInitialState(), salt: 'stale-salt' };

    const result = keySlice.reducer(
      state,
      keySlice.actions.createBiometricSoftwareWalletComplete({ key: firstKey, platformUnlock })
    );

    expect(result).toEqual(state);
  });

  test('completes biometric-only to password-backed replacement in one reducer action', () => {
    const state = keySlice.reducer(
      undefined,
      keySlice.actions.createBiometricSoftwareWalletComplete({ key: firstKey, platformUnlock })
    );
    const replacementKey = { ...firstKey, encryptedSecretKey: 'replacement-ciphertext' };

    const result = keySlice.reducer(
      state,
      keySlice.actions.biometricOnlyToPasswordTransitionComplete({
        keys: [replacementKey],
        platformUnlock,
        salt: 'password-salt',
      })
    );

    expect(result.authenticationMode).toBe('password');
    expect(result.salt).toBe('password-salt');
    expect(result.platformUnlock).toEqual(platformUnlock);
    expect(result.entities.first).toEqual(replacementKey);
  });

  test('rejects a transition that does not replace every wallet exactly once', () => {
    const firstState = keySlice.reducer(
      undefined,
      keySlice.actions.createBiometricSoftwareWalletComplete({ key: firstKey, platformUnlock })
    );
    const state = keySlice.reducer(firstState, keySlice.actions.addNewWallet(secondKey));

    const result = keySlice.reducer(
      state,
      keySlice.actions.biometricOnlyToPasswordTransitionComplete({
        keys: [firstKey, firstKey],
        platformUnlock,
        salt: 'password-salt',
      })
    );

    expect(result).toEqual(state);
  });

  test('preserves authentication state until the last software wallet is removed', () => {
    const firstState = keySlice.reducer(
      undefined,
      keySlice.actions.createSoftwareWalletComplete({ key: firstKey, salt: 'salt' })
    );
    const withSecond = keySlice.reducer(firstState, keySlice.actions.addNewWallet(secondKey));
    const withBiometrics = keySlice.reducer(
      withSecond,
      keySlice.actions.platformUnlockConfigSaved(platformUnlock)
    );

    const oneRemaining = keySlice.reducer(
      withBiometrics,
      userRemovesWallet({ fingerprint: 'first' })
    );

    expect(oneRemaining).toMatchObject({
      authenticationMode: 'password',
      ids: ['second'],
      platformUnlock,
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
