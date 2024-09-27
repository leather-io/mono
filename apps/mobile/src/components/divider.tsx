import { BoxProps } from '@shopify/restyle';

import { Box, Theme } from '@leather.io/ui/native';

export function Divider(props: BoxProps<Theme>) {
  return <Box bg="ink.border-transparent" height={1} width="100%" {...props} />;
}
