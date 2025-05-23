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

export function formatMoney({ amount, symbol, decimals }: Money) {
  return `${amount.shiftedBy(-decimals).toString()} ${symbol}`;
}

export function formatMoneyWithoutSymbol({ amount, decimals }: Money) {
  return `${amount.shiftedBy(-decimals).toString()}`;
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
