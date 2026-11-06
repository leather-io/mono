import { describe, expect, test } from 'vitest';

import { getNonceInputError } from './nonce-validators';

const typeError = 'Nonce must be a positive integer or 0';

describe(getNonceInputError.name, () => {
  test('accepts an unset nonce', () => {
    expect(getNonceInputError(undefined)).toBeUndefined();
  });

  test('accepts whole numbers and numeric strings', () => {
    expect(getNonceInputError(0)).toBeUndefined();
    expect(getNonceInputError(42)).toBeUndefined();
    expect(getNonceInputError('42')).toBeUndefined();
  });

  test('rejects an empty string instead of treating it as unset', () => {
    expect(getNonceInputError('')).toBe(typeError);
  });

  test('rejects text', () => {
    expect(getNonceInputError('abc')).toBe(typeError);
  });

  test('rejects fractions', () => {
    expect(getNonceInputError(1.5)).toBe('nonce must be an integer');
  });

  test('rejects negative numbers', () => {
    expect(getNonceInputError(-1)).toBe('Nonce must be zero or more');
  });
});
