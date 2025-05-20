import { initBigNumber } from '@leather.io/utils';

import { calculateBtcUsdEchangeRate, calculateSatsUsdEchangeRate } from './exchange-rate.utils';

describe('exchange-rate.utils', () => {
  describe('calculateBtcUsdEchangeRate', () => {
    it('should correctly calculate BTC/USD exchange rate', () => {
      const btcPrice = initBigNumber(50000);
      const result = calculateBtcUsdEchangeRate(btcPrice);
      expect(result.toString()).toBe('0.00002');
    });

    it('should handle very large BTC prices', () => {
      const btcPrice = initBigNumber(1000000);
      const result = calculateBtcUsdEchangeRate(btcPrice);
      expect(result.toString()).toBe('0.000001');
    });

    it('should handle very small BTC prices', () => {
      const btcPrice = initBigNumber(1);
      const result = calculateBtcUsdEchangeRate(btcPrice);
      expect(result.toString()).toBe('1');
    });
  });

  describe('calculateSatsUsdEchangeRate', () => {
    it('should correctly calculate sats/USD exchange rate', () => {
      const btcPrice = initBigNumber(50000);
      const result = calculateSatsUsdEchangeRate(btcPrice);
      expect(result.toString()).toBe('2000');
    });

    it('should handle very large BTC prices', () => {
      const btcPrice = initBigNumber(1000000);
      const result = calculateSatsUsdEchangeRate(btcPrice);
      expect(result.toString()).toBe('100');
    });

    it('should handle very small BTC prices', () => {
      const btcPrice = initBigNumber(1);
      const result = calculateSatsUsdEchangeRate(btcPrice);
      expect(result.toString()).toBe('100000000');
    });
  });
});
