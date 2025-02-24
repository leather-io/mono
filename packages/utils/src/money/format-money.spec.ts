import BigNumber from 'bignumber.js';

import {
  createMoney,
  formatMoneyToFixedDecimal,
  formatMoneyToFixedDecimalWithoutSymbol,
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
