import fc from 'fast-check';
import { describe, test } from 'vitest';

import {
  fingerprintAsNumberToHex,
  makeAccountIdentifer,
  safelyReadPaddedFingerprint,
  unpadHex,
} from './keychain';
import {
  encodeText,
  expectAgreementWithLeanModel,
  leanCall,
  leanOracleAvailable,
  observeText,
} from './proofs/lean-oracle';

const hexDigits = Array.from('0123456789abcdefABCDEF');
const twoToThe32 = 2 ** 32;

const safeNatArbitrary = fc.oneof(
  fc.nat(),
  fc.maxSafeNat(),
  fc.constantFrom(0, 1, 255, twoToThe32 - 1, twoToThe32, Number.MAX_SAFE_INTEGER)
);

const hexTextArbitrary = fc.oneof(
  fc.string({ unit: fc.constantFrom(...hexDigits), maxLength: 12 }),
  fc.string({ unit: fc.constantFrom('0', '0', 'a', 'F'), maxLength: 20 }),
  fc.constantFrom('', '0', '000', '0a3fd8ef', '00000001')
);

const anyTextArbitrary = fc.oneof(
  hexTextArbitrary,
  fc.string({ maxLength: 12 }),
  fc.string({ unit: 'binary', maxLength: 10 }),
  fc.constantFrom('😀', '😀😀😀😀', 'a/b', '/', 'e5f6a7b8')
);

describe.skipIf(!leanOracleAvailable)('Lean model of the keychain helpers', () => {
  test('fingerprintAsNumberToHex agrees with the model', () => {
    expectAgreementWithLeanModel(
      safeNatArbitrary,
      fingerprint => ({
        call: leanCall('fingerprintAsNumberToHex', String(fingerprint)),
        observed: observeText(() => fingerprintAsNumberToHex(fingerprint)),
      }),
      { minimumSupportedShare: 1 }
    );
  });

  test('safelyReadPaddedFingerprint agrees with the model', () => {
    expectAgreementWithLeanModel(
      anyTextArbitrary,
      text => ({
        call: leanCall('safelyReadPaddedFingerprint', encodeText(text)),
        observed: observeText(() => safelyReadPaddedFingerprint(text)),
      }),
      { minimumSupportedShare: 1 }
    );
  });

  test('unpadHex agrees with the model', () => {
    expectAgreementWithLeanModel(fc.oneof(hexTextArbitrary, anyTextArbitrary), text => ({
      call: leanCall('unpadHex', encodeText(text)),
      observed: observeText(() => unpadHex(text)),
    }));
  });

  test('makeAccountIdentifer agrees with the model', () => {
    expectAgreementWithLeanModel(
      fc.tuple(anyTextArbitrary, safeNatArbitrary),
      ([fingerprint, accountIndex]) => ({
        call: leanCall('makeAccountIdentifer', encodeText(fingerprint), String(accountIndex)),
        observed: observeText(() => makeAccountIdentifer(fingerprint, accountIndex)),
      }),
      { minimumSupportedShare: 1 }
    );
  });
});
