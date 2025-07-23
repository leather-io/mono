import { FIAT_METADATA } from './fiat-metadata';
import { FormatterPreset, formatterPresets } from './formatter-presets';

export interface FormatCurrencyOptions {
  preset?: FormatterPreset;
  compactThreshold?: number;
  showCurrency?: boolean;
  approximateDust?: boolean;
  numberFormatOptions?: Intl.NumberFormatOptions;
}

export interface FormatCurrencyAmountInput {
  amount: number;
  currencyCode: string;
  decimals: number;
}

interface CreateFormatterParams {
  locale: string;
}

const defaultCompactThreshold = 1_000_000;
const thinSpace = '\u2009';

export function createFormatter({ locale }: CreateFormatterParams) {
  function formatAmount(input: FormatCurrencyAmountInput, options: FormatCurrencyOptions = {}) {
    const { amount, currencyCode, decimals } = input;
    const {
      preset,
      compactThreshold,
      showCurrency = true,
      approximateDust = preset ? formatterPresets[preset].approximateDust : true,
      numberFormatOptions = {},
    } = options;
    const { compactThreshold: presetCompactThreshold, ...presetOptions } = preset
      ? formatterPresets[preset]
      : {};
    const shouldCompact = evaluateCompactNotation(compactThreshold, presetCompactThreshold, amount);
    const { minimumFractionDigits, maximumFractionDigits } = deriveFractionOptions(
      amount,
      decimals,
      shouldCompact,
      presetOptions,
      numberFormatOptions
    );

    const baseOptions: Intl.NumberFormatOptions = {
      minimumFractionDigits,
      maximumFractionDigits,
      ...(shouldCompact && { notation: 'compact' }),
      ...omitFractionOptions(presetOptions),
      ...omitFractionOptions(numberFormatOptions),
    };

    if (isFiat(currencyCode)) {
      if (showCurrency) {
        baseOptions.style = 'currency';
        baseOptions.currency = currencyCode;
      }
      const formatter = new Intl.NumberFormat(locale, {
        ...baseOptions,
      });

      if (approximateDust && isSmallerThanMinorUnit(amount, decimals)) {
        return `<${thinSpace}${formatter.format(getSmallestUnit(decimals))}`;
      }

      return formatter.format(amount);
    } else {
      const formatter = new Intl.NumberFormat(locale, {
        style: 'decimal',
        ...baseOptions,
      });

      const formattedAmount = formatter.format(amount);
      return showCurrency ? `${formattedAmount}\u00A0${currencyCode}` : formattedAmount;
    }
  }

  return {
    formatAmount,
  };
}

// -----------------------------------------------------------------------------
//
// Helpers
//
// -----------------------------------------------------------------------------
function evaluateCompactNotation(
  userSpecifiedCompatcThreshold: number | undefined,
  presetCompactThreshold: number | undefined,
  amount: number
) {
  const compactThreshold =
    userSpecifiedCompatcThreshold ?? presetCompactThreshold ?? defaultCompactThreshold;
  return Math.abs(amount) >= compactThreshold;
}

//https://tc39.es/ecma402/#sec-iswellformedcurrencycode
export function isWellFormedCurrencyCode(currency: string): boolean {
  if (currency.length !== 3) return false;
  const normalized = currency.toUpperCase();
  for (let i = 0; i < 3; i++) {
    const code = normalized.charCodeAt(i);
    if (code < 0x41 || code > 0x5a) return false;
  }
  return true;
}

function getSmallestUnit(decimals: number) {
  return 1 / 10 ** decimals;
}

function isSmallerThanMinorUnit(value: number, decimals: number): boolean {
  if (value === 0) return false;
  const unit = 1 / 10 ** decimals;
  return Math.abs(value) < unit;
}

const fiatCurrencyCodeList = new Set(FIAT_METADATA.map(currency => currency.code));

function isFiat(code: string) {
  return fiatCurrencyCodeList.has(code);
}

function omitFractionOptions(options: Intl.NumberFormatOptions) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { minimumFractionDigits, maximumFractionDigits, ...rest } = options;
  return rest;
}

function deriveFractionOptions(
  amount: number,
  decimals: number,
  compact: boolean,
  presetOptions: Intl.NumberFormatOptions,
  numberFormatOptions: Intl.NumberFormatOptions
) {
  function getMaximumFractionDigits() {
    if (compact) {
      return 2;
    }

    if (amount >= 1000 && amount <= 999999) {
      return Math.min(decimals, 2);
    }

    return (
      numberFormatOptions.maximumFractionDigits ?? presetOptions.maximumFractionDigits ?? decimals
    );
  }

  const maximumFractionDigits = getMaximumFractionDigits();
  const minimumFractionDigits = Math.min(
    numberFormatOptions.minimumFractionDigits ??
      presetOptions.minimumFractionDigits ??
      maximumFractionDigits,
    2
  );

  return {
    maximumFractionDigits,
    minimumFractionDigits,
  };
}
