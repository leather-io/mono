import BigNumber from 'bignumber.js';

import { currencyDecimalsMap } from '@leather.io/constants';
import type { Currency, Money, NumType } from '@leather.io/models';

import { isBigInt, isUndefined } from '..';

type KnownCurrencyDecimals = keyof typeof currencyDecimalsMap;

function isResolutionOfCurrencyKnown(symbol: Currency): symbol is KnownCurrencyDecimals {
  return symbol in currencyDecimalsMap;
}

function getDecimalsOfSymbolIfKnown(symbol: Currency) {
  if (isResolutionOfCurrencyKnown(symbol)) return currencyDecimalsMap[symbol];
  return null;
}

function throwWhenDecimalUnknown(symbol: Currency, decimals?: number): asserts decimals is number {
  if (isUndefined(decimals) && isUndefined(getDecimalsOfSymbolIfKnown(symbol)))
    throw new Error(`Resolution of currency ${symbol} is unknown, must be described`);
}

/**
 * @param value Amount described in currency's primary unit
 * @param symbol Identifying letter code, e.g. EUR
 * @param resolution Optional, required if value not known at build-time
 */
export function createMoneyFromDecimal(
  value: NumType,
  symbol: Currency,
  resolution?: number
): Money {
  throwWhenDecimalUnknown(symbol, resolution);
  const decimals = getDecimalsOfSymbolIfKnown(symbol) ?? resolution;
  const amount = new BigNumber(isBigInt(value) ? value.toString() : value).shiftedBy(decimals);
  return Object.freeze({ amount, symbol, decimals });
}

/**
 * @param value Amount described in currency's fractional base unit, e.g. cents for USD amounts
 * @param symbol Identifying letter code, e.g. EUR
 * @param resolution Optional, required if value not known at build-time
 */
export function createMoney(value: NumType, symbol: Currency, resolution?: number): Money {
  throwWhenDecimalUnknown(symbol, resolution);
  const decimals = getDecimalsOfSymbolIfKnown(symbol) ?? resolution;
  const amount = new BigNumber(isBigInt(value) ? value.toString() : value);
  return Object.freeze({ amount, symbol, decimals });
}

const thinSpace = ' ';

function exponentialToNumerical(amount: BigNumber) {
  const [integral, decimal, power] = amount.toString().split(/[eE]|\./);
  const expPowerValuePosition = 2;
  const expPower = power ? +power.substring(0, expPowerValuePosition) : 0;
  const positiveExponential = expPower >= 0;
  if (decimal) {
    if (positiveExponential) {
      return Number(`${integral}${decimal.slice(0, +expPower)}.${decimal.slice(+expPower)}`);
    }
    return 0;
  }
  return Number(integral);
}

function formatMoneyWithoutSymbolWithoutScientific(amount: BigNumber, decimals: number) {
  const numericalAmount = exponentialToNumerical(amount);
  const formattedAmount = new BigNumber(numericalAmount).shiftedBy(-decimals).toString();
  const formattedAmountWithoutScientific = new BigNumber(formattedAmount).toFixed(decimals);
  return `${formattedAmountWithoutScientific}`;
}

export function formatMoney({ amount, symbol, decimals }: Money) {
  const formattedAmountWithoutScientific = formatMoneyWithoutSymbolWithoutScientific(
    amount,
    decimals
  );
  return `${formattedAmountWithoutScientific} ${symbol}`;
}

export function formatMoneyWithoutSymbol({ amount, decimals }: Money) {
  return formatMoneyWithoutSymbolWithoutScientific(amount, decimals);
}

export function formatMoneyToFixedDecimal(
  { amount, symbol, decimals }: Money,
  fixedDecimals: number
) {
  return `${amount.shiftedBy(-decimals).toFixed(fixedDecimals)} ${symbol}`;
}

export function formatMoneyToFixedDecimalWithoutSymbol(
  { amount, decimals }: Money,
  fixedDecimals: number
) {
  return `${amount.shiftedBy(-decimals).toFixed(fixedDecimals)}`;
}

export function formatMoneyPadded({ amount, symbol, decimals }: Money) {
  return `${amount.shiftedBy(-decimals).toFormat(decimals)} ${symbol}`;
}

export function i18nFormatCurrency(quantity: Money, decimals = 2) {
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: quantity.symbol,
    maximumFractionDigits: decimals,
  });

  const formatted = currencyFormatter.format(
    quantity.amount.shiftedBy(-quantity.decimals).toNumber()
  );

  if (quantity.amount.isGreaterThan(0) && formatted === '$0.00')
    return '<' + thinSpace + formatted.replace('0.00', '0.01');

  return formatted;
}

export function formatDustUsdAmounts(value: string) {
  return value.endsWith('0.00') ? '<' + thinSpace + value.replace('0.00', '0.01') : value;
}
