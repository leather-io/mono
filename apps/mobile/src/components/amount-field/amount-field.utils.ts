import { decimalSeparator } from '@/features/send/temporary-constants';
import { InputCurrencyMode } from '@/utils/types';

import { currencyDecimalsMap } from '@leather.io/constants';
import { type Currency, type MarketData, type Money } from '@leather.io/models';
import { baseCurrencyAmountInQuote, createMoneyFromDecimal } from '@leather.io/utils';

interface FormatPrimaryValueParams {
  value: string;
  currency: Currency;
  showCurrency: boolean;
  locale: string;
}

export function formatPrimaryValue({
  value,
  currency,
  showCurrency,
  locale,
}: FormatPrimaryValueParams) {
  const decimalPart = value.split(decimalSeparator)[1];
  const fractionDigits = decimalPart?.length ?? 0;

  const formatter = new Intl.NumberFormat(locale, {
    style: showCurrency ? 'currency' : 'decimal',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

  const formattedValue = formatter.format(Number(value));
  // Ensure trailing decimal separator, as primary value is a live input,
  return value.endsWith(decimalSeparator) ? formattedValue + decimalSeparator : formattedValue;
}

interface FormatSecondaryValueParams {
  value: string;
  currency: Currency;
  locale: string;
}

export function formatSecondaryValue({ value, currency, locale }: FormatSecondaryValueParams) {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: currencyDecimalsMap[currency],
  });

  return formatter.format(Number(value));
}

interface CalculateSecondaryValueParams {
  value: string;
  mode: InputCurrencyMode;
  marketData: MarketData;
}

export function calculateSecondaryValue({
  value,
  mode,
  marketData,
}: CalculateSecondaryValueParams) {
  const numericValue = Number(value);
  const baseAmount = createMoneyFromDecimal(numericValue, marketData.pair.base);
  const converter = mode === 'crypto' ? baseCurrencyAmountInQuote : quoteCurrencyAmountToBase;
  const resultAmount = converter(baseAmount, marketData);

  return resultAmount.amount
    .shiftedBy(-resultAmount.decimals)
    .toFixed(resultAmount.decimals)
    .replace(/\.?0+$/, '');
}

function quoteCurrencyAmountToBase(quantity: Money, { pair, price }: MarketData) {
  return createMoneyFromDecimal(quantity.amount.dividedBy(price.amount), pair.base);
}
