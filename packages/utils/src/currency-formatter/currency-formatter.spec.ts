import { describe, expect, it } from 'vitest';

import { createCurrencyFormatter } from './currency-formatter';

interface TestConfig {
  locale: string;
  currencyCode: string;
  decimals: number;
  tests: [number, string][];
}

describe('formatAmount', () => {
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
      const { formatAmount } = createCurrencyFormatter({ locale });

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
      const { formatAmount } = createCurrencyFormatter({ locale });

      it.each(tests)('formats %d to "%s"', (amount, expected) => {
        const result = formatAmount({ amount, currencyCode, decimals });
        expect(result).toBe(withNbsp(expected));
      });
    });
  });

  describe('custom options', () => {
    const { formatAmount } = createCurrencyFormatter({ locale: 'en-US' });
    it('compacts with a custom threshold', () => {
      const usd = createUsd(1000);
      expect(formatAmount(usd, { compactThreshold: 1000 })).toBe('$1.00K');
    });

    it('allows disabling compact notation', () => {
      const usd = createUsd(1_000_000);
      expect(formatAmount(usd, { compactThreshold: Infinity })).toBe('$1,000,000.00');
    });

    it('shows approximate fiat dust amount by default', () => {
      const result = formatAmount(createUsd(0.00034));
      expect(result).toBe('< $0.01');
    });

    it('accounts for currency decimal places when showing dust', () => {
      const result = formatAmount(createJpy(0.75));
      expect(result).toBe('< ¥1');
    });

    it('allows disabling approximate fiat dust amount', () => {
      const result = formatAmount(createUsd(0.005), { approximateDust: false });
      expect(result).toBe('$0.01');
    });

    it('allows disabling crypto currency display', () => {
      const result = formatAmount(createBtc(12.34), { showCurrency: false });
      expect(result).toBe('12.34');
    });

    it('allows disabling fiat currency display', () => {
      const result = formatAmount(createUsd(12.34), { showCurrency: false });
      expect(result).toBe('12.34');
    });
  });

  describe('edge cases', () => {
    const { formatAmount } = createCurrencyFormatter({ locale: 'en-US' });

    it('gracefully falls back on invalid locale', () => {
      const { formatAmount } = createCurrencyFormatter({ locale: 'BAD_LOCALE' });
      expect(() => formatAmount(createUsd(12.34))).not.toThrow();
      expect(formatAmount(createUsd(12.34))).toBe('');
    });

    it('gracefully falls back on invalid locale', () => {
      const { formatAmount } = createCurrencyFormatter({ locale: 'BAD_LOCALE' });
      expect(() => formatAmount(createUsd(12.34))).not.toThrow();
      expect(formatAmount(createUsd(12.34))).toBe('');
    });

    it('uses two decimals when compacted', () => {
      const usd = createUsd(10_000_000);
      expect(formatAmount(usd)).toBe('$10.00M');
    });

    it('uses two decimals when in the 1,000-999,999 range', () => {
      const usd = createUsd(12345.6789);
      expect(formatAmount(usd)).toBe('$12,345.68');
    });

    it('maximumFractionDigits overrides internal logic', () => {
      const usd1 = createUsd(12345.6789);
      const usd2 = createUsd(123456789);
      const customOptions = {
        numberFormatOptions: { maximumFractionDigits: 4 },
      };
      expect(formatAmount(usd1, customOptions)).toBe('$12,345.6789');
      expect(formatAmount(usd2, customOptions)).toBe('$123.4568M');
    });

    it('handles negative values', () => {
      const usd = createUsd(-12.34);
      expect(formatAmount(usd)).toBe('-$12.34');
    });

    it('handles negative dust', () => {
      const usd = createUsd(-0.00034);
      expect(formatAmount(usd)).toBe('< -$0.01');
    });

    it("ensures minimumFractionDigits doesn't exceed maximumFractionDigits", () => {
      // Intl.NumberFormat will throw if minimumFractionDigits > maximumFractionDigits, implicitly or explicitly.
      const btc = createBtc(12.3456789);
      const result = formatAmount(btc, {
        showCurrency: false,
        numberFormatOptions: { minimumFractionDigits: 12, maximumFractionDigits: 2 },
      });
      expect(result).toBe('12.35');
    });
  });

  describe('formatAmountWithMeta', () => {
    const { formatAmountWithMeta } = createCurrencyFormatter({ locale: 'en-US' });
    it('returns an object with meta information', () => {
      const result = formatAmountWithMeta(createBtc(12.34));

      expect(result).toEqual(
        expect.objectContaining({
          result: expect.any(String),
          parts: expect.any(Array),
          resolvedOptions: expect.any(Object),
        })
      );
    });

    it('returns parts for crypto', () => {
      const { parts } = formatAmountWithMeta(createBtc(1234.56789));
      expect(parts).toEqual([
        { type: 'integer', value: '1' },
        { type: 'group', value: ',' },
        { type: 'integer', value: '234' },
        { type: 'decimal', value: '.' },
        { type: 'fraction', value: '57' },
        { type: 'literal', value: '\u00A0' },
        { type: 'currency', value: 'BTC' },
      ]);
    });

    it('returns parts for fiat', () => {
      const { parts } = formatAmountWithMeta(createUsd(1234.56789));
      expect(parts).toEqual([
        { type: 'currency', value: '$' },
        { type: 'integer', value: '1' },
        { type: 'group', value: ',' },
        { type: 'integer', value: '234' },
        { type: 'decimal', value: '.' },
        { type: 'fraction', value: '57' },
      ]);
    });

    it('returns parts for fiat dust', () => {
      const { parts } = formatAmountWithMeta(createUsd(0.000005));
      expect(parts).toEqual([
        {
          type: 'unknown',
          value: '<',
        },
        {
          type: 'literal',
          value: ' ',
        },
        {
          type: 'currency',
          value: '$',
        },
        {
          type: 'integer',
          value: '0',
        },
        {
          type: 'decimal',
          value: '.',
        },
        {
          type: 'fraction',
          value: '01',
        },
      ]);
    });

    it('returns the resolved options', () => {
      const { resolvedOptions } = formatAmountWithMeta(createUsd(12.34));
      expect(resolvedOptions).toEqual({
        currency: 'USD',
        currencyDisplay: 'symbol',
        currencySign: 'standard',
        locale: 'en-US',
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
        minimumIntegerDigits: 1,
        notation: 'standard',
        numberingSystem: 'latn',
        roundingIncrement: 1,
        roundingMode: 'halfExpand',
        roundingPriority: 'auto',
        signDisplay: 'auto',
        style: 'currency',
        trailingZeroDisplay: 'auto',
        useGrouping: 'auto',
      });
    });
  });

  describe('preset:price', () => {
    const { formatAmount } = createCurrencyFormatter({ locale: 'en-US' });
    it('displays up to 6 decimals for small prices', () => {
      const usd = createUsd(0.000001);
      expect(formatAmount(usd, { preset: 'price' })).toBe('$0.000001');
    });

    it('rounds prices smaller than 6 decimals', () => {
      const usd = createUsd(0.0000005);
      expect(formatAmount(usd, { preset: 'price' })).toBe('$0.000001');
    });

    it('limits to 6 decimals for prices in 0-99 range', () => {
      const usd = createUsd(12.3456789);
      expect(formatAmount(usd, { preset: 'price' })).toBe('$12.345679');
    });

    it('limits to 2 decimals for prices above 100', () => {
      const usd = createUsd(123.456789);
      expect(formatAmount(usd, { preset: 'price' })).toBe('$123.46');
    });

    it('shows two trailing 0-s for integers', () => {
      const usd = createUsd(50);
      expect(formatAmount(usd, { preset: 'price' })).toBe('$50.00');
    });

    it('displays the currency', () => {
      const usd = createUsd(12.34);
      expect(formatAmount(usd, { preset: 'price' })).toContain('$');
    });

    it('allows overriding options to display small price as approximate', () => {
      const usd = createUsd(0.0000001);
      expect(formatAmount(usd, { preset: 'price', approximateDust: true })).toBe('< $0.01');
    });
  });

  describe('shorthand-balance', () => {
    const { formatAmount } = createCurrencyFormatter({ locale: 'en-US' });

    it('shows up to 2 decimals for fiat balances', () => {
      const usd = createUsd(1234.5678);
      expect(formatAmount(usd, { preset: 'shorthand-balance' })).toBe('$1,234.57');
    });

    it('shows up to 4 decimals for crypto balances', () => {
      const btc = createBtc(1234.5678);
      expect(formatAmount(btc, { preset: 'shorthand-balance' })).toBe('1,234.5678');
    });

    it('shows up to 2 decimals for compacted crypto balances', () => {
      const btc = createBtc(12_345_678);
      expect(formatAmount(btc, { preset: 'shorthand-balance' })).toBe('12.35M');
    });

    it('does not show currency code for crypo balance', () => {
      const btc = createBtc(12_345_678);
      expect(formatAmount(btc, { preset: 'shorthand-balance' })).not.toContain('BTC');
    });
  });

  describe('preset:pad-decimals', () => {
    const { formatAmount } = createCurrencyFormatter({ locale: 'en-US' });

    it('shows exact decimals for fiat currency', () => {
      const usd = createUsd(1234.5);
      expect(formatAmount(usd, { preset: 'pad-decimals' })).toBe('$1,234.50');
    });

    it('shows exact decimals for crypto currency', () => {
      const btc = createBtc(1.2);
      expect(formatAmount(btc, { preset: 'pad-decimals' })).toBe(withNbsp('1.20000000 BTC'));
    });

    it("doesn't use  compact notation", () => {
      const usd = createUsd(1_000_000);
      expect(formatAmount(usd, { preset: 'pad-decimals' })).toBe('$1,000,000.00');
    });

    it('formats currencies without decimals as usual', () => {
      const jpy = createJpy(1234);
      expect(formatAmount(jpy, { preset: 'pad-decimals' })).toBe('¥1,234');
    });
  });
});

describe('formatPercentage', () => {
  const { formatPercentage } = createCurrencyFormatter({ locale: 'en-US' });

  it('formats the whole percentage correctly', () => {
    expect(formatPercentage(1)).toBe('100.00%');
  });

  it('formats decimal percentage with 2 decimals by default', () => {
    expect(formatPercentage(0.1234)).toBe('12.34%');
  });

  it('allows custom decimal precision', () => {
    expect(formatPercentage(0.123456, 4)).toBe('12.3456%');
  });

  it('gracefully falls back on invalid locale', () => {
    const { formatPercentage } = createCurrencyFormatter({ locale: 'BAD_LOCALE' });
    expect(formatPercentage(0.5)).toBe('');
  });
});

function withNbsp(value: string) {
  return value.replace(/ /g, '\u00A0');
}

function createMoney(amount: number, currencyCode: string, decimals: number) {
  return { amount, currencyCode, decimals };
}

function createUsd(amount: number) {
  return createMoney(amount, 'USD', 2);
}

function createJpy(amount: number) {
  return createMoney(amount, 'JPY', 0);
}

function createBtc(amount: number) {
  return createMoney(amount, 'BTC', 8);
}
