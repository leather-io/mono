export interface FormatAmountInput {
  amount: number;
  currencyCode: string;
  decimals: number;
}

export interface FormatAmountCustomOptions {
  compactThreshold?: number;
  showCurrency?: boolean;
  approximateDust?: boolean;
}

export interface FormatAmountOptions extends FormatAmountCustomOptions {
  preset?: FormatterPreset;
  numberFormatOptions?: Intl.NumberFormatOptions;
}
export type FormatterPreset = 'token-price' | 'shorthand-balance-crypto' | 'shorthand-balance-fiat';

export type FormatterPresetValue =
  | FormatterPresetResult
  | ((input: FormatAmountInput) => FormatterPresetResult);

export type FormatterPresetResult = Omit<FormatAmountOptions, 'preset'>;
