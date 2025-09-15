import { BaseTheme, BoxProps } from '@shopify/restyle';

import { Box, Pressable, Theme } from '../../../../native';

interface CollectibleCardProps<Theme extends BaseTheme> extends BoxProps<Theme> {
  children: React.ReactNode;
  height?: number;
  onPress?: () => void;
}

export function CollectibleCard({
  children,
  height = 200,
  onPress,
  ...props
}: CollectibleCardProps<Theme>) {
  return (
    <Box width="auto" height={height} overflow="hidden" {...props}>
      <Pressable onPress={onPress}>{children}</Pressable>
    </Box>
  );
}
