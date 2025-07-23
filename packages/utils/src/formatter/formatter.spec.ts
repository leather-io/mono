import { describe, expect, it } from 'vitest';

import { createFormatter } from './formatter';

interface TestConfig {
  locale: string;
  currencyCode: string;
  decimals: number;
  tests: [number, string][];
}

describe('fiat defaults', () => {
  describe.each<TestConfig>([
    {
      locale: 'en-US',
      currencyCode: 'USD',
      decimals: 2,
      tests: [
        [0, '$0.00'],
        [0.004, '< $0.01'],
        [0.01, '$0.01'],
        [123.45, '$123.45'],
        [1234.56, '$1,234.56'],
        [12_345.67, '$12,345.67'],
        [1_000_000.99, '$1.00M'],
        [12_345_678.9, '$12.35M'],
        [1_234_567_890, '$1.23B'],
      ],
    },
    {
      locale: 'ja',
      currencyCode: 'JPY',
      decimals: 0,
      tests: [
        [0, '￥0'],
        [0.004, '< ￥1'],
        [123.45, '￥123'],
        [1234.56, '￥1,235'],
        [12_345.67, '￥12,346'],
        [1_000_000.99, '￥100.00万'],
        [12_345_678.9, '￥1234.57万'],
        [1_234_567_890, '￥12.35億'],
      ],
    },
    {
      locale: 'de',
      currencyCode: 'EUR',
      decimals: 2,
      tests: [
        [0, '0,00 €'],
        [0.004, '< 0,01 €'],
        [0.01, '0,01 €'],
        [123.45, '123,45 €'],
        [1234.56, '1.234,56 €'],
        [12_345.67, '12.345,67 €'],
        [1_000_000.99, '1,00 Mio. €'],
        [12_345_678.9, '12,35 Mio. €'],
        [1_234_567_890, '1,23 Mrd. €'],
      ],
    },
  ])('locale: $locale, currency: $currencyCode', ({ locale, currencyCode, decimals, tests }) => {
    const { formatAmount } = createFormatter({ locale });

    it.each(tests)('formats %d to "%s"', (amount, expected) => {
      const result = formatAmount({ amount, currencyCode, decimals });
      expect(result).toBe(withNbsp(expected));
    });
  });
});

describe('crypto defaults', () => {
  describe.each<TestConfig>([
    {
      locale: 'en-US',
      currencyCode: 'BTC',
      decimals: 8,
      tests: [
        [0, '0.00 BTC'],
        [0.00000001, '0.00000001 BTC'],
        [0.00000042, '0.00000042 BTC'],
        [0.0003, '0.0003 BTC'],
        [0.1, '0.10 BTC'],
        [1.0, '1.00 BTC'],
        [12.3456789, '12.3456789 BTC'], // ?
        [1234.56789, '1,234.57 BTC'],
        [123_456.789, '123,456.79 BTC'],
        [12_345_678.123, '12.35M BTC'],
        [1_000_000_000, '1.00B BTC'],
      ],
    },
    {
      locale: 'ja',
      currencyCode: 'BTC',
      decimals: 8,
      tests: [
        [0, '0.00 BTC'],
        [0.00000001, '0.00000001 BTC'],
        [0.00000042, '0.00000042 BTC'],
        [0.0003, '0.0003 BTC'],
        [0.1, '0.10 BTC'],
        [1.0, '1.00 BTC'],
        [12.3456789, '12.3456789 BTC'], //?
        [1234.56789, '1,234.57 BTC'],
        [123_456.789, '123,456.79 BTC'],
        [12_345_678.123, '1234.57万 BTC'],
        [1_000_000_000, '10.00億 BTC'],
      ],
    },
    {
      locale: 'de',
      currencyCode: 'BTC',
      decimals: 8,
      tests: [
        [0, '0,00 BTC'],
        [0.00000001, '0,00000001 BTC'],
        [0.00000042, '0,00000042 BTC'],
        [0.0003, '0,0003 BTC'],
        [0.1, '0,10 BTC'],
        [1.0, '1,00 BTC'],
        [12.3456789, '12,3456789 BTC'], //?
        [1234.56789, '1.234,57 BTC'],
        [123_456.789, '123.456,79 BTC'],
        [12_345_678.123, '12,35 Mio. BTC'],
        [1_000_000_000, '1,00 Mrd. BTC'],
      ],
    },
  ])('locale: $locale, currency: $currencyCode', ({ locale, currencyCode, decimals, tests }) => {
    const { formatAmount } = createFormatter({ locale });

    it.each(tests)('formats %d to "%s"', (amount, expected) => {
      const result = formatAmount({ amount, currencyCode, decimals });
      expect(result).toBe(withNbsp(expected));
    });
  });
});

function withNbsp(value: string) {
  return value.replace(/ /g, '\u00A0');
}
