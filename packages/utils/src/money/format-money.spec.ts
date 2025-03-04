import BigNumber from 'bignumber.js';

import {
  createMoney,
  formatMoneyToFixedDecimal,
  formatMoneyToFixedDecimalWithoutSymbol,
  i18nFormatCurrency,
} from './format-money';

describe('formatMoneyToFixedDecimal', () => {
  it('should format money to fixed decimal places with symbol', () => {
    const money = createMoney(new BigNumber(1000000), 'STX');
    const result = formatMoneyToFixedDecimal(money, 2);
    expect(result).toBe('1.00 STX');
  });

  it('should format money to fixed decimal places with symbol and different decimals', () => {
    const money = createMoney(new BigNumber(1000000), 'STX');
    const result = formatMoneyToFixedDecimal(money, 3);
    expect(result).toBe('1.000 STX');
  });
});

describe('formatMoneyToFixedDecimalWithoutSymbol', () => {
  it('should format money to fixed decimal places without symbol', () => {
    const money = createMoney(new BigNumber(1000000), 'STX');
    const result = formatMoneyToFixedDecimalWithoutSymbol(money, 2);
    expect(result).toBe('1.00');
  });

  it('should format money to fixed decimal places without symbol and different decimals', () => {
    const money = createMoney(new BigNumber(1000000), 'STX');
    const result = formatMoneyToFixedDecimalWithoutSymbol(money, 3);
    expect(result).toBe('1.000');
  });
});

describe('i18nFormatCurrency', () => {
  it('should format USD currency correctly', () => {
    const money = createMoney(new BigNumber(1000000), 'USD');
    const result = i18nFormatCurrency(money, 2);
    expect(result).toBe('$10,000.00');
  });

  it('should format EUR currency correctly', () => {
    const money = createMoney(new BigNumber(1000000), 'EUR');
    const result = i18nFormatCurrency(money, 2);
    expect(result).toBe('€10,000.00');
  });

  it('should format JPY currency correctly', () => {
    const money = createMoney(new BigNumber(1000000), 'JPY');
    const result = i18nFormatCurrency(money, 0);
    expect(result).toBe('¥1,000,000');
  });

  it('should format KRW currency correctly', () => {
    const money = createMoney(new BigNumber(1000000), 'KRW');
    const result = i18nFormatCurrency(money, 0);
    expect(result).toBe('₩1,000,000');
  });

  it('should format small USD amounts correctly', () => {
    const money = createMoney(new BigNumber(1), 'USD');
    const result = i18nFormatCurrency(money, 2);
    expect(result).toBe('$0.01');
  });
});
