import { describe, expect, test } from 'vitest';

import { accountIdentifier, fingerprintHex } from './keychain.kernel';

describe('keychain formats', () => {
  test('a fingerprint is eight lower-case hex digits, zero-padded', () => {
    expect(fingerprintHex.print(0x0a3fd8ef)).toBe('0a3fd8ef');
    expect(fingerprintHex.print(0xf25e8)).toBe('000f25e8');
  });

  test('an account identifier is the fingerprint, a slash and the account index', () => {
    expect(accountIdentifier.print(['0a3fd8ef', 3])).toBe('0a3fd8ef/3');
    expect(accountIdentifier.parse('0a3fd8ef/3')).toEqual(['0a3fd8ef', 3]);
  });
});
