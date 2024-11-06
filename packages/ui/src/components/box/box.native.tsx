import { BoxProps as RestyleBoxProps, createBox } from '@shopify/restyle';

import { type Theme } from '../../theme-native';

export const Box = createBox<Theme>();
export type BoxProps = RestyleBoxProps<Theme>;
