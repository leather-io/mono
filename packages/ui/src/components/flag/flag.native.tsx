import { BoxProps, ResponsiveValue } from '@shopify/restyle';

import { assertUnreachable } from '@leather.io/utils';

import { Theme } from '../../theme-native';
import { Box } from '../box/box.native';
import type { FlagAlignment } from './flag.shared';

const getFlagAlignment = (align: FlagAlignment) => {
  switch (align) {
    case 'top':
      return 'flex-start';
    case 'middle':
      return 'center';
    case 'bottom':
      return 'flex-end';
    default:
      assertUnreachable(align);
  }
};

export interface FlagProps extends BoxProps<Theme> {
  align?: FlagAlignment;
  children: React.ReactNode;
  img?: React.ReactNode;
  reverse?: boolean;
  spacing?: ResponsiveValue<keyof Theme['spacing'], Theme['breakpoints']>;
}
export function Flag({
  align = 'middle',
  children,
  img,
  reverse = false,
  spacing = '3',
  ...props
}: FlagProps) {
  return (
    <Box
      flex={1}
      flexDirection={reverse ? 'row-reverse' : 'row'}
      alignItems={getFlagAlignment(align)}
      {...props}
    >
      <Box marginLeft={reverse ? spacing : '0'} marginRight={!reverse ? spacing : '0'}>
        {img}
      </Box>
      <Box flex={1}>{children}</Box>
    </Box>
  );
}
