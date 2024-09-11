import { formatBalance } from './format-balance';

describe('formatBalance', () => {
  it('should format zero balance correctly', () => {
    const result = formatBalance(0);
    expect(result).toBe('$0.00');
  });

  // Unimplemented test
  it.skip('should handle undefined balance', () => {
    // @ts-expect-error: Testing undefined input
    const result = formatBalance(undefined);
    expect(result).toBe('$0.00');
  });

  it('should format positive balance correctly', () => {
    const result = formatBalance(1234.56);
    expect(result).toBe('$1,234.56');
  });

  it('should format negative balance correctly', () => {
    const result = formatBalance(-1234.56);
    expect(result).toBe('-$1,234.56');
  });
});
