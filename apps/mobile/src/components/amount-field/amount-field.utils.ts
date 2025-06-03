import { InputCurrencyMode } from '@/utils/types';

import { currencyDecimalsMap } from '@leather.io/constants';
import { type Currency, type MarketData } from '@leather.io/models';
import {
  baseCurrencyAmountInQuote,
  createMoneyFromDecimal,
  quoteCurrencyAmountToBase,
} from '@leather.io/utils';

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
