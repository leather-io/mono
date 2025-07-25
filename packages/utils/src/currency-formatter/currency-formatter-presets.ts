import { isFiatCurrencyCode } from '../money';
import {
  CurrencyFormatterPreset,
  CurrencyFormatterPresetResult,
  CurrencyFormatterPresetValue,
} from './currency-formatter.types';

export const currencyFormatterPresets: Record<
  CurrencyFormatterPreset,
  CurrencyFormatterPresetValue
> = {
  'token-price': input => {
    const options: CurrencyFormatterPresetResult = {
      compactThreshold: Infinity,
      approximateDust: false,
      showCurrency: true,
      numberFormatOptions: {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    } as const;

    if (input.amount >= 0 && input.amount <= 99) {
      options.numberFormatOptions = {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
      };
    }

    return options;
  },
  'shorthand-balance': input => {
    if (isFiatCurrencyCode(input.currencyCode)) {
      return {
        numberFormatOptions: {
          maximumFractionDigits: 2,
        },
      };
    } else {
      return {
        numberFormatOptions: {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
        },
      };
    }
  },
};
