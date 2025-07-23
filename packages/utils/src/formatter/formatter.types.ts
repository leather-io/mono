export interface FormatCurrencyOptions {
  preset?: FormatterPreset;
  compactThreshold?: number;
  showCurrency?: boolean;
  approximateDust?: boolean;
  numberFormatOptions?: Intl.NumberFormatOptions;
}

export interface FormatCurrencyInput {
  amount: number;
  currencyCode: string;
  decimals: number;
}
export type FormatterPreset =
  | 'balance'
  | 'token-price'
  | 'shorthand-balance-crypto'
  | 'shorthand-balance-fiat';

export type FormatterPresetValue =
  | FormatterPresetResult
  | ((input: FormatCurrencyInput) => FormatterPresetResult);

export type FormatterPresetResult = Intl.NumberFormatOptions & {
  showCurrency?: boolean;
  compactThreshold?: number;
  approximateDust?: boolean;
};
