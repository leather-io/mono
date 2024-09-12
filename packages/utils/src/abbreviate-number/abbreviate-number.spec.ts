import { abbreviateNumber } from './abbreviate-number';

describe('abbreviateNumber', () => {
  test('abbreviates numbers less than 1 thousand', () => {
    expect(abbreviateNumber(0)).toBe('0');
    expect(abbreviateNumber(999)).toBe('999');
  });

  test('abbreviates numbers between 1 thousand and 1 million', () => {
    expect(abbreviateNumber(1000)).toBe('1K');
    expect(abbreviateNumber(1500)).toBe('1.5K');
    expect(abbreviateNumber(999999)).toBe('1000K');
  });

  test('abbreviates numbers between 1 million and 1 billion', () => {
    expect(abbreviateNumber(1000000)).toBe('1M');
    expect(abbreviateNumber(1500000)).toBe('1.5M');
    expect(abbreviateNumber(999999999)).toBe('1000M');
  });

  test('abbreviates numbers 1 billion and above', () => {
    expect(abbreviateNumber(1000000000)).toBe('1B');
    expect(abbreviateNumber(1500000000)).toBe('1.5B');
    expect(abbreviateNumber(1000000000000)).toBe('1T');
  });

  test('handles decimal numbers', () => {
    expect(abbreviateNumber(1234.56)).toBe('1.23K');
    expect(abbreviateNumber(1234567.89)).toBe('1.23M');
  });

  test('handles edge cases', () => {
    expect(abbreviateNumber(999.9)).toBe('999.9');
    expect(abbreviateNumber(999999.9)).toBe('1000K');
    expect(abbreviateNumber(999999999.9)).toBe('1000M');
  });
});
