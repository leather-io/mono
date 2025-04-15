import { forwardRef } from 'react';
import { type ViewProps } from 'react-native';

import { type BoxProps as RestyleBoxProps, createBox } from '@shopify/restyle';

import { type Theme } from '../../theme-native';

const BaseBox = createBox<Theme>();
export type BoxProps = ViewProps & RestyleBoxProps<Theme>;

export const Box = forwardRef<any, BoxProps>((props, ref) => {
  return <BaseBox {...props} ref={ref} />;
});

Box.displayName = 'Box';
