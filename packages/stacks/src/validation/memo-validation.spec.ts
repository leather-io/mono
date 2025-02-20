import { isValidStacksMemo } from './memo-validation';

describe('isValidStacksMemo', () => {
  it('returns true for a memo within the 34-byte limit', () => {
    const validMemo = 'Hello Stacks!';
    expect(isValidStacksMemo(validMemo)).toBe(true);
  });

  it('returns false for a memo exceeding the 34-byte limit', () => {
    const longMemo = 'a'.repeat(35);
    expect(isValidStacksMemo(longMemo)).toBe(false);
  });

  it('handles multi-byte characters within the 34-byte limit', () => {
    const validMultiByteMemo = '🌟'.repeat(8);
    expect(isValidStacksMemo(validMultiByteMemo)).toBe(true);
  });

  it('returns false for multi-byte characters exceeding the 34-byte limit', () => {
    const invalidMultiByteMemo = '🌟'.repeat(9);
    expect(isValidStacksMemo(invalidMultiByteMemo)).toBe(false);
  });

  it('returns true for a memo exactly 34 bytes', () => {
    const exactLengthMemo = 'a'.repeat(34);
    expect(isValidStacksMemo(exactLengthMemo)).toBe(true);
  });
});
