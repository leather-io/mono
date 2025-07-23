import { FormatterPreset, FormatterPresetResult, FormatterPresetValue } from './formatter.types';

export const formatterPresets: Record<FormatterPreset, FormatterPresetValue> = {
  balance: {},
  'token-price': input => {
    const options: FormatterPresetResult = {
      compactThreshold: Infinity,
      approximateDust: false,
      showCurrency: true,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    };

    if (input.amount >= 0 && input.amount <= 99) {
      options.maximumFractionDigits = 6;
    }

    return options;
  },
  'shorthand-balance-crypto': {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  },
  'shorthand-balance-fiat': {
    maximumFractionDigits: 2,
  },
};
