import { useState } from 'react';
import { NativeSyntheticEvent, TextLayoutEventData } from 'react-native';

import { InputCurrencyMode } from '@/utils/types';

import { CryptoCurrency, QuoteCurrency } from '@leather.io/models';
import { Box, Text, Theme } from '@leather.io/ui/native';

const initialLineHeight = 44;
const topOffsetRatio = 0.27;

interface AmountFieldPrimaryValueProps {
  color: keyof Theme['colors'];
  value: string;
  locale: string;
  inputCurrencyMode: InputCurrencyMode;
  cryptoCurrency: CryptoCurrency;
  quoteCurrency: QuoteCurrency;
}

export function AmountFieldPrimaryValue({ value, color }: AmountFieldPrimaryValueProps) {
  const [lineHeight, setLineHeight] = useState(initialLineHeight);

  function handleTextLayout(event: NativeSyntheticEvent<TextLayoutEventData>) {
    const line = event.nativeEvent.lines[0];
    if (line) setLineHeight(line.ascender);
  }

  return (
    <Box flexGrow={1} flexShrink={1} overflow="hidden" height={initialLineHeight}>
      <Text
        color={color}
        allowFontScaling={false}
        variant="heading02"
        numberOfLines={1}
        adjustsFontSizeToFit
        onTextLayout={handleTextLayout}
        style={{
          marginTop: -Math.round(lineHeight * topOffsetRatio),
          paddingTop: 0,
          // Unset fixed line height to prevent onTextLayout from misreporting measurements.
          lineHeight: undefined,
        }}
      >
        {value}
      </Text>
    </Box>
  );
}
