import { useMemo, useState } from 'react';

export interface UseAmountFieldProps {
  value: string;
  onChange(rawValue: string): void;
  onReject?(): void;
  maxDecimals: number;
  locale?: string;
  enableGrouping?: boolean;
  currency?: string;
}

export interface CurrencySign {
  symbol: string;
  placement: 'prefix' | 'suffix';
}

export interface ChangeResult {
  accepted: boolean;
  displayValue: string;
  cursorPosition: number;
}

interface UseBaseAmountFieldResult {
  displayValue: string;
  touched: boolean;
  currencySign?: CurrencySign;
  handleChange(newText: string, cursorPosition: number): ChangeResult;
}

export function useBaseAmountField({
  value,
  onChange,
  onReject,
  maxDecimals,
  locale = 'en',
  enableGrouping = true,
  currency,
}: UseAmountFieldProps): UseBaseAmountFieldResult {
  const formatter = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  const decimalSeparator = extractDecimalSeparator(formatter);
  const groupSeparator = enableGrouping ? extractGroupSeparator(formatter) : '';
  const escapedDecimalSeparator = escapeForRegex(decimalSeparator);

  const currencySign = useMemo(
    () => (currency ? extractCurrencySign(locale, currency) : undefined),
    [locale, currency]
  );

  const [touched, setTouched] = useState(false);

  const displayValue = formatRawForDisplay(value, formatter, decimalSeparator, enableGrouping);

  function handleChange(newText: string, cursorPosition: number): ChangeResult {
    setTouched(true);
    const previousCursor = cursorPosition - (newText.length - displayValue.length);
    const rejected: ChangeResult = {
      accepted: false,
      displayValue,
      cursorPosition: previousCursor,
    };

    if (groupSeparator) {
      const displayGroupCount = displayValue.split(groupSeparator).length - 1;
      const inputGroupCount = newText.split(groupSeparator).length - 1;
      if (inputGroupCount > displayGroupCount) {
        onReject?.();
        return rejected;
      }
    }

    let sanitized = removeGroupSeparators(newText, groupSeparator);

    if (sanitized === '') {
      onChange('0');
      return { accepted: true, displayValue: '0', cursorPosition: 1 };
    }

    let prependedLeadingZero = false;
    if (sanitized[0] === decimalSeparator) {
      sanitized = '0' + sanitized;
      prependedLeadingZero = true;
    }

    if (!isValidShape(sanitized, escapedDecimalSeparator)) {
      onReject?.();
      return rejected;
    }

    const corrected = stripLeadingZeros(sanitized, decimalSeparator);
    if (corrected !== sanitized) {
      if (corrected === value) {
        onReject?.();
        return rejected;
      }
      sanitized = corrected;
    }

    if (exceedsMaxDecimals(sanitized, decimalSeparator, maxDecimals)) {
      onReject?.();
      return rejected;
    }

    if (sanitized === value) {
      return rejected;
    }

    let logicalOffset = countLogicalCharacters(newText, cursorPosition, groupSeparator);
    if (prependedLeadingZero) logicalOffset += 1;

    const newDisplayValue = formatRawForDisplay(
      sanitized,
      formatter,
      decimalSeparator,
      enableGrouping
    );
    const newCursorPosition = resolveFormattedCursorPosition(
      newDisplayValue,
      logicalOffset,
      groupSeparator
    );

    onChange(sanitized);
    return {
      accepted: true,
      displayValue: newDisplayValue,
      cursorPosition: newCursorPosition,
    };
  }

  return { displayValue, touched, currencySign, handleChange };
}

function extractDecimalSeparator(formatter: Intl.NumberFormat): string {
  const parts = formatter.formatToParts(1.1);
  const decimalPart = parts.find(part => part.type === 'decimal');
  return decimalPart ? decimalPart.value : '.';
}

function extractGroupSeparator(formatter: Intl.NumberFormat): string {
  const parts = formatter.formatToParts(12345);
  const groupPart = parts.find(part => part.type === 'group');
  return groupPart ? groupPart.value : '';
}

function escapeForRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function removeGroupSeparators(text: string, groupSeparator: string): string {
  if (!groupSeparator) return text;
  return text.split(groupSeparator).join('');
}

/**
 * Formats a raw value (e.g. "12345.9") into a display string (e.g. "12,345.9").
 *
 * Only the integer portion is formatted via Intl.NumberFormat.
 * The decimal tail is preserved as-is, so in-progress input like "12345." isn't lost.
 */
function formatRawForDisplay(
  raw: string,
  formatter: Intl.NumberFormat,
  decimalSeparator: string,
  enableGrouping: boolean
): string {
  if (raw === '') return '0';

  const decimalIndex = raw.indexOf(decimalSeparator);
  const integerPart = decimalIndex >= 0 ? raw.slice(0, decimalIndex) : raw;
  const decimalTail = decimalIndex >= 0 ? raw.slice(decimalIndex) : '';

  const integerValue = parseInt(integerPart || '0', 10);
  const allowedTypes: string[] = enableGrouping ? ['integer', 'group'] : ['integer'];
  const formattedInteger = formatter
    .formatToParts(integerValue)
    .filter(part => allowedTypes.includes(part.type))
    .map(part => part.value)
    .join('');

  return formattedInteger + decimalTail;
}

function countLogicalCharacters(
  text: string,
  upToPosition: number,
  groupSeparator: string
): number {
  let count = 0;
  for (let i = 0; i < upToPosition; i++) {
    if (!groupSeparator || text[i] !== groupSeparator) count++;
  }
  return count;
}

function resolveFormattedCursorPosition(
  formattedText: string,
  logicalOffset: number,
  groupSeparator: string
): number {
  let count = 0;
  for (let i = 0; i < formattedText.length; i++) {
    if (count === logicalOffset) return i;
    if (!groupSeparator || formattedText[i] !== groupSeparator) count++;
  }
  return formattedText.length;
}

function isValidShape(text: string, escapedDecimalSeparator: string): boolean {
  const pattern = new RegExp(`^\\d*(?:${escapedDecimalSeparator}\\d*)?$`);
  return pattern.test(text);
}

function stripLeadingZeros(text: string, decimalSeparator: string): string {
  const decimalIndex = text.indexOf(decimalSeparator);
  const integerPart = decimalIndex >= 0 ? text.slice(0, decimalIndex) : text;

  if (integerPart.length <= 1 || integerPart[0] !== '0') return text;

  const correctedInteger = integerPart.replace(/^0+/, '') || '0';
  return decimalIndex >= 0 ? correctedInteger + text.slice(decimalIndex) : correctedInteger;
}

function exceedsMaxDecimals(text: string, decimalSeparator: string, maxDecimals: number): boolean {
  const decimalIndex = text.indexOf(decimalSeparator);
  if (decimalIndex < 0) return false;
  if (maxDecimals === 0) return true;
  return text.length - decimalIndex - 1 > maxDecimals;
}

function extractCurrencySign(locale: string, currency: string): CurrencySign {
  const formatter = new Intl.NumberFormat(locale, { style: 'currency', currency });
  const parts = formatter.formatToParts(1);

  const currencyIndex = parts.findIndex(p => p.type === 'currency');
  const firstNumberIndex = parts.findIndex(p => p.type === 'integer');
  const symbol = parts[currencyIndex]?.value ?? '';
  const placement = currencyIndex < firstNumberIndex ? 'prefix' : 'suffix';

  return { symbol, placement };
}
