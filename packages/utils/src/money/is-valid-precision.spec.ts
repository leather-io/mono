import { currencyDecimalsMap } from '@leather.io/constants';

import { isValidPrecision } from './is-valid-precision';

describe('isValidPrecision', () => {
  it('returns true for a valid precision', () => {
    expect(isValidPrecision(10.12, currencyDecimalsMap.USD)).toBe(true);
    expect(isValidPrecision(10.123456, currencyDecimalsMap.STX)).toBe(true);
    expect(isValidPrecision(10.12345678, currencyDecimalsMap.BTC)).toBe(true);
  });

  it('returns false for an invalid precision', () => {
    expect(isValidPrecision(10.122, currencyDecimalsMap.USD)).toBe(false);
    expect(isValidPrecision(10.1234567, currencyDecimalsMap.STX)).toBe(false);
    expect(isValidPrecision(10.123456789, currencyDecimalsMap.BTC)).toBe(false);
  });

  it('returns true for a valid precision with a whole number', () => {
    expect(isValidPrecision(10, currencyDecimalsMap.USD)).toBe(true);
    expect(isValidPrecision(10, currencyDecimalsMap.STX)).toBe(true);
    expect(isValidPrecision(10, currencyDecimalsMap.BTC)).toBe(true);
  });
});
