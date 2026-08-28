import { describe, expect, test } from 'vitest';

import { isSecureStoreUserCancelledError } from './secure-store-errors';

describe(isSecureStoreUserCancelledError.name, () => {
  test('matches the iOS keychain user cancel', () => {
    expect(isSecureStoreUserCancelledError(new Error('User canceled the operation.'))).toBe(true);
  });

  test('matches the iOS cancel wrapped by the expo module rejection', () => {
    const error = new Error(
      "Call to function 'ExpoSecureStore.getValueWithKeyAsync' has been rejected.\n→ Caused by: User canceled the operation."
    );
    expect(isSecureStoreUserCancelledError(error)).toBe(true);
  });

  test('matches the Android biometric prompt cancel', () => {
    const error = new Error(
      'Could not Authenticate the user: User canceled the authentication. Cancelado'
    );
    expect(isSecureStoreUserCancelledError(error)).toBe(true);
  });

  test('matches the Android cancel wrapped by a decrypt failure', () => {
    const error = new Error(
      "Could not decrypt the value for key 'mnemonic_v2_000f25e8' under keychain 'key_v1'. Caused by: Could not Authenticate the user: User canceled the authentication. Cancelado"
    );
    expect(isSecureStoreUserCancelledError(error)).toBe(true);
  });

  test('does not match the iOS wrong passcode failure', () => {
    const error = new Error(
      'Authentication failed. Provided passphrase/PIN is incorrect or there is no user authentication method configured for this device.'
    );
    expect(isSecureStoreUserCancelledError(error)).toBe(false);
  });

  test('does not match Android lockout or missing enrollment', () => {
    expect(
      isSecureStoreUserCancelledError(
        new Error('Could not Authenticate the user: Lockout. Too many attempts.')
      )
    ).toBe(false);
    expect(
      isSecureStoreUserCancelledError(
        new Error('Could not Authenticate the user: No biometrics enrolled. ')
      )
    ).toBe(false);
  });

  test('does not match mnemonic schema parse errors', () => {
    expect(
      isSecureStoreUserCancelledError(
        new Error('Invalid input: expected string, received undefined')
      )
    ).toBe(false);
  });

  test('does not match non-error values', () => {
    expect(isSecureStoreUserCancelledError('User canceled the operation.')).toBe(false);
    expect(isSecureStoreUserCancelledError(undefined)).toBe(false);
  });
});
