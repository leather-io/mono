import { describe, expect, test } from 'vitest';

import { minusSign } from './special-char';

describe('minusSign', () => {
  test('should be the Unicode minus sign character (U+2212)', () => {
    expect(minusSign).toBe('−');
    expect(minusSign.charCodeAt(0)).toBe(0x2212);
    expect(minusSign).not.toBe('-');
  });
});
