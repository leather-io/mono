import { useWindowDimensions } from 'react-native';

import { Box, type BoxProps } from '@leather.io/ui/native';

export interface DividerProps extends BoxProps {
  fullBleed?: boolean;
}

export function Divider({ fullBleed, ...boxProps }: DividerProps) {
  const { width: windowWidth } = useWindowDimensions();
  const width = fullBleed ? windowWidth : '100%';

  return (
    <Box alignSelf="center" bg="ink.border-transparent" height={1} width={width} {...boxProps} />
  );
}
