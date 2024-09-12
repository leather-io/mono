import { removeCommas } from './remove-commas';

describe('removeCommas', () => {
  test('removes commas from a string with commas', () => {
    expect(removeCommas('1,000,000')).toBe('1000000');
  });

  test('returns the same string if there are no commas', () => {
    expect(removeCommas('1000000')).toBe('1000000');
  });

  test('handles decimal numbers correctly', () => {
    expect(removeCommas('1,234,567.89')).toBe('1234567.89');
  });

  test('handles string with only commas', () => {
    expect(removeCommas(',,,,')).toBe('');
  });

  test('handles empty string', () => {
    expect(removeCommas('')).toBe('');
  });
  test('throws an error if input is not a string', () => {
    expect(() => removeCommas(123 as any)).toThrow('Amount with commas must be a string');
    expect(() => removeCommas(null as any)).toThrow('Amount with commas must be a string');
    expect(() => removeCommas(undefined as any)).toThrow('Amount with commas must be a string');
    expect(() => removeCommas({} as any)).toThrow('Amount with commas must be a string');
  });

  test('handles string with commas in different positions', () => {
    expect(removeCommas('1,00,0,00')).toBe('100000');
  });

  test('handles string with spaces and commas', () => {
    expect(removeCommas('1, 000, 000')).toBe('1 000 000');
  });

  test('handles string with non-numeric characters', () => {
    expect(removeCommas('1,000,abc,123')).toBe('1000abc123');
  });
});
