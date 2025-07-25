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
  preset?: CurrencyFormatterPreset;
  numberFormatOptions?: Intl.NumberFormatOptions;
}
export type CurrencyFormatterPreset = 'token-price' | 'shorthand-balance';

export type CurrencyFormatterPresetValue =
  | CurrencyFormatterPresetResult
  | ((input: FormatAmountInput) => CurrencyFormatterPresetResult);

export type CurrencyFormatterPresetResult = Omit<FormatAmountOptions, 'preset'>;
