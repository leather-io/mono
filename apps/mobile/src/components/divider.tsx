import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';

import { BoxProps } from '@shopify/restyle';

import { Box, Theme } from '@leather.io/ui/native';

const { width } = Dimensions.get('window');

export function Divider(props: BoxProps<Theme>) {
  const [screenWidth, setScreenWidth] = useState(width);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => subscription?.remove();
  });

  return (
    <Box alignSelf="center" bg="ink.border-transparent" height={1} width={screenWidth} {...props} />
  );
}
