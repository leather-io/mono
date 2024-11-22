import { useState } from 'react';
import { NativeSyntheticEvent, TextLayoutEventData } from 'react-native';

import { Box, Text, TextProps, Theme } from '@leather.io/ui/native';

const maxFontSize = 44;
const lineHeightRatio = 1;

const commonTextProps: TextProps = {
  variant: 'heading02',
  fontVariant: ['tabular-nums'],
  letterSpacing: 1,
};

interface TextMeasurementProxyProps {
  value: string;
  textProps: TextProps;
  onFontSizeChange(fontSize: number): void;
}

// The Text component's `adjustFontSizeTofit` is not animatable. It also causes text to shift
// due to dynamic positioning issue: https://github.com/facebook/react-native/issues/29507
// Use an invisible placeholder to extract the dynamic font size set by `adjustFontSizeToFit`
// as the text changes during typing.
function TextMeasurementProxy({ value, textProps, onFontSizeChange }: TextMeasurementProxyProps) {
  const handleLayout = (event: NativeSyntheticEvent<TextLayoutEventData>) => {
    const line = event.nativeEvent.lines[0];
    if (line) {
      onFontSizeChange(line.ascender);
    }
  };

  return (
    <Text
      variant="heading02"
      fontVariant={['tabular-nums']}
      letterSpacing={1}
      onTextLayout={handleLayout}
      adjustsFontSizeToFit
      numberOfLines={1}
      aria-hidden={true}
      style={{
        flexGrow: 1,
        opacity: 0,
      }}
      {...textProps}
    >
      {value}
    </Text>
  );
}

interface AmountFieldPrimaryValueProps {
  color: keyof Theme['colors'];
  children: string;
}

export function AmountFieldPrimaryValue({ children, color }: AmountFieldPrimaryValueProps) {
  const [dynamicFontSize, setDynamicFontSize] = useState(maxFontSize);
  // Maintain the relative lineHeight to prevent text shifting down as font size decreases
  const staticLineHeight = maxFontSize * lineHeightRatio;
  const dynamicLineHeight = dynamicFontSize * lineHeightRatio;

  return (
    <Box height={staticLineHeight} flexShrink={1}>
      <Box flexDirection="row" position="absolute" top={3}>
        {children.split('').map((character, index) => (
          <Text
            color={color}
            key={index}
            style={{ fontSize: dynamicFontSize, lineHeight: dynamicLineHeight }}
            {...commonTextProps}
          >
            {character}
          </Text>
        ))}
      </Box>
      <TextMeasurementProxy
        value={children}
        onFontSizeChange={setDynamicFontSize}
        textProps={commonTextProps}
      />
    </Box>
  );
}
