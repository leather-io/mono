import { useWindowDimensions } from 'react-native';

import { BoxProps } from '@shopify/restyle';

import { Box, Theme } from '@leather.io/ui/native';

export function Divider(props: BoxProps<Theme>) {
  const { width } = useWindowDimensions();

  return <Box alignSelf="center" bg="ink.border-transparent" height={1} width={width} {...props} />;
}
