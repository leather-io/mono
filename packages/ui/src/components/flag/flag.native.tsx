import { ViewStyle } from 'react-native';

import { ResponsiveValue } from '@shopify/restyle';

import { Theme } from '../../theme-native';
import { Box } from '../box/box.native';
import type { FlagAlignment } from './flag.shared';

export interface FlagProps {
  align?: FlagAlignment;
  children: React.ReactNode;
  img?: React.ReactNode;
  reverse?: boolean;
  spacing?: ResponsiveValue<keyof Theme['spacing'], Theme['breakpoints']>;
  boxProps?: ViewStyle;
}

const getFlagAlignment = (align: FlagAlignment) => {
  switch (align) {
    case 'top':
      return 'flex-start';
    case 'middle':
      return 'center';
    case 'bottom':
      return 'flex-end';
  }
};

export function Flag({
  align = 'middle',
  img,
  children,
  reverse = false,
  spacing = '3',
  boxProps = {},
}: FlagProps) {
  return (
    <Box
      flex={1}
      flexDirection={reverse ? 'row-reverse' : 'row'}
      alignItems={getFlagAlignment(align)}
      style={[boxProps]}
    >
      <Box flex={1} marginLeft={reverse ? spacing : '0'} marginRight={!reverse ? spacing : '0'}>
        {img}
      </Box>
      <Box flex={1}>{children}</Box>
    </Box>
  );
}
