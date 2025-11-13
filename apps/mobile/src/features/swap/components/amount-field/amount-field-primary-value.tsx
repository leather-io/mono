import { ReactNode, useState } from 'react';
import { NativeSyntheticEvent, TextLayoutEventData, TextStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { decimalSeparator } from '@/features/swap/swap.utils';

import { Currency } from '@leather.io/models';
import { Box, Text } from '@leather.io/ui/native';

const textOpticalAlignmentStyle = { paddingTop: 1, marginBottom: -1 };

const baseFontSize = 24;
const baseLineHeight = 32;
const baseGlyphHeight = 26;

const AnimatedText = Animated.createAnimatedComponent(Text);

interface PrimaryValueProps {
  value: string;
  caret: ReactNode;
  animatedTextStyle?: TextStyle | { color: string };
}

export function PrimaryValue({ value, caret, animatedTextStyle }: PrimaryValueProps) {
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
      <AnimatedText
        fontFamily="MarchePro-Super"
        fontSize={baseFontSize}
        lineHeight={lineHeight}
        style={[textOpticalAlignmentStyle, animatedTextStyle]}
        numberOfLines={1}
        adjustsFontSizeToFit
        allowFontScaling={false}
        onTextLayout={handleTextLayout}
      >
        {value}
      </AnimatedText>
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
