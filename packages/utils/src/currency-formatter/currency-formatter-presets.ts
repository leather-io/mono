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
  price: input => {
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
    return {
      showCurrency: isFiatCurrencyCode(input.currencyCode),
      numberFormatOptions: {
        minimumFractionDigits: 2,
        maximumFractionDigits: isFiatCurrencyCode(input.currencyCode) ? 2 : 4,
      },
    };
  },
  'pad-decimals': input => ({
    compactThreshold: Infinity,
    numberFormatOptions: {
      minimumFractionDigits: input.decimals,
      maximumFractionDigits: input.decimals,
    },
  }),
};
