import BigNumber from 'bignumber.js';

import { MarketData, createMarketData, createMarketPair } from '@leather.io/models';

import {
  baseCurrencyAmountInQuote,
  convertAmountToFractionalUnit,
  convertToMoneyTypeWithDefaultOfZero,
  maxMoney,
  minMoney,
  subtractMoney,
  sumMoney,
} from './calculate-money';
import { createMoney, createMoneyFromDecimal, formatMoney } from './format-money';

const tenMicroStx = createMoney(10, 'STX');
const tenStx = createMoneyFromDecimal(10, 'STX');
const nineStx = createMoneyFromDecimal(9, 'STX');
const eightStx = createMoneyFromDecimal(8, 'STX');

const tenBtc = createMoneyFromDecimal(10, 'BTC');

const moneyArray = [tenStx, nineStx, eightStx];
const moneyArrayWithMixedCurrencies = [tenStx, tenBtc];

const mockWrongMarketData = {
  pair: createMarketPair('BTC' as any, 'USD'),
  price: createMoneyFromDecimal(1, 'EUR' as any, 2),
} as MarketData;

const mockAccurateStxMarketData = createMarketData(
  createMarketPair('STX', 'USD'),
  createMoneyFromDecimal(0.3, 'USD')
);

describe(baseCurrencyAmountInQuote.name, () => {
  test('it throw when passed mismatching currencies', () =>
    expect(() => baseCurrencyAmountInQuote(tenMicroStx, mockWrongMarketData)).toThrowError());

  test('it converts currency small amounts accurately', () => {
    const result = baseCurrencyAmountInQuote(tenMicroStx, mockAccurateStxMarketData);
    expect(result.amount.toString()).toEqual('0.0003');
  });

  test('it converts currency amounts accurately', () => {
    const result = baseCurrencyAmountInQuote(tenStx, mockAccurateStxMarketData);
    expect(result.amount.toString()).toEqual('300');
  });
});

describe(convertAmountToFractionalUnit.name, () => {
  test('it converts a small decimal amount to a fractional unit', () =>
    expect(convertAmountToFractionalUnit(new BigNumber(1), 2).toNumber()).toEqual(100));

  test('it converts 99 as decimal amount to a fractional unit', () =>
    expect(convertAmountToFractionalUnit(new BigNumber(99), 6).toNumber()).toEqual(99000000));
});

describe(convertToMoneyTypeWithDefaultOfZero.name, () => {
  test('it converts and formats a number to a money object', () =>
    expect(formatMoney(convertToMoneyTypeWithDefaultOfZero('STX', 400))).toEqual('0.0004 STX'));
});

describe(sumMoney.name, () => {
  test('it sums two money objects', () => {
    const result = sumMoney([tenMicroStx, tenMicroStx]);
    expect(result.amount.toString()).toEqual('20');
    expect(result.symbol).toEqual(tenMicroStx.symbol);
  });
  test('it throws error when summing different currencies', () => {
    expect(() => sumMoney([tenMicroStx, tenBtc])).toThrowError();
  });
});

describe(subtractMoney.name, () => {
  test('it subtracts two money objects', () => {
    const result = subtractMoney(tenMicroStx, tenMicroStx);
    expect(result.amount.toString()).toEqual('0');
    expect(result.symbol).toEqual(tenMicroStx.symbol);
  });
  test('it throws error when subtracting different currencies', () => {
    expect(() => subtractMoney(tenMicroStx, tenBtc)).toThrowError();
  });
});

describe('minMoney', () => {
  test('it returns the smallest amount for a valid array', () => {
    const result = minMoney(moneyArray);
    expect(result).toEqual(eightStx);
  });

  test('it returns a single Money object for an array with one element', () => {
    const result = minMoney([tenStx]);
    expect(result).toEqual(tenStx);
  });

  test('it throws error for an empty array', () => {
    expect(() => minMoney([])).toThrowError();
  });

  test('it throws error for mixed currencies', () => {
    expect(() => minMoney(moneyArrayWithMixedCurrencies)).toThrowError();
  });
});

describe('maxMoney', () => {
  test('it returns the largest amount for a valid array', () => {
    const result = maxMoney(moneyArray);
    expect(result).toEqual(tenStx);
  });

  test('it returns a single Money object for an array with one element', () => {
    const result = maxMoney([tenStx]);
    expect(result).toEqual(tenStx);
  });

  test('it throws error for an empty array', () => {
    expect(() => maxMoney([])).toThrowError();
  });

  test('it throws error for mixed currencies', () => {
    expect(() => maxMoney(moneyArrayWithMixedCurrencies)).toThrowError();
  });
});
