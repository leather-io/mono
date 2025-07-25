import { currencyFormatterPresets } from './currency-formatter-presets';
import {
  CurrencyFormatterPreset,
  FormatAmountCustomOptions,
  FormatAmountInput,
  FormatAmountOptions,
} from './currency-formatter.types';
import { FIAT_METADATA } from './fiat-metadata';

interface CreateCurrencyFormatterParams {
  locale: string;
  onError?: (
    error: unknown,
    context: { locale: string; options: Intl.NumberFormatOptions }
  ) => void;
}

const fallback = '';
const defaultCompactThreshold = 1_000_000;
const thinSpace = '\u2009';
const defaultCustomOptions = {
  compactThreshold: defaultCompactThreshold,
  showCurrency: true,
  approximateDust: true,
};

export function createCurrencyFormatter({ locale, onError }: CreateCurrencyFormatterParams) {
  function safeInitializeNumberFormat(locale: string, options: Intl.NumberFormatOptions) {
    try {
      return new Intl.NumberFormat(locale, options);
    } catch (e) {
      onError?.(e, { locale, options });
      return null;
    }
  }

  function formatAmount(input: FormatAmountInput, options: FormatAmountOptions = {}) {
    const { amount, currencyCode, decimals } = input;
    const { preset, numberFormatOptions = {}, ...customOptions } = options;
    const { numberFormatOptions: presetNumberFormatOptions = {}, ...presetCustomOptions } =
      getPresetResult(preset, input);
    const { compactThreshold, showCurrency, approximateDust } = mergeCustomOptions(
      presetCustomOptions,
      customOptions
    );
    const shouldCompact = evaluateCompactNotation(compactThreshold, amount);
    const isFiatCurrency = isFiat(currencyCode);
    const isDust = isFiatCurrency && isSmallerThanMinorUnit(amount, decimals);
    const { minimumFractionDigits, maximumFractionDigits } = deriveFractionOptions(
      amount,
      decimals,
      shouldCompact,
      presetNumberFormatOptions,
      numberFormatOptions
    );
    const formatterOptions: Intl.NumberFormatOptions = {
      minimumFractionDigits,
      maximumFractionDigits,
      ...(shouldCompact && { notation: 'compact' }),
      ...omitFractionOptions(presetNumberFormatOptions),
      ...omitFractionOptions(numberFormatOptions),
    };

    if (isFiatCurrency && showCurrency) {
      formatterOptions.style = 'currency';
      formatterOptions.currency = currencyCode;
    } else {
      formatterOptions.style = 'decimal';
    }

    const formatter = safeInitializeNumberFormat(locale, formatterOptions);

    if (!formatter) return fallback;

    if (isDust && approximateDust) {
      const smallestUnit = getSmallestUnit(decimals);
      const multiplier = amount < 0 ? -1 : 1;
      return `<${thinSpace}${formatter.format(smallestUnit * multiplier)}`;
    }

    const result = formatter.format(amount);

    if (!isFiatCurrency && showCurrency) {
      return `${result}\u00A0${currencyCode}`;
    }

    return result;
  }

  function formatPercentage(amount: number, decimals = 2) {
    const formatter = safeInitializeNumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    if (!formatter) return fallback;

    return formatter.format(amount);
  }

  return {
    formatAmount,
    formatPercentage,
  };
}

export { type FormatAmountOptions };

// -----------------------------------------------------------------------------
//
// Helpers
//
// -----------------------------------------------------------------------------
function getPresetResult(preset: CurrencyFormatterPreset | undefined, input: FormatAmountInput) {
  if (!preset) return {};

  if (typeof currencyFormatterPresets[preset] === 'function') {
    return currencyFormatterPresets[preset](input);
  }

  return currencyFormatterPresets[preset];
}

function mergeCustomOptions(
  presetCustomOptions: FormatAmountCustomOptions,
  customOptions: FormatAmountCustomOptions
) {
  return {
    ...defaultCustomOptions,
    ...presetCustomOptions,
    ...customOptions,
  };
}

function evaluateCompactNotation(compactThreshold: number, amount: number) {
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
  presetNumberFormatOptions: Intl.NumberFormatOptions,
  numberFormatOptions: Intl.NumberFormatOptions
) {
  function getMaximumFractionDigits() {
    if (
      !presetNumberFormatOptions.maximumFractionDigits &&
      !numberFormatOptions.maximumFractionDigits
    ) {
      if (compact) {
        return 2;
      }

      if (amount >= 1000 && amount <= 999999) {
        return Math.min(decimals, 2);
      }
    }

    return (
      numberFormatOptions.maximumFractionDigits ??
      presetNumberFormatOptions.maximumFractionDigits ??
      decimals
    );
  }

  const maximumFractionDigits = getMaximumFractionDigits();
  // Ensure final minimumFractionDigits <= maximumFractionDigits to avoid Intl.NumberFormat RangeError
  const minimumFractionDigits = Math.min(
    numberFormatOptions.minimumFractionDigits ??
      presetNumberFormatOptions.minimumFractionDigits ??
      maximumFractionDigits,
    2
  );

  return {
    maximumFractionDigits,
    minimumFractionDigits,
  };
}
