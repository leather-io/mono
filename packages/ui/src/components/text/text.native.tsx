import { type ElementRef, forwardRef } from 'react';
import { type TextProps as RNTexProps } from 'react-native';

import { type TextProps as RestyleTextProps, createText } from '@shopify/restyle';

import { Theme } from '../../theme-native';

const RestyleText = createText<Theme>();

type TextElement = ElementRef<typeof RestyleText>;
export type TextProps = RNTexProps & RestyleTextProps<Theme>;

export const Text = forwardRef<TextElement, TextProps>((props, ref) => {
  return <RestyleText ref={ref} color="ink.text-primary" {...props} />;
});
