export type FormatterPreset = 'balance' | 'shorthand-balance-crypto' | 'shorthand-balance-fiat';

export type FormatterPresetOptions = Intl.NumberFormatOptions & {
  showCurrency?: boolean;
  compactThreshold?: number;
  approximateDust?: boolean;
};

export const formatterPresets: Record<FormatterPreset, FormatterPresetOptions> = {
  balance: {},
  'shorthand-balance-crypto': {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  },
  'shorthand-balance-fiat': {
    maximumFractionDigits: 2,
  },
};
