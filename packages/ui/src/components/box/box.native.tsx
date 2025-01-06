import { type ViewProps } from 'react-native';

import { type BoxProps as RestyleBoxProps, createBox } from '@shopify/restyle';

import { type Theme } from '../../theme-native';

export const Box = createBox<Theme>();
export type BoxProps = ViewProps & RestyleBoxProps<Theme>;
