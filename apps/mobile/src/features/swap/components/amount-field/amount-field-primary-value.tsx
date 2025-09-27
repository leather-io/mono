import { Currency } from '@leather.io/models';
import { Text } from '@leather.io/ui/native';

const textOpticalAlignmentStyle = { paddingTop: 1, marginBottom: -1 };

interface PrimaryValueProps {
  value: string;
  invalid?: boolean;
}

export function PrimaryValue({ value }: PrimaryValueProps) {
  return (
    <Text
      color={value === '0' ? 'ink.text-subdued' : 'ink.text-primary'}
      variant="heading02"
      fontSize={28}
      lineHeight={36}
      style={textOpticalAlignmentStyle}
      numberOfLines={1}
      adjustsFontSizeToFit
      allowFontScaling={false}
    >
      {value}
    </Text>
  );
}

interface FormatPrimaryValueParams {
  value: string;
  currency: Currency;
  showCurrency: boolean;
  locale?: string;
}

export function formatPrimaryValue({
  value,
  currency,
  showCurrency,
  locale = 'en',
}: FormatPrimaryValueParams) {
  const decimalSeparator = '.';
  const decimalPart = value.split(decimalSeparator)[1];
  const fractionDigits = decimalPart?.length ?? 0;

  const formatter = new Intl.NumberFormat(locale, {
    style: showCurrency ? 'currency' : 'decimal',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

  const formattedValue = formatter.format(Number(value));
  // Ensure trailing decimal separator, as the primary value is a live input,
  return value.endsWith(decimalSeparator) ? formattedValue + decimalSeparator : formattedValue;
}
