import { type ElementRef, forwardRef } from 'react';
import { type TextProps as RNTexProps } from 'react-native';

import { type TextProps as RestyleTextProps, createText } from '@shopify/restyle';

import { Theme } from '../../theme-native';

const RestyleText = createText<Theme>();

type TextElement = ElementRef<typeof RestyleText>;
export type TextProps = RNTexProps & RestyleTextProps<Theme>;

// Manually adjust vertical centering of text affected by incorrect rendering of react-native:
// https://github.com/facebook/react-native/issues/29507
//
// This is currently the only low-cost, better-than-nothing solution with effectively 0 runtime overhead.
// It is intentionally overrideable: passing paddingTop/marginBottom will negate the effect of the adjustment,
// reverting that particular usage from better to nothing.
function getAdjustedTextStyle(variant: string | undefined) {
  if (!variant) {
    return;
  }

  return {
    display02: { paddingTop: 14, marginBottom: -14 },
    heading01: { paddingTop: 5, marginBottom: -5 },
    heading02: { paddingTop: 6, marginBottom: -6 },
    heading03: { paddingTop: 3, marginBottom: -3 },
  }[variant];
}

export const Text = forwardRef<TextElement, TextProps>(({ style, ...rest }, ref) => {
  const adjustmentStyle = getAdjustedTextStyle(rest.variant);

  return (
    <RestyleText ref={ref} color="ink.text-primary" style={[adjustmentStyle, style]} {...rest} />
  );
});

Text.displayName = 'Text';
