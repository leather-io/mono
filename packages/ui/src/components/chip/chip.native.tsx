import { BoxProps } from '@shopify/restyle';

import { Box, Text, Theme } from '../../../native';

interface ChipProps extends BoxProps<Theme> {
  label: string | number;
}

export function Chip({ label, ...rest }: ChipProps) {
  return (
    <Box
      backgroundColor="ink.component-background-default"
      borderRadius="xs"
      paddingLeft="1"
      paddingRight="1"
      paddingTop="0" // says 2px in figma but no token for that
      paddingBottom="0" // says 2px in figma but no token for that
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap="3" // 12px - says 10px in figma but no token for that
      {...rest}
    >
      <Text variant="label02">{label}</Text>
    </Box>
  );
}
