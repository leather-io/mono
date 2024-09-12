import { formatBalance } from './format-balance';

// TODO: revise this behaviour and make sure it's intentional
describe('formatBalance', () => {
  test('handles string inputs correctly', () => {
    expect(formatBalance('1,000').value).toBe('1,000');
    expect(formatBalance('1,000.5').value).toBe('1,000.5');
    expect(formatBalance('1000.5').value).toBe('1000.5');
    expect(formatBalance('1000000').value).toBe('1M');
    expect(formatBalance('1000000000').value).toBe('1B');
    expect(formatBalance('1000000000000').value).toBe('1T');
  });

  test('throws error for invalid inputs', () => {
    expect(() => formatBalance('invalid')).toThrow(
      'Invalid input: amount must be a non-empty string representing a valid number'
    );
    expect(() => formatBalance(null as any)).toThrow(
      'Invalid input: amount must be a non-empty string representing a valid number'
    );
    expect(() => formatBalance(undefined as any)).toThrow(
      'Invalid input: amount must be a non-empty string representing a valid number'
    );
    expect(() => formatBalance({} as any)).toThrow(
      'Invalid input: amount must be a non-empty string representing a valid number'
    );
    expect(() => formatBalance([] as any)).toThrow(
      'Invalid input: amount must be a non-empty string representing a valid number'
    );
  });
});
