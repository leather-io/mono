export interface FormatCurrencyInput {
  amount: number;
  currencyCode: string;
  decimals: number;
}

export interface FormatCurrencyCustomOptions {
  compactThreshold?: number;
  showCurrency?: boolean;
  approximateDust?: boolean;
}

export interface FormatCurrencyOptions extends FormatCurrencyCustomOptions {
  preset?: FormatterPreset;
  numberFormatOptions?: Intl.NumberFormatOptions;
}
export type FormatterPreset =
  | 'balance'
  | 'token-price'
  | 'shorthand-balance-crypto'
  | 'shorthand-balance-fiat';

export type FormatterPresetValue =
  | FormatterPresetResult
  | ((input: FormatCurrencyInput) => FormatterPresetResult);

export type FormatterPresetResult = Omit<FormatCurrencyOptions, 'preset'>;
