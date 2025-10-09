import { ReactNode, useState } from 'react';
import { NativeSyntheticEvent, TextLayoutEventData } from 'react-native';

import { decimalSeparator } from '@/features/swap/swap.utils';

import { Currency } from '@leather.io/models';
import { Box, Text } from '@leather.io/ui/native';

const textOpticalAlignmentStyle = { paddingTop: 1, marginBottom: -1 };

const baseFontSize = 24;
const baseLineHeight = 36;
const baseGlyphHeight = 26;

interface PrimaryValueProps {
  value: string;
  invalid?: boolean;
  caret: ReactNode;
}

export function PrimaryValue({ value, caret }: PrimaryValueProps) {
  const [lineHeight, setLineHeight] = useState(baseLineHeight);

  function handleTextLayout(event: NativeSyntheticEvent<TextLayoutEventData>) {
    const line = event.nativeEvent.lines[0];
    if (!line) return;
    const { descender, capHeight } = line;
    const glyphHeight = Math.round(capHeight + descender);
    const changeRatio = glyphHeight / baseGlyphHeight;
    const newLineHeight = Math.round(baseLineHeight * changeRatio);
    setLineHeight(newLineHeight);
  }

  return (
    <Box
      height={baseLineHeight}
      flexDirection="row"
      alignItems="center"
      style={{ paddingRight: 2 }}
    >
      <Text
        color={value === '0' ? 'ink.text-subdued' : 'ink.text-primary'}
        variant="heading02"
        fontSize={baseFontSize}
        lineHeight={lineHeight}
        style={textOpticalAlignmentStyle}
        numberOfLines={1}
        adjustsFontSizeToFit
        allowFontScaling={false}
        onTextLayout={handleTextLayout}
      >
        {value}
      </Text>
      {caret}
    </Box>
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
