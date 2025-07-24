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

describe('custom options', () => {
  const { formatAmount } = createFormatter({ locale: 'en-US' });
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
  const { formatAmount } = createFormatter({ locale: 'en-US' });

  it('gracefully handles incorrect locale', () => {
    const { formatAmount } = createFormatter({ locale: 'BAD_LOCALE' });
    expect(() => formatAmount(createUsd(12.34))).not.toThrow();
    expect(formatAmount(createUsd(12.34))).toBe('');
  });

  it('gracefully handles incorrect locale', () => {
    const { formatAmount } = createFormatter({ locale: 'BAD_LOCALE' });
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

describe('preset:token-price', () => {
  const { formatAmount } = createFormatter({ locale: 'en-US' });
  it('displays up to 6 decimals for small prices', () => {
    const usd = createUsd(0.000001);
    expect(formatAmount(usd, { preset: 'token-price' })).toBe('$0.000001');
  });

  it('rounds prices smaller than 6 decimals', () => {
    const usd = createUsd(0.0000005);
    expect(formatAmount(usd, { preset: 'token-price' })).toBe('$0.000001');
  });

  it('limits to 6 decimals for prices in 0-99 range', () => {
    const usd = createUsd(12.3456789);
    expect(formatAmount(usd, { preset: 'token-price' })).toBe('$12.345679');
  });

  it('limits to 2 decimals for prices above 100', () => {
    const usd = createUsd(123.456789);
    expect(formatAmount(usd, { preset: 'token-price' })).toBe('$123.46');
  });

  it('shows two trailing 0-s for integers', () => {
    const usd = createUsd(50);
    expect(formatAmount(usd, { preset: 'token-price' })).toBe('$50.00');
  });

  it('displays the currency', () => {
    const usd = createUsd(12.34);
    expect(formatAmount(usd, { preset: 'token-price' })).toContain('$');
  });

  it('allows overriding options to display small price as approximate', () => {
    const usd = createUsd(0.0000001);
    expect(formatAmount(usd, { preset: 'token-price', approximateDust: true })).toBe('< $0.01');
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
